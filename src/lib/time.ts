/** Local YYYY-MM-DD for a given Date (defaults to now). */
export function dateStr(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Sunday..Saturday date strings (YYYY-MM-DD) for the week containing `d`, shifted by
 *  `weekOffset` whole weeks (negative = past, positive = future). */
export function workWeekRange(
  d: Date = new Date(),
  weekOffset = 0,
): { start: string; end: string } {
  const day = d.getDay() // 0 = Sunday .. 6 = Saturday
  const diffToSunday = -day
  const sunday = new Date(d)
  sunday.setHours(0, 0, 0, 0)
  sunday.setDate(sunday.getDate() + diffToSunday + weekOffset * 7)
  const saturday = new Date(sunday)
  saturday.setDate(sunday.getDate() + 6)
  return { start: dateStr(sunday), end: dateStr(saturday) }
}

export function isInWeek(date: string, week: { start: string; end: string }): boolean {
  return date >= week.start && date <= week.end
}

/** "Aug 3 – Aug 7" style label for a {start, end} date-string range. */
export function formatWeekRangeLabel(week: { start: string; end: string }): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const start = new Date(`${week.start}T00:00:00`)
  const end = new Date(`${week.end}T00:00:00`)
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`
}

/** Stopwatch-style H:MM:SS (or MM:SS under an hour) from a whole-second count. */
export function formatStopwatch(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

/** Compact "1h 30m" style label, used for planned-duration display. */
export function formatMinutesLabel(totalSeconds: number): string {
  const totalMinutes = Math.round(totalSeconds / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/** Hours with a single decimal, trimmed ("3h", "3.5h"). */
export function formatHoursLabel(hours: number): string {
  const rounded = Math.round(hours * 10) / 10
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}h`
}

export function secondsToHours(seconds: number): number {
  return seconds / 3600
}
