import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Category } from '../types'
import { CATEGORIES, CATEGORY_LABELS } from '../types'
import { categoryStyles } from '../lib/categoryStyles'

const QUICK_PICKS_MIN = [30, 60, 90]

export function TaskForm({
  onAdd,
}: {
  onAdd: (title: string, category: Category, tags: string[], plannedSeconds: number) => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('work')
  const [tagsInput, setTagsInput] = useState('')
  const [plannedMinutes, setPlannedMinutes] = useState<number>(30)

  const canSubmit = title.trim().length > 0 && plannedMinutes > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onAdd(title, category, tags, Math.round(plannedMinutes * 60))
    setTitle('')
    setTagsInput('')
    setPlannedMinutes(30)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What are you working on?"
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-muted"
      />

      <div className="flex gap-2">
        {CATEGORIES.map((c) => {
          const active = category === c
          const styles = categoryStyles[c]
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                active
                  ? `${styles.border} ${styles.bgSoft} ${styles.text}`
                  : 'border-border text-text-muted hover:text-text'
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          )
        })}
      </div>

      <input
        type="text"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        placeholder="Tags (comma-separated, e.g. picslctr, portfolio)"
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-muted"
      />

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {QUICK_PICKS_MIN.map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => setPlannedMinutes(min)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition-colors ${
                plannedMinutes === min
                  ? 'border-text text-text'
                  : 'border-border text-text-muted hover:text-text'
              }`}
            >
              {min < 60 ? `${min}m` : min === 60 ? '1h' : '1h 30'}
            </button>
          ))}
          <input
            type="number"
            min={1}
            value={plannedMinutes}
            onChange={(e) => setPlannedMinutes(Number(e.target.value))}
            placeholder="Custom"
            className="w-20 rounded-lg border border-border bg-bg px-2 py-2 text-center text-sm font-mono text-text focus:outline-none focus:ring-1 focus:ring-text-muted"
          />
        </div>
        <span className="text-xs text-text-muted">minutes</span>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-text px-3 py-2 text-sm font-medium text-bg transition-opacity disabled:opacity-40"
      >
        <Plus size={16} />
        Add task
      </button>
    </form>
  )
}
