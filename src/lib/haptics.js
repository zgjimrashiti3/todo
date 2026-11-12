/** Light haptic tick where supported (Android Chrome; silently ignored elsewhere). */
export function haptic(pattern = 10) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* unsupported */
  }
}
