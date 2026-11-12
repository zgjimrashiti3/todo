import { useEffect, useState } from 'react'
import { applyTheme, readThemePref, saveThemePref } from '../lib/theme'

const QUERY = '(prefers-color-scheme: dark)'

/** Theme preference (system | light | dark), resolved against the OS setting. */
export function useTheme() {
  const [pref, setPref] = useState(readThemePref)
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(QUERY).matches)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const onChange = (e) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolved = pref === 'system' ? (systemDark ? 'dark' : 'light') : pref

  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  const setTheme = (next) => {
    saveThemePref(next)
    setPref(next)
  }
  return { pref, resolved, setTheme }
}
