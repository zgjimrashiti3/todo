export const MAX_TAG = 24
export const MAX_TAGS = 8

export const normalizeTag = (s) =>
  String(s ?? '').trim().replace(/^#+/, '').trim().toLowerCase().slice(0, MAX_TAG)

/** Unique, lowercase, non-empty, capped. */
export function normalizeTags(list) {
  if (!Array.isArray(list)) return []
  return [...new Set(list.map(normalizeTag).filter(Boolean))].slice(0, MAX_TAGS)
}

/** Every tag used by any task, sorted. */
export const collectTags = (tasks) => [...new Set(tasks.flatMap((t) => t.tags))].sort()
