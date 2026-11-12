import { formatDateHeading, isValidDate, isValidTime } from './dates'
import { normalizeRepeat } from './recurrence'
import { normalizeTags } from './tags'

export const MAX_TITLE = 100

export const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'nodate', label: 'No date' },
  { id: 'done', label: 'Done' },
]

export const PRIORITIES = [
  { id: 'none', label: 'None', dot: null },
  { id: 'low', label: 'Low', dot: 'bg-p-low' },
  { id: 'medium', label: 'Medium', dot: 'bg-p-medium' },
  { id: 'high', label: 'High', dot: 'bg-p-high' },
]

export const MAX_SUBTASKS = 50

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`

/** Validates a title; returns { value, error }. */
export function validateTitle(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return { value, error: 'Please enter a task name.' }
  if (value.length > MAX_TITLE) return { value, error: `Task name must be ${MAX_TITLE} characters or fewer.` }
  return { value, error: null }
}

function sanitizeSubtasks(list) {
  if (!Array.isArray(list)) return []
  return list
    .map((s) => {
      const title = typeof s?.title === 'string' ? s.title.trim().slice(0, MAX_TITLE) : ''
      if (!title) return null
      return { id: typeof s.id === 'string' && s.id ? s.id : newId(), title, done: s.done === true }
    })
    .filter(Boolean)
    .slice(0, MAX_SUBTASKS)
}

/** Coerces unknown data into a valid task, or null. Also fills defaults for older data. */
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
    repeat: normalizeRepeat(raw.repeat, date),
    priority: PRIORITIES.some((p) => p.id === raw.priority) ? raw.priority : 'none',
    tags: normalizeTags(raw.tags),
    subtasks: sanitizeSubtasks(raw.subtasks),
    seriesId: typeof raw.seriesId === 'string' && raw.seriesId ? raw.seriesId : null,
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
  if (tab === 'done') {
    const list = tasks
      .filter((t) => t.done)
      .sort((a, b) => (b.completedOn ?? '').localeCompare(a.completedOn ?? '') || b.createdAt - a.createdAt)
    const groups = []
    for (const t of list) {
      const key = t.completedOn ?? 'earlier'
      const last = groups[groups.length - 1]
      if (last && last.key === key) last.tasks.push(t)
      else groups.push({ key, label: t.completedOn ? formatDateHeading(t.completedOn, todayISO) : 'Earlier', tasks: [t] })
    }
    return { overdue: [], groups, all: list }
  }

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

/** Search across every tab by title and tag. */
export function selectSearch(tasks, query, todayISO, hm) {
  const q = query.trim().toLowerCase()
  const tagQ = q.replace(/^#+/, '')
  const matched = tasks.filter(
    (t) => t.title.toLowerCase().includes(q) || (tagQ && t.tags.some((g) => g.includes(tagQ))),
  )
  const overdue = matched.filter((t) => isOverdue(t, todayISO, hm)).sort(byDateTime)
  const rest = matched
    .filter((t) => !isOverdue(t, todayISO, hm))
    .sort(
      (a, b) =>
        Number(a.done) - Number(b.done) ||
        (a.date ?? '9999').localeCompare(b.date ?? '9999') ||
        byTime(a, b),
    )
  return {
    overdue,
    groups: rest.length ? [{ key: 'results', label: null, tasks: rest }] : [],
    all: [...overdue, ...rest],
  }
}
