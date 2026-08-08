import type { BlockrState } from '../types'
import { CATEGORIES, CATEGORY_LABELS } from '../types'
import { todayTotals } from '../lib/derive'
import { formatStopwatch } from '../lib/time'
import { categoryStyles } from '../lib/categoryStyles'

export function TodaySummary({ state, now }: { state: BlockrState; now: number }) {
  const totals = todayTotals(state, now)

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">Today</p>
      <div className="grid grid-cols-3 gap-3">
        {CATEGORIES.map((c) => (
          <div key={c} className="flex flex-col gap-1">
            <span className={`flex items-center gap-1.5 text-xs ${categoryStyles[c].text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${categoryStyles[c].dot}`} />
              {CATEGORY_LABELS[c]}
            </span>
            <span className="font-mono text-sm text-text">{formatStopwatch(totals[c])}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
