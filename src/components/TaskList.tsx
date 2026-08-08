import type { Running, Task } from '../types'
import type { CategoryFilterValue } from './CategoryFilter'
import { TaskCard } from './TaskCard'

export function TaskList({
  tasks,
  filter,
  running,
  now,
  onStart,
  onPause,
  onDelete,
}: {
  tasks: Task[]
  filter: CategoryFilterValue
  running: Running | null
  now: number
  onStart: (id: string) => void
  onPause: () => void
  onDelete: (id: string) => void
}) {
  const filtered = tasks.filter((t) => filter === 'all' || t.category === filter)
  const sorted = [...filtered].sort((a, b) => {
    const aRunning = running?.taskId === a.id ? 1 : 0
    const bRunning = running?.taskId === b.id ? 1 : 0
    if (aRunning !== bRunning) return bRunning - aRunning
    return b.createdAt - a.createdAt
  })

  if (sorted.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">
        No tasks yet. Add one above to start tracking time.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          running={running}
          now={now}
          onStart={onStart}
          onPause={onPause}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
