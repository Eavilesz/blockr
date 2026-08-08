import type { BacklogItem, BlockrState, Task, Theme } from '../types'
import { DEFAULT_TAGS } from '../types'

/** Tasks/backlog items saved before priority existed default to 'medium' on load. */
function withPriority<T extends { priority?: unknown }>(item: T): T & { priority: 'low' | 'medium' | 'high' } {
  const priority = item.priority === 'low' || item.priority === 'medium' || item.priority === 'high'
    ? item.priority
    : 'medium'
  return { ...item, priority }
}

/** Backlog items saved before category existed default to 'work' on load. */
function withCategory<T extends { category?: unknown }>(item: T): T & { category: 'work' | 'study' | 'projects' } {
  const category = item.category === 'work' || item.category === 'study' || item.category === 'projects'
    ? item.category
    : 'work'
  return { ...item, category }
}

const STATE_KEY = 'blockr-state'
const THEME_KEY = 'blockr-theme'

const emptyState: BlockrState = {
  tasks: [],
  sessions: [],
  goals: [],
  running: null,
  backlog: [],
  tags: DEFAULT_TAGS,
}

export function loadState(): BlockrState {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw)
    return {
      tasks: Array.isArray(parsed.tasks) ? (parsed.tasks as Task[]).map(withPriority) : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      running: parsed.running ?? null,
      backlog: Array.isArray(parsed.backlog)
        ? (parsed.backlog as BacklogItem[]).map(withPriority).map(withCategory)
        : [],
      tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags : DEFAULT_TAGS,
    }
  } catch {
    return emptyState
  }
}

export function saveState(state: BlockrState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (e.g. private mode quota) — fail silently
  }
}

export function loadTheme(): Theme {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    return raw === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // ignore
  }
}
