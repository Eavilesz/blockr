import { useCallback, useEffect, useRef, useState } from 'react'
import type { BlockrState, Category, Priority, Task } from '../types'
import { DEFAULT_TAGS } from '../types'
import { genId } from '../lib/id'
import { dateStr } from '../lib/time'
import { supabase } from '../lib/supabaseClient'

const SAVE_DEBOUNCE_MS = 800

function defaultState(): BlockrState {
  return {
    tasks: [],
    sessions: [],
    goals: [],
    running: null,
    backlog: [],
    tags: DEFAULT_TAGS,
  }
}

/** Closes out the currently running timer: caps progress at plannedSeconds, records a
 *  session for the elapsed chunk, and clears `running`. Shared by manual pause and
 *  tick-driven auto-complete so both paths behave identically. */
function finalizeRunning(state: BlockrState, nowMs: number): BlockrState {
  const running = state.running
  if (!running) return state
  const task = state.tasks.find((t) => t.id === running.taskId)
  if (!task) return { ...state, running: null }

  const elapsed = Math.max(0, Math.floor((nowMs - running.startedAt) / 1000))
  const cappedSpent = Math.min(task.timeSpentSeconds + elapsed, task.plannedSeconds)
  const sessionDuration = cappedSpent - task.timeSpentSeconds

  const tasks = state.tasks.map((t) =>
    t.id === task.id ? { ...t, timeSpentSeconds: cappedSpent } : t,
  )
  const sessions =
    sessionDuration > 0
      ? [
          ...state.sessions,
          {
            id: genId(),
            taskId: task.id,
            category: task.category,
            date: dateStr(new Date(nowMs)),
            durationSeconds: sessionDuration,
          },
        ]
      : state.sessions

  return { ...state, tasks, sessions, running: null }
}

function buildTask(
  title: string,
  category: Category,
  tags: string[],
  priority: Priority,
  plannedSeconds: number,
): Task {
  return {
    id: genId(),
    title: title.trim(),
    category,
    tags,
    priority,
    plannedSeconds,
    timeSpentSeconds: 0,
    createdAt: Date.now(),
  }
}

/** `userId` is null while signed out. State lives in Supabase (table `blockr_state`,
 *  one JSON row per user) — this hook fetches it on sign-in and debounce-saves every
 *  change back, so multiple devices stay in sync a beat after each edit. */
export function useBlockrState(userId: string | null) {
  const [state, setState] = useState<BlockrState>(defaultState)
  const [now, setNow] = useState(() => Date.now())
  const [loading, setLoading] = useState(() => Boolean(userId && supabase))
  const skipNextSave = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset local state synchronously during render when the signed-in user changes
  // (sign in/out) — adjusting state from a prop change belongs in render, not an effect.
  const [prevUserId, setPrevUserId] = useState(userId)
  if (prevUserId !== userId) {
    setPrevUserId(userId)
    setState(defaultState())
    setLoading(Boolean(userId && supabase))
  }

  // Fetch this user's state once signed in.
  useEffect(() => {
    if (!userId || !supabase) return
    let cancelled = false
    supabase
      .from('blockr_state')
      .select('state')
      .eq('user_id', userId)
      .maybeSingle()
      .then(async ({ data, error }) => {
        if (cancelled) return
        if (error) console.error('Failed to load blockr state:', error.message)

        skipNextSave.current = true
        if (data?.state) {
          setState(data.state as BlockrState)
        } else {
          const fresh = defaultState()
          setState(fresh)
          const { error: insertError } = await supabase!
            .from('blockr_state')
            .insert({ user_id: userId, state: fresh })
          if (insertError) console.error('Failed to seed blockr state:', insertError.message)
        }
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  // Debounce-persist every change back to Supabase, skipping the write that would
  // otherwise immediately echo back the state we just loaded.
  useEffect(() => {
    if (!userId || !supabase) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      supabase!
        .from('blockr_state')
        .upsert({ user_id: userId, state })
        .then(({ error }) => {
          if (error) console.error('Failed to save blockr state:', error.message)
        })
    }, SAVE_DEBOUNCE_MS)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [state, userId])

  // While a timer runs, tick every second: refresh `now` for live displays, and
  // auto-complete the task the instant it reaches its planned duration.
  const runningTaskId = state.running?.taskId
  const runningStartedAt = state.running?.startedAt
  useEffect(() => {
    if (!runningTaskId || runningStartedAt === undefined) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      setState((prev) => {
        if (!prev.running) return prev
        const task = prev.tasks.find((tk) => tk.id === prev.running!.taskId)
        if (!task) return { ...prev, running: null }
        const elapsed = Math.floor((t - prev.running.startedAt) / 1000)
        const reachedPlan = task.timeSpentSeconds + elapsed >= task.plannedSeconds
        return reachedPlan ? finalizeRunning(prev, t) : prev
      })
    }, 1000)
    return () => clearInterval(id)
  }, [runningTaskId, runningStartedAt])

  const addTask = useCallback(
    (
      title: string,
      category: Category,
      tags: string[],
      priority: Priority,
      plannedSeconds: number,
    ) => {
      setState((prev) => ({
        ...prev,
        tasks: [...prev.tasks, buildTask(title, category, tags, priority, plannedSeconds)],
      }))
    },
    [],
  )

  /** Edits an existing task's fields in place. `timeSpentSeconds` is left untouched so
   *  progress already logged survives the edit; if the new plannedSeconds is now below
   *  what's already spent, the task simply reads as completed. */
  const updateTask = useCallback(
    (
      taskId: string,
      title: string,
      category: Category,
      tags: string[],
      priority: Priority,
      plannedSeconds: number,
    ) => {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? { ...t, title: title.trim(), category, tags, priority, plannedSeconds }
            : t,
        ),
      }))
    },
    [],
  )

  /** Adds extra planned time to a task — the way to keep working past a completed plan
   *  without opening the edit form. */
  const extendTask = useCallback((taskId: string, extraSeconds: number) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, plannedSeconds: t.plannedSeconds + extraSeconds } : t,
      ),
    }))
  }, [])

  const deleteTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
      sessions: prev.sessions.filter((s) => s.taskId !== taskId),
      running: prev.running?.taskId === taskId ? null : prev.running,
    }))
  }, [])

  const startTask = useCallback((taskId: string) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId)
      if (!task || task.timeSpentSeconds >= task.plannedSeconds) return prev
      if (prev.running?.taskId === taskId) return prev

      const base = prev.running ? finalizeRunning(prev, Date.now()) : prev
      return { ...base, running: { taskId, startedAt: Date.now() } }
    })
  }, [])

  const pauseRunning = useCallback(() => {
    setState((prev) => (prev.running ? finalizeRunning(prev, Date.now()) : prev))
  }, [])

  const setGoal = useCallback((category: Category, targetHours: number) => {
    setState((prev) => {
      const existing = prev.goals.find((g) => g.category === category)
      const goals = existing
        ? prev.goals.map((g) => (g.category === category ? { ...g, targetHours } : g))
        : [...prev.goals, { id: genId(), category, targetHours }]
      return { ...prev, goals }
    })
  }, [])

  const addTagOption = useCallback((tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    setState((prev) =>
      prev.tags.includes(trimmed) ? prev : { ...prev, tags: [...prev.tags, trimmed] },
    )
  }, [])

  const addBacklogItem = useCallback((title: string, category: Category, priority: Priority) => {
    const trimmed = title.trim()
    if (!trimmed) return
    setState((prev) => ({
      ...prev,
      backlog: [
        ...prev.backlog,
        { id: genId(), title: trimmed, category, priority, createdAt: Date.now() },
      ],
    }))
  }, [])

  const deleteBacklogItem = useCallback((id: string) => {
    setState((prev) => ({ ...prev, backlog: prev.backlog.filter((b) => b.id !== id) }))
  }, [])

  /** Turns a backlog idea into a real trackable task and removes it from the backlog,
   *  in one atomic update. `title` comes from the promote form, not the stored item,
   *  since the user may tweak it while filling in category/duration. */
  const promoteBacklogItem = useCallback(
    (
      backlogId: string,
      title: string,
      category: Category,
      tags: string[],
      priority: Priority,
      plannedSeconds: number,
    ) => {
      setState((prev) => ({
        ...prev,
        tasks: [...prev.tasks, buildTask(title, category, tags, priority, plannedSeconds)],
        backlog: prev.backlog.filter((b) => b.id !== backlogId),
      }))
    },
    [],
  )

  return {
    state,
    now,
    loading,
    addTask,
    updateTask,
    extendTask,
    deleteTask,
    startTask,
    pauseRunning,
    setGoal,
    addTagOption,
    addBacklogItem,
    deleteBacklogItem,
    promoteBacklogItem,
  }
}
