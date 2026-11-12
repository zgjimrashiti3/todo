import { formatDateHeading, isValidDate, isValidTime } from './dates'

export const MAX_TITLE = 100

export const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'nodate', label: 'No date' },
]

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

/** Validates a title; returns { value, error }. */
export function validateTitle(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return { value, error: 'Please enter a task name.' }
  if (value.length > MAX_TITLE) return { value, error: `Task name must be ${MAX_TITLE} characters or fewer.` }
  return { value, error: null }
}

/** Coerces unknown data into a valid task, or null. */
export function sanitizeTask(raw) {
  if (!raw || typeof raw !== 'object') return null
  const title = typeof raw.title === 'string' ? raw.title.trim().slice(0, MAX_TITLE) : ''
  if (!title) return null
  const date = isValidDate(raw.date) ? raw.date : null
  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : newId(),
    title,
    date,
    time: date && isValidTime(raw.time) ? raw.time : null,
    done: raw.done === true,
    completedOn: raw.done === true && isValidDate(raw.completedOn) ? raw.completedOn : null,
    createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : Date.now(),
  }
}

const byTime = (a, b) => {
  if (a.time && b.time) return a.time.localeCompare(b.time) || a.createdAt - b.createdAt
  if (a.time) return -1
  if (b.time) return 1
  return a.createdAt - b.createdAt
}
const byDateTime = (a, b) => a.date.localeCompare(b.date) || byTime(a, b)

export function isOverdue(t, todayISO, hm) {
  if (t.done || !t.date) return false
  if (t.date < todayISO) return true
  return t.date === todayISO && !!t.time && t.time < hm
}

/**
 * Builds what a tab shows.
 * Returns { overdue: Task[], groups: [{ key, label, tasks }], all: Task[] }.
 */
export function selectView(tasks, tab, todayISO, hm) {
  if (tab === 'today') {
    const overdue = tasks.filter((t) => isOverdue(t, todayISO, hm)).sort(byDateTime)
    const rest = tasks
      .filter(
        (t) =>
          t.date &&
          !isOverdue(t, todayISO, hm) &&
          // Past-dated tasks stay visible only if they were completed today.
          (t.date === todayISO || (t.done && t.date < todayISO && t.completedOn === todayISO)),
      )
      .sort(byDateTime)
    return {
      overdue,
      groups: rest.length ? [{ key: 'today', label: null, tasks: rest }] : [],
      all: [...overdue, ...rest],
    }
  }

  if (tab === 'upcoming') {
    const list = tasks.filter((t) => t.date && t.date > todayISO).sort(byDateTime)
    const groups = []
    for (const t of list) {
      const last = groups[groups.length - 1]
      if (last && last.key === t.date) last.tasks.push(t)
      else groups.push({ key: t.date, label: formatDateHeading(t.date, todayISO), tasks: [t] })
    }
    return { overdue: [], groups, all: list }
  }

  const list = tasks.filter((t) => !t.date).sort((a, b) => a.createdAt - b.createdAt)
  return { overdue: [], groups: list.length ? [{ key: 'nodate', label: null, tasks: list }] : [], all: list }
}
