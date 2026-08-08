import type { BlockrState, Category } from '../types'
import { CATEGORIES } from '../types'
import { weekTotals } from '../lib/derive'
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
  const totals = weekTotals(state, now)

  return (
    <div className="flex flex-col gap-3">
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
