import { useState } from 'react'
import { Check, Pause, Play, Trash2 } from 'lucide-react'
import type { Running, Task } from '../types'
import { effectiveSpent, isCompleted } from '../lib/derive'
import { formatStopwatch } from '../lib/time'
import { categoryStyles } from '../lib/categoryStyles'
import { priorityStyles } from '../lib/priorityStyles'
import { PRIORITY_LABELS } from '../types'

export function TaskCard({
  task,
  running,
  now,
  onStart,
  onPause,
  onDelete,
}: {
  task: Task
  running: Running | null
  now: number
  onStart: (id: string) => void
  onPause: () => void
  onDelete: (id: string) => void
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const isRunning = running?.taskId === task.id
  const completed = isCompleted(task)
  const spent = effectiveSpent(task, running, now)
  const pct = task.plannedSeconds > 0 ? Math.min(100, (spent / task.plannedSeconds) * 100) : 0
  const styles = categoryStyles[task.category]
  const pStyles = priorityStyles[task.priority]

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-opacity ${
        completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${styles.dot}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p
                className={`truncate text-sm font-medium text-text ${
                  completed ? 'line-through' : ''
                }`}
              >
                {task.title}
              </p>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${pStyles.bgSoft} ${pStyles.text}`}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
            </div>
            {task.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-bg px-2 py-0.5 text-xs text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {completed && (
          <span className={`flex shrink-0 items-center gap-1 text-xs ${styles.text}`}>
            <Check size={14} />
            Completed
          </span>
        )}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
        <div
          className={`h-full rounded-full ${styles.bg} transition-[width]`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm text-text-muted">
          {formatStopwatch(spent)} / {formatStopwatch(task.plannedSeconds)}
        </span>

        <div className="flex items-center gap-2">
          {!completed &&
            (isRunning ? (
              <button
                type="button"
                onClick={onPause}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-text hover:bg-bg"
              >
                <Pause size={14} />
                Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStart(task.id)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-bg ${styles.bg}`}
              >
                <Play size={14} />
                {task.timeSpentSeconds > 0 ? 'Resume' : 'Start'}
              </button>
            ))}

          {confirmingDelete ? (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-text-muted">Delete?</span>
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="rounded-lg border border-border px-2 py-1 text-text hover:bg-bg"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg border border-border px-2 py-1 text-text-muted hover:bg-bg"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label="Delete task"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:text-text"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
