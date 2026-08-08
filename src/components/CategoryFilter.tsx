import type { Category } from '../types'
import { CATEGORIES, CATEGORY_LABELS } from '../types'
import { categoryStyles } from '../lib/categoryStyles'

export type CategoryFilterValue = Category | 'all'

export function CategoryFilter({
  value,
  onChange,
}: {
  value: CategoryFilterValue
  onChange: (v: CategoryFilterValue) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      <button
        type="button"
        onClick={() => onChange('all')}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
          value === 'all'
            ? 'border-text text-text'
            : 'border-border text-text-muted hover:text-text'
        }`}
      >
        All
      </button>
      {CATEGORIES.map((c) => {
        const active = value === c
        const styles = categoryStyles[c]
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              active
                ? `${styles.border} ${styles.text}`
                : 'border-border text-text-muted hover:text-text'
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        )
      })}
    </div>
  )
}
