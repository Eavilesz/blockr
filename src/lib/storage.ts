import type { Theme } from '../types'

// Task/backlog/goal data now lives in Supabase (see hooks/useBlockrState.ts) so it
// syncs across devices. Only the local, per-browser theme preference stays here.
const THEME_KEY = 'blockr-theme'

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
