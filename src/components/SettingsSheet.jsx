import BottomSheet from './BottomSheet'
import Segmented from './Segmented'
import { THEME_OPTIONS } from '../lib/theme'

export default function SettingsSheet({ theme, onTheme, onClose }) {
  return (
    <BottomSheet label="Settings" title="Settings" onClose={onClose}>
      {(close) => (
        <>
          <Segmented label="Theme" options={THEME_OPTIONS} value={theme} onChange={onTheme} className="mt-1" />
          <p className="mt-2 text-sm text-muted">System follows your device&rsquo;s light or dark setting.</p>
          <button
            type="button"
            onClick={close}
            className="mt-6 h-14 w-full rounded-2xl bg-primary text-[17px] font-bold text-white shadow-lg shadow-primary/25 transition-transform active:scale-[0.98] active:bg-primary-dark"
          >
            Done
          </button>
        </>
      )}
    </BottomSheet>
  )
}
