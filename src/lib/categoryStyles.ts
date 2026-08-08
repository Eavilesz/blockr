import type { Category } from '../types'

/** Literal Tailwind class names per category — kept as static strings (not
 *  template-built) so Tailwind's source scanner can find and generate them. */
export const categoryStyles: Record<
  Category,
  { dot: string; text: string; bg: string; bgSoft: string; border: string }
> = {
  work: {
    dot: 'bg-work',
    text: 'text-work',
    bg: 'bg-work',
    bgSoft: 'bg-work/12',
    border: 'border-work',
  },
  study: {
    dot: 'bg-study',
    text: 'text-study',
    bg: 'bg-study',
    bgSoft: 'bg-study/12',
    border: 'border-study',
  },
  projects: {
    dot: 'bg-projects',
    text: 'text-projects',
    bg: 'bg-projects',
    bgSoft: 'bg-projects/12',
    border: 'border-projects',
  },
}
