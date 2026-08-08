import { useState } from 'react'
import { Modal } from './Modal'

export function QuickCaptureModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (title: string) => void
}) {
  const [title, setTitle] = useState('')

  function handleClose() {
    setTitle('')
    onClose()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setTitle('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Quick idea">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What should you work on later?"
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-muted"
        />
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
