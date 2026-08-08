import { useCallback, useEffect, useState } from 'react'
import type { BlockrState, Category, Task } from '../types'
import { loadState, saveState } from '../lib/storage'
import { genId } from '../lib/id'
import { dateStr } from '../lib/time'

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

export function useBlockrState() {
  const [state, setState] = useState<BlockrState>(loadState)
  const [now, setNow] = useState(() => Date.now())

  // Persist on every change.
  useEffect(() => {
    saveState(state)
  }, [state])

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
    (title: string, category: Category, tags: string[], plannedSeconds: number) => {
      const task: Task = {
        id: genId(),
        title: title.trim(),
        category,
        tags,
        plannedSeconds,
        timeSpentSeconds: 0,
        createdAt: Date.now(),
      }
      setState((prev) => ({ ...prev, tasks: [...prev.tasks, task] }))
    },
    [],
  )

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

  return { state, now, addTask, deleteTask, startTask, pauseRunning, setGoal }
}
