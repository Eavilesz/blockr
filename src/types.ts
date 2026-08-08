export type Category = 'work' | 'study' | 'projects'

export interface Task {
  id: string
  title: string
  category: Category
  tags: string[]
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

export interface BlockrState {
  tasks: Task[]
  sessions: Session[]
  goals: Goal[]
  running: Running | null
}

export type Theme = 'dark' | 'light'

export const CATEGORIES: Category[] = ['work', 'study', 'projects']

export const CATEGORY_LABELS: Record<Category, string> = {
  work: 'Work',
  study: 'Study',
  projects: 'Projects',
}
