import { useCallback, useEffect, useRef, useState } from 'react'
import { newId, sanitizeTask } from '../lib/tasks'
import { toISO } from '../lib/dates'

export const STORAGE_KEY = 'my-tasks:v1'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed) ? parsed : parsed?.tasks
    return Array.isArray(list) ? list.map(sanitizeTask).filter(Boolean) : []
  } catch {
    return [] // corrupted or unavailable storage must never crash the app
  }
}

/** Task store persisted to localStorage. */
export function useTasks() {
  const [tasks, setTasks] = useState(load)
  const skipWrite = useRef(true)

  useEffect(() => {
    if (skipWrite.current) {
      skipWrite.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks }))
    } catch {
      /* quota exceeded / private mode: keep working in memory */
    }
  }, [tasks])

  // Keep multiple open tabs/windows in sync.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        skipWrite.current = true
        setTasks(load())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback(({ title, date, time }) => {
    setTasks((prev) => [
      ...prev,
      { id: newId(), title, date, time: date ? time : null, done: false, completedOn: null, createdAt: Date.now() },
    ])
  }, [])

  const update = useCallback((id, { title, date, time }) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title, date, time: date ? time : null } : t)))
  }, [])

  const toggle = useCallback((id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, done: !t.done, completedOn: t.done ? null : toISO(new Date()) } : t,
      ),
    )
  }, [])

  const remove = useCallback((id) => setTasks((prev) => prev.filter((t) => t.id !== id)), [])

  return { tasks, add, update, toggle, remove }
}
