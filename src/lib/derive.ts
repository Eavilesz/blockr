import type { BlockrState, Category, Running, Task } from '../types'
import { dateStr, isInWeek, workWeekRange } from './time'

/** Time spent on a task right now, including any live in-progress run. Capped at
 *  plannedSeconds for timed tasks; uncapped (counts up freely) for untimed ones. */
export function effectiveSpent(task: Task, running: Running | null, now: number): number {
  if (!running || running.taskId !== task.id) return task.timeSpentSeconds
  const elapsed = Math.max(0, Math.floor((now - running.startedAt) / 1000))
  if (task.plannedSeconds === null) return task.timeSpentSeconds + elapsed
  return Math.min(task.timeSpentSeconds + elapsed, task.plannedSeconds)
}

export function isCompleted(task: Task): boolean {
  if (task.completed) return true
  if (task.plannedSeconds === null) return false
  return task.timeSpentSeconds >= task.plannedSeconds
}

/** Seconds contributed by the currently running task that aren't saved as a session yet. */
function liveContribution(state: BlockrState, now: number): { category: Category; seconds: number } | null {
  if (!state.running) return null
  const task = state.tasks.find((t) => t.id === state.running!.taskId)
  if (!task) return null
  const spent = effectiveSpent(task, state.running, now)
  return { category: task.category, seconds: spent - task.timeSpentSeconds }
}

const zeroTotals = (): Record<Category, number> => ({ work: 0, study: 0, projects: 0 })

/** Seconds tracked per category today, including the live running session. */
export function todayTotals(state: BlockrState, now: number): Record<Category, number> {
  const today = dateStr(new Date(now))
  const totals = zeroTotals()
  for (const s of state.sessions) {
    if (s.date === today) totals[s.category] += s.durationSeconds
  }
  const live = liveContribution(state, now)
  if (live) totals[live.category] += live.seconds
  return totals
}

/** Seconds tracked per category in the week (Sun-Sat) containing `now`, shifted by
 *  `weekOffset` whole weeks. Includes the live running session only when that session's
 *  day falls inside the queried week. */
export function weekTotals(
  state: BlockrState,
  now: number,
  weekOffset = 0,
): Record<Category, number> {
  const week = workWeekRange(new Date(now), weekOffset)
  const totals = zeroTotals()
  for (const s of state.sessions) {
    if (isInWeek(s.date, week)) totals[s.category] += s.durationSeconds
  }
  const live = liveContribution(state, now)
  if (live && isInWeek(dateStr(new Date(now)), week)) totals[live.category] += live.seconds
  return totals
}
