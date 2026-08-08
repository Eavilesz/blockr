import { useState } from 'react'
import { Modal } from './Modal'
import type { Category, Priority } from '../types'
import { CATEGORIES, CATEGORY_LABELS, PRIORITIES, PRIORITY_LABELS } from '../types'
import { categoryStyles } from '../lib/categoryStyles'
import { priorityStyles } from '../lib/priorityStyles'

export function QuickCaptureModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (title: string, category: Category, priority: Priority) => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('work')
  const [priority, setPriority] = useState<Priority>('medium')

  function handleClose() {
    setTitle('')
    setCategory('work')
    setPriority('medium')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed, category, priority)
    setTitle('')
    setCategory('work')
    setPriority('medium')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Quick idea">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What should you work on later?"
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
                aria-pressed={active}
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

        <div className="flex gap-2">
          {PRIORITIES.map((p) => {
            const active = priority === p
            const styles = priorityStyles[p]
            return (
              <button
                key={p}
                type="button"
                aria-pressed={active}
                onClick={() => setPriority(p)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  active
                    ? `${styles.border} ${styles.bgSoft} ${styles.text}`
                    : 'border-border text-text-muted hover:text-text'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
                {PRIORITY_LABELS[p]}
              </button>
            )
          })}
        </div>

        <button
          type="submit"
          disabled={!title.trim()}
          className="shrink-0 rounded-lg bg-text px-3 py-2 text-sm font-medium text-bg disabled:opacity-40"
        >
          Save
        </button>
      </form>
    </Modal>
  )
}
