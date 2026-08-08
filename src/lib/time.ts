/** Local YYYY-MM-DD for a given Date (defaults to now). */
export function dateStr(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Monday..Sunday date strings (YYYY-MM-DD) for the week containing `d`. */
export function currentWeekRange(d: Date = new Date()): { start: string; end: string } {
  const day = d.getDay() // 0 = Sunday .. 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return { start: dateStr(monday), end: dateStr(sunday) }
}

export function isInWeek(date: string, week: { start: string; end: string }): boolean {
  return date >= week.start && date <= week.end
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
