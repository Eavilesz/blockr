import { useState } from 'react'
import type { Category } from '../types'
import { CATEGORY_LABELS } from '../types'
import { categoryStyles } from '../lib/categoryStyles'
import { formatHoursLabel, secondsToHours } from '../lib/time'

const QUICK_PICKS_HOURS = [3.5, 7, 15]

export function GoalCard({
  category,
  trackedSeconds,
  targetHours,
  onSetGoal,
}: {
  category: Category
  trackedSeconds: number
  targetHours: number | undefined
  onSetGoal: (hours: number) => void
}) {
  const [customHours, setCustomHours] = useState('')
  const styles = categoryStyles[category]
  const trackedHours = secondsToHours(trackedSeconds)
  const pct = targetHours ? Math.min(100, (trackedHours / targetHours) * 100) : 0

  function submitCustom(e: React.FormEvent) {
    e.preventDefault()
    const value = Number(customHours)
    if (value > 0) {
      onSetGoal(value)
      setCustomHours('')
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className={`flex items-center gap-1.5 text-sm font-medium ${styles.text}`}>
          <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
          {CATEGORY_LABELS[category]}
        </span>
        <span className="font-mono text-sm text-text-muted">
          {formatHoursLabel(trackedHours)} / {targetHours ? formatHoursLabel(targetHours) : '—'}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
        <div
          className={`h-full rounded-full ${styles.bg} transition-[width]`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        {QUICK_PICKS_HOURS.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => onSetGoal(h)}
            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
              targetHours === h
                ? `${styles.border} ${styles.bgSoft} ${styles.text}`
                : 'border-border text-text-muted hover:text-text'
            }`}
          >
            {formatHoursLabel(h)}
          </button>
        ))}
        <form onSubmit={submitCustom} className="flex items-center gap-1">
          <input
            type="number"
            min={0.5}
            step={0.5}
            value={customHours}
            onChange={(e) => setCustomHours(e.target.value)}
            placeholder="Custom"
            className="w-16 rounded-lg border border-border bg-bg px-2 py-1.5 text-center text-xs font-mono text-text focus:outline-none focus:ring-1 focus:ring-text-muted"
          />
          <button
            type="submit"
            className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-muted hover:text-text"
          >
            Set
          </button>
        </form>
      </div>
    </div>
  )
}
