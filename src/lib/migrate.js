import { NO_REPEAT } from './recurrence'

export const STORAGE_VERSION = 2

/**
 * Ordered migrations; migrations[i] upgrades stored version i+1 -> i+2.
 * Each one only adds defaults, so old tasks keep working untouched.
 */
const migrations = [
  // v1 -> v2: repeat, priority, tags, subtasks, seriesId
  (tasks) =>
    tasks.map((t) => ({
      repeat: NO_REPEAT,
      priority: 'none',
      tags: [],
      subtasks: [],
      seriesId: null,
      ...t,
    })),
]

/** Accepts the raw parsed storage value (a bare array, or { version, tasks }). */
export function migrate(parsed) {
  const list = Array.isArray(parsed) ? parsed : parsed?.tasks
  if (!Array.isArray(list)) return { tasks: [], migrated: false }
  const from = Number.isInteger(parsed?.version) ? parsed.version : 1
  let tasks = list.filter((t) => t && typeof t === 'object')
  for (let v = from; v < STORAGE_VERSION; v++) tasks = migrations[v - 1](tasks)
  return { tasks, migrated: from < STORAGE_VERSION }
}
