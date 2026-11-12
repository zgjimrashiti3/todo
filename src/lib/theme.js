export const THEME_KEY = 'my-tasks:theme'
export const THEME_COLORS = { light: '#3B1FA3', dark: '#14112B' }
export const THEME_OPTIONS = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

export function readThemePref() {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function saveThemePref(pref) {
  try {
    if (pref === 'system') localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, pref)
  } catch {
    /* storage unavailable */
  }
}

/** Applies a resolved theme ('light' | 'dark') to the document and theme-color meta. */
export function applyTheme(resolved) {
  const root = document.documentElement
  root.dataset.theme = resolved
  root.style.colorScheme = resolved
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolved])
}
