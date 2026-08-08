export type Category = 'work' | 'study' | 'projects'

export type Priority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  category: Category
  tags: string[]
  priority: Priority
  plannedSeconds: number
  timeSpentSeconds: number
  createdAt: number
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

/** A quick-captured idea, not yet turned into a trackable task (no category/duration). */
export interface BacklogItem {
  id: string
  title: string
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
  projects: 'Projects',
}

export const DEFAULT_TAGS: string[] = ['picslctr', 'productivity', 'portfolio']

export const PRIORITIES: Priority[] = ['low', 'medium', 'high']

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}
