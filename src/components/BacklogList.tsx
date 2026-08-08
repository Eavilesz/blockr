import { CalendarPlus, X } from 'lucide-react'
import type { BacklogItem } from '../types'
import { CATEGORY_LABELS, PRIORITY_LABELS, PRIORITY_RANK } from '../types'
import { categoryStyles } from '../lib/categoryStyles'
import { priorityStyles } from '../lib/priorityStyles'

export function BacklogList({
  items,
  onPlan,
  onDelete,
}: {
  items: BacklogItem[]
  onPlan: (item: BacklogItem) => void
  onDelete: (id: string) => void
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">
        No ideas saved yet. Use the lightbulb in the header to jot one down.
      </p>
    )
  }

  const sorted = [...items].sort((a, b) => {
    const byPriority = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]
    return byPriority !== 0 ? byPriority : b.createdAt - a.createdAt
  })

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((item) => {
        const cStyles = categoryStyles[item.category]
        const pStyles = priorityStyles[item.priority]
        return (
          <div
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-3"
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-sm text-text">
              <span
                aria-label={`${item.category} task`}
                className={`h-2 w-2 shrink-0 rounded-full ${cStyles.dot}`}
              />
              <span className="min-w-0 truncate">{item.title}</span>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${pStyles.bgSoft} ${pStyles.text}`}
              >
                {PRIORITY_LABELS[item.priority]}
              </span>
              <span className={`shrink-0 text-xs ${cStyles.text}`}>
                {CATEGORY_LABELS[item.category]}
              </span>
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onPlan(item)}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-text hover:bg-bg"
              >
                <CalendarPlus size={14} />
                Plan
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label="Discard idea"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:text-text"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
