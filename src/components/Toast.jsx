import { useEffect } from 'react'

export const TOAST_MS = 5000

/** Bottom toast with an Undo action, sitting above the Add task button. */
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(onDismiss, TOAST_MS)
    return () => clearTimeout(id)
  }, [toast, onDismiss])

  if (!toast) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-40 mx-auto w-full max-w-[430px] px-5">
      <div
        key={toast.id}
        role="status"
        aria-live="polite"
        className="animate-fade-up pointer-events-auto flex items-center justify-between rounded-2xl bg-toast pl-4 text-white shadow-xl"
      >
        <span className="py-3 text-[15px] font-semibold">{toast.message}</span>
        <button
          type="button"
          onClick={() => {
            toast.onUndo()
            onDismiss()
          }}
          className="min-h-11 rounded-xl px-4 text-[15px] font-bold text-[#c9bcff]"
        >
          Undo
        </button>
      </div>
    </div>
  )
}
