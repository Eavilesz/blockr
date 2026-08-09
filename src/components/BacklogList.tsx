import { CalendarPlus, X } from 'lucide-react'
import type { BacklogItem } from '../types'
import { CATEGORY_LABELS, PRIORITY_LABELS, PRIORITY_RANK } from '../types'
import { categoryStyles } from '../lib/categoryStyles'
import { priorityStyles } from '../lib/priorityStyles'

export function BacklogList({
  items,
  onMoveToToday,
  onDelete,
}: {
  items: BacklogItem[]
  onMoveToToday: (item: BacklogItem) => void
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
    <div className="flex flex-col gap-3">
      {sorted.map((item) => {
        const cStyles = categoryStyles[item.category]
        const pStyles = priorityStyles[item.priority]
        return (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-start gap-2">
              <span
                aria-label={`${item.category} task`}
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${cStyles.dot}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="min-w-0 flex-1 wrap-break-word text-sm font-medium text-text">
                    {item.title}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${pStyles.bgSoft} ${pStyles.text}`}
                  >
                    {PRIORITY_LABELS[item.priority]}
                  </span>
                </div>
                <span className={`text-xs ${cStyles.text}`}>{CATEGORY_LABELS[item.category]}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onMoveToToday(item)}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-text hover:bg-bg"
              >
                <CalendarPlus size={14} />
                Today
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
