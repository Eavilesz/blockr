import type { Priority } from '../types'

/** Literal Tailwind class names per priority — kept as static strings (not
 *  template-built) so Tailwind's source scanner can find and generate them. */
export const priorityStyles: Record<
  Priority,
  { dot: string; text: string; bg: string; bgSoft: string; border: string }
> = {
  low: {
    dot: 'bg-priority-low',
    text: 'text-priority-low',
    bg: 'bg-priority-low',
    bgSoft: 'bg-priority-low/12',
    border: 'border-priority-low',
  },
  medium: {
    dot: 'bg-priority-medium',
    text: 'text-priority-medium',
    bg: 'bg-priority-medium',
    bgSoft: 'bg-priority-medium/12',
    border: 'border-priority-medium',
  },
  high: {
    dot: 'bg-priority-high',
    text: 'text-priority-high',
    bg: 'bg-priority-high',
    bgSoft: 'bg-priority-high/12',
    border: 'border-priority-high',
  },
}
