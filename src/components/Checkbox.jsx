/** Round-cornered checkbox with a 44px touch target. */
export default function Checkbox({ done, onToggle, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className="-m-2 flex size-11 shrink-0 items-center justify-center"
    >
      <span
        className={`flex size-6 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
          done ? 'scale-100 border-primary bg-primary' : 'border-check bg-surface'
        }`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: done ? 0 : 24,
              transition: 'stroke-dashoffset 0.25s ease-out',
            }}
          />
        </svg>
      </span>
    </button>
  )
}
