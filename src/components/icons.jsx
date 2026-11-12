const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const PhoneIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" {...base} {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M11 18.5h2" />
  </svg>
)

export const ClockIcon = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export const PlusIcon = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} strokeWidth={2.5} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const SunIcon = (p) => (
  <svg viewBox="0 0 24 24" width="28" height="28" {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

export const CalendarIcon = (p) => (
  <svg viewBox="0 0 24 24" width="28" height="28" {...base} {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="3" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
)

export const InboxIcon = (p) => (
  <svg viewBox="0 0 24 24" width="28" height="28" {...base} {...p}>
    <path d="M3 13l3-8h12l3 8v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
    <path d="M3 13h5l1 3h6l1-3h5" />
  </svg>
)

export const TrashIcon = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
)
