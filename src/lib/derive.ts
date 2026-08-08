import type { BlockrState, Category, Running, Task } from '../types'
import { currentWeekRange, dateStr, isInWeek } from './time'

/** Time spent on a task right now, including any live in-progress run, capped at plannedSeconds. */
export function effectiveSpent(task: Task, running: Running | null, now: number): number {
  if (!running || running.taskId !== task.id) return task.timeSpentSeconds
  const elapsed = Math.floor((now - running.startedAt) / 1000)
  return Math.min(task.timeSpentSeconds + Math.max(elapsed, 0), task.plannedSeconds)
}

export function isCompleted(task: Task): boolean {
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

/** Seconds tracked per category this week (Mon-Sun), including the live running session. */
export function weekTotals(state: BlockrState, now: number): Record<Category, number> {
  const week = currentWeekRange(new Date(now))
  const totals = zeroTotals()
  for (const s of state.sessions) {
    if (isInWeek(s.date, week)) totals[s.category] += s.durationSeconds
  }
  const live = liveContribution(state, now)
  if (live) totals[live.category] += live.seconds
  return totals
}
