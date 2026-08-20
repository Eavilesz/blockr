import type { Running, Task } from '../types'
import { PRIORITY_RANK } from '../types'
import type { CategoryFilterValue } from './CategoryFilter'
import { isCompleted } from '../lib/derive'
import { TaskCard } from './TaskCard'

export function TaskList({
  tasks,
  filter,
  showDone,
  running,
  now,
  onStart,
  onPause,
  onEdit,
  onExtend,
  onFinish,
  onDelete,
  onToggleChecklistItem,
}: {
  tasks: Task[]
  filter: CategoryFilterValue
  showDone: boolean
  running: Running | null
  now: number
  onStart: (id: string) => void
  onPause: () => void
  onEdit: (task: Task) => void
  onExtend: (id: string) => void
  onFinish: (id: string) => void
  onDelete: (id: string) => void
  onToggleChecklistItem: (taskId: string, itemId: string) => void
}) {
  const filtered = tasks.filter((t) => {
    if (filter !== 'all' && t.category !== filter) return false
    if (!showDone && isCompleted(t) && running?.taskId !== t.id) return false
    return true
  })
  // Running task always first, then open tasks by priority (high first) then newest,
  // with completed tasks pushed to the bottom so the active work stays in view.
  const sorted = [...filtered].sort((a, b) => {
    const aRunning = running?.taskId === a.id ? 1 : 0
    const bRunning = running?.taskId === b.id ? 1 : 0
    if (aRunning !== bRunning) return bRunning - aRunning

    const aDone = isCompleted(a) ? 1 : 0
    const bDone = isCompleted(b) ? 1 : 0
    if (aDone !== bDone) return aDone - bDone

    const byPriority = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]
    if (byPriority !== 0) return byPriority

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
          onEdit={onEdit}
          onExtend={onExtend}
          onFinish={onFinish}
          onDelete={onDelete}
          onToggleChecklistItem={onToggleChecklistItem}
        />
      ))}
    </div>
  )
}
