const pad = (n) => String(n).padStart(2, '0')

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const fromISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (iso, n) => {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const nowHM = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

export const isValidDate = (s) =>
  typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && toISO(fromISO(s)) === s

export const isValidTime = (s) => typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s)

/** "09:30" -> "9:30 AM" */
export function formatTime(hm) {
  const [h, m] = hm.split(':').map(Number)
  return `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'AM' : 'PM'}`
}

/** "Tomorrow", "Fri 14 Nov" (adds the year when it is not the current one). */
export function formatDateHeading(iso, todayISO) {
  if (iso === todayISO) return 'Today'
  if (iso === addDays(todayISO, 1)) return 'Tomorrow'
  if (iso === addDays(todayISO, -1)) return 'Yesterday'
  const d = fromISO(iso)
  const opts = { weekday: 'short', day: 'numeric', month: 'short' }
  if (d.getFullYear() !== fromISO(todayISO).getFullYear()) opts.year = 'numeric'
  return d.toLocaleDateString('en-GB', opts).replace(',', '')
}
