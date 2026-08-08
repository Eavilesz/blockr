import { useEffect } from 'react'
import type { BlockrState } from '../types'
import { effectiveSpent } from '../lib/derive'
import { formatStopwatch } from '../lib/time'

const DEFAULT_TITLE = 'blockr'

/** Mirrors the running task's live elapsed time into the browser tab title,
 *  e.g. "00:30", so it's visible while the app is in a background tab. */
export function useTabTitle(state: BlockrState, now: number) {
  useEffect(() => {
    const task = state.running && state.tasks.find((t) => t.id === state.running!.taskId)
    document.title = task
      ? formatStopwatch(effectiveSpent(task, state.running, now))
      : DEFAULT_TITLE
  }, [state, now])

  // Restore the default title if the app unmounts mid-timer.
  useEffect(() => () => {
    document.title = DEFAULT_TITLE
  }, [])
}
