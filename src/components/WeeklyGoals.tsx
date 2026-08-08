import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { BlockrState, Category } from '../types'
import { CATEGORIES } from '../types'
import { weekTotals } from '../lib/derive'
import { formatWeekRangeLabel, workWeekRange } from '../lib/time'
import { GoalCard } from './GoalCard'

export function WeeklyGoals({
  state,
  now,
  onSetGoal,
}: {
  state: BlockrState
  now: number
  onSetGoal: (category: Category, targetHours: number) => void
}) {
  const [weekOffset, setWeekOffset] = useState(0)
  const totals = weekTotals(state, now, weekOffset)
  const range = workWeekRange(new Date(now), weekOffset)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setWeekOffset((w) => w - 1)}
          aria-label="Previous week"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-text">
            {weekOffset === 0 ? 'This week' : formatWeekRangeLabel(range)}
          </span>
          {weekOffset === 0 && (
            <span className="text-xs text-text-muted">{formatWeekRangeLabel(range)}</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setWeekOffset((w) => w + 1)}
          aria-label="Next week"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted hover:text-text"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {CATEGORIES.map((c) => (
        <GoalCard
          key={c}
          category={c}
          trackedSeconds={totals[c]}
          targetHours={state.goals.find((g) => g.category === c)?.targetHours}
          onSetGoal={(hours) => onSetGoal(c, hours)}
        />
      ))}
    </div>
  )
}
