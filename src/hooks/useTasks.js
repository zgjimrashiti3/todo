import { useCallback, useEffect, useRef, useState } from 'react'
import { newId, sanitizeTask } from '../lib/tasks'
import { toISO } from '../lib/dates'
import { nextOccurrence } from '../lib/recurrence'
import { migrate, STORAGE_VERSION } from '../lib/migrate'

export const STORAGE_KEY = 'my-tasks:v1' // key kept so existing data is found; the payload carries its own version
const BACKUP_KEY = 'my-tasks:v1-backup'

function persist(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, tasks }))
  } catch {
    /* quota exceeded / private mode: keep working in memory */
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const { tasks, migrated } = migrate(JSON.parse(raw))
    const clean = tasks.map(sanitizeTask).filter(Boolean)
    if (migrated) {
      // Keep a copy of the pre-migration data once, then store the upgraded format.
      try {
        if (!localStorage.getItem(BACKUP_KEY)) localStorage.setItem(BACKUP_KEY, raw)
      } catch {
        /* ignore */
      }
      persist(clean)
    }
    return clean
  } catch {
    return [] // corrupted or unavailable storage must never crash the app
  }
}

/** Task store persisted to localStorage. */
export function useTasks() {
  const [tasks, setTasks] = useState(load)
  const ref = useRef(tasks) // always the latest list, so actions can return results synchronously
  const skipWrite = useRef(true)

  const commit = useCallback((next) => {
    ref.current = next
    setTasks(next)
  }, [])

  useEffect(() => {
    if (skipWrite.current) {
      skipWrite.current = false
      return
    }
    persist(tasks)
  }, [tasks])

  // Keep multiple open tabs/windows in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        skipWrite.current = true
        commit(load())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [commit])

  const add = useCallback(
    (data) => {
      const task = sanitizeTask({ ...data, id: newId(), done: false, completedOn: null, createdAt: Date.now() })
      if (task) commit([...ref.current, task])
    },
    [commit],
  )

  const update = useCallback(
    (id, data) => {
      commit(ref.current.map((t) => (t.id === id ? (sanitizeTask({ ...t, ...data }) ?? t) : t)))
    },
    [commit],
  )

  /**
   * Toggles done. Completing a recurring task also creates its next occurrence.
   * Returns { completed, nextId } so the caller can offer an undo.
   */
  const toggle = useCallback(
    (id) => {
      const task = ref.current.find((t) => t.id === id)
      if (!task) return null
      if (task.done) {
        commit(ref.current.map((t) => (t.id === id ? { ...t, done: false, completedOn: null } : t)))
        return { completed: false, nextId: null }
      }
      const today = toISO(new Date())
      const seriesId = task.seriesId ?? task.id
      let list = ref.current.map((t) => (t.id === id ? { ...t, done: true, completedOn: today, seriesId } : t))
      let nextId = null
      if (task.repeat.type !== 'none' && task.date) {
        const date = nextOccurrence(task, today)
        const exists = list.some((t) => !t.done && t.seriesId === seriesId && t.date === date)
        if (date && !exists) {
          const next = {
            ...task,
            id: newId(),
            date,
            done: false,
            completedOn: null,
            createdAt: Date.now(),
            seriesId,
            subtasks: task.subtasks.map((s) => ({ ...s, id: newId(), done: false })),
          }
          nextId = next.id
          list = [...list, next]
        }
      }
      commit(list)
      return { completed: true, nextId }
    },
    [commit],
  )

  const undoToggle = useCallback(
    (id, nextId) => {
      commit(
        ref.current
          .filter((t) => t.id !== nextId)
          .map((t) => (t.id === id ? { ...t, done: false, completedOn: null } : t)),
      )
    },
    [commit],
  )

  /** Removes a task and returns it (for undo). */
  const remove = useCallback(
    (id) => {
      const task = ref.current.find((t) => t.id === id) ?? null
      if (task) commit(ref.current.filter((t) => t.id !== id))
      return task
    },
    [commit],
  )

  const restore = useCallback(
    (task) => {
      if (!ref.current.some((t) => t.id === task.id)) commit([...ref.current, task])
    },
    [commit],
  )

  const removeMany = useCallback(
    (ids) => {
      const set = new Set(ids)
      commit(ref.current.filter((t) => !set.has(t.id)))
    },
    [commit],
  )

  return { tasks, add, update, toggle, undoToggle, remove, restore, removeMany }
}
