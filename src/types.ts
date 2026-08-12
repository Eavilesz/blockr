export type Category = 'work' | 'study' | 'projects'

export type Priority = 'low' | 'medium' | 'high'

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  category: Category
  tags: string[]
  priority: Priority
  /** null means no timer was set — the task tracks elapsed time with no target and
   *  must be finished manually via `completed` instead of auto-completing. */
  plannedSeconds: number | null
  timeSpentSeconds: number
  /** Manually marked done. Always how untimed tasks finish; timed tasks are also
   *  considered complete once timeSpentSeconds reaches plannedSeconds (see isCompleted). */
  completed: boolean
  createdAt: number
  checklist: ChecklistItem[]
}

export interface Session {
  id: string
  taskId: string
  category: Category
  date: string // YYYY-MM-DD, local
  durationSeconds: number
}

export interface Goal {
  id: string
  category: Category
  targetHours: number
}

export interface Running {
  taskId: string
  startedAt: number // ms epoch, from Date.now()
}

/** A quick-captured idea, not yet turned into a trackable task (no duration yet). */
export interface BacklogItem {
  id: string
  title: string
  category: Category
  priority: Priority
  createdAt: number
}

export interface BlockrState {
  tasks: Task[]
  sessions: Session[]
  goals: Goal[]
  running: Running | null
  backlog: BacklogItem[]
  tags: string[]
}

export type Theme = 'dark' | 'light'

export const CATEGORIES: Category[] = ['work', 'study', 'projects']

export const CATEGORY_LABELS: Record<Category, string> = {
  work: 'Work',
  study: 'Study',
  projects: 'Build',
}

export const DEFAULT_TAGS: string[] = ['picslctr', 'productivity', 'portfolio']

export const PRIORITIES: Priority[] = ['low', 'medium', 'high']

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

/** Higher number = higher priority. Use to sort priority-first, e.g. `b - a`. */
export const PRIORITY_RANK: Record<Priority, number> = {
  low: 0,
  medium: 1,
  high: 2,
}
