import { addDays, fromISO, toISO } from './dates'

export const REPEATS = [
  { id: 'none', label: 'None' },
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
]

/** Monday-first display order; `day` matches Date#getDay (0 = Sunday). */
export const WEEKDAYS = [
  { day: 1, short: 'M', short3: 'Mon', label: 'Monday' },
  { day: 2, short: 'T', short3: 'Tue', label: 'Tuesday' },
  { day: 3, short: 'W', short3: 'Wed', label: 'Wednesday' },
  { day: 4, short: 'T', short3: 'Thu', label: 'Thursday' },
  { day: 5, short: 'F', short3: 'Fri', label: 'Friday' },
  { day: 6, short: 'S', short3: 'Sat', label: 'Saturday' },
  { day: 0, short: 'S', short3: 'Sun', label: 'Sunday' },
]

export const NO_REPEAT = { type: 'none', days: [], day: null }

/** Coerces unknown data into a valid repeat rule. Recurrence needs a date. */
export function normalizeRepeat(raw, date) {
  if (!date || !raw || typeof raw !== 'object') return NO_REPEAT
  const d = fromISO(date)
  switch (raw.type) {
    case 'daily':
      return { type: 'daily', days: [], day: null }
    case 'weekly': {
      const list = Array.isArray(raw.days) ? raw.days : []
      const days = [...new Set(list.filter((n) => Number.isInteger(n) && n >= 0 && n <= 6))].sort()
      return { type: 'weekly', days: days.length ? days : [d.getDay()], day: null }
    }
    case 'monthly': {
      const ok = Number.isInteger(raw.day) && raw.day >= 1 && raw.day <= 31
      return { type: 'monthly', days: [], day: ok ? raw.day : d.getDate() }
    }
    default:
      return NO_REPEAT
  }
}

export function describeRepeat(r) {
  if (r.type === 'daily') return 'Repeats every day'
  if (r.type === 'weekly') {
    const names = WEEKDAYS.filter((w) => r.days.includes(w.day)).map((w) => w.short3)
    return `Repeats weekly on ${names.join(', ')}`
  }
  if (r.type === 'monthly') return `Repeats monthly on day ${r.day}`
  return ''
}

/**
 * Next due date after completing `task`: always strictly after both its own
 * date and today, so finishing an overdue task never recreates a past date.
 */
export function nextOccurrence(task, todayISO) {
  const { repeat, date } = task
  const base = date > todayISO ? date : todayISO
  if (repeat.type === 'daily') return addDays(base, 1)
  if (repeat.type === 'weekly') {
    for (let i = 1; i <= 7; i++) {
      const d = addDays(base, i)
      if (repeat.days.includes(fromISO(d).getDay())) return d
    }
  }
  if (repeat.type === 'monthly') {
    const b = fromISO(base)
    for (let k = 0; k <= 12; k++) {
      const first = new Date(b.getFullYear(), b.getMonth() + k, 1)
      const dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
      const iso = toISO(new Date(first.getFullYear(), first.getMonth(), Math.min(repeat.day, dim)))
      if (iso > base) return iso
    }
  }
  return null
}
