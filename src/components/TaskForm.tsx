import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Category } from '../types'
import { CATEGORIES, CATEGORY_LABELS, DEFAULT_TAGS } from '../types'
import { categoryStyles } from '../lib/categoryStyles'

const QUICK_PICKS_MIN = [30, 60, 90]

export function TaskForm({
  onAdd,
  initialTitle = '',
  availableTags = DEFAULT_TAGS,
  onAddTagOption,
}: {
  onAdd: (title: string, category: Category, tags: string[], plannedSeconds: number) => void
  initialTitle?: string
  availableTags?: string[]
  onAddTagOption?: (tag: string) => void
}) {
  const [title, setTitle] = useState(initialTitle)
  const [category, setCategory] = useState<Category>('work')
  const [selectedTags, setSelectedTags] = useState<string[]>(DEFAULT_TAGS)
  const [plannedMinutes, setPlannedMinutes] = useState<number>(30)
  const [addingTag, setAddingTag] = useState(false)
  const [newTag, setNewTag] = useState('')

  const canSubmit = title.trim().length > 0 && plannedMinutes > 0

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  function handleCreateTag() {
    const trimmed = newTag.trim()
    if (!trimmed) {
      setAddingTag(false)
      return
    }
    if (!availableTags.includes(trimmed)) {
      onAddTagOption?.(trimmed)
    }
    setSelectedTags((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]))
    setNewTag('')
    setAddingTag(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onAdd(title, category, selectedTags, Math.round(plannedMinutes * 60))
    setTitle('')
    setSelectedTags(DEFAULT_TAGS)
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

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const active = selectedTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? 'border-text text-text'
                    : 'border-border text-text-muted hover:text-text'
                }`}
              >
                {tag}
              </button>
            )
          })}

          {addingTag ? (
            <span className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleCreateTag()
                  } else if (e.key === 'Escape') {
                    setAddingTag(false)
                    setNewTag('')
                  }
                }}
                onBlur={handleCreateTag}
                placeholder="New tag"
                className="w-24 rounded-full border border-border bg-bg px-3 py-1 text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-muted"
              />
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setAddingTag(true)}
              aria-label="Add new tag"
              className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs text-text-muted transition-colors hover:text-text"
            >
              <Plus size={12} />
              New tag
            </button>
          )}
        </div>
      </div>

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
