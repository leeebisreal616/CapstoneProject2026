// Centralized icon library — all icons used across the GCO Portal
// Usage: <IconHome className="w-5 h-5" stroke="#085041" />

const base = (props) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  ...props,
})

export function IconHome({ stroke = 'currentColor', className = 'w-5 h-5' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

export function IconCounseling({ stroke = 'currentColor', className = 'w-5 h-5' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>
  )
}

export function IconModules({ stroke = 'currentColor', className = 'w-5 h-5' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
    </svg>
  )
}

export function IconInventory({ stroke = 'currentColor', className = 'w-5 h-5' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
    </svg>
  )
}

export function IconAssessment({ stroke = 'currentColor', className = 'w-5 h-5' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
    </svg>
  )
}

export function IconChevronRight({ stroke = 'currentColor', className = 'w-4 h-4', strokeWidth = 2.5 }) {
  return (
    <svg {...base({ stroke, className, strokeWidth })}>
      <path d="M9 18l6-6-6-6"/>
    </svg>
  )
}

export function IconCheck({ stroke = 'currentColor', className = 'w-6 h-6', strokeWidth = 2 }) {
  return (
    <svg {...base({ stroke, className, strokeWidth })}>
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  )
}

export function IconAlertCircle({ stroke = 'currentColor', className = 'w-4 h-4', strokeWidth = 2 }) {
  return (
    <svg {...base({ stroke, className, strokeWidth })}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

export function IconSearch({ stroke = 'currentColor', className = 'w-4 h-4', strokeWidth = 1.8 }) {
  return (
    <svg {...base({ stroke, className, strokeWidth })}>
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  )
}

export function IconLocation({ stroke = 'currentColor', className = 'w-5 h-5' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    </svg>
  )
}

export function IconMail({ stroke = 'currentColor', className = 'w-5 h-5' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
    </svg>
  )
}

export function IconClock({ stroke = 'currentColor', className = 'w-5 h-5' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  )
}

export function IconPhone({ stroke = 'currentColor', className = 'w-5 h-5' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
    </svg>
  )
}

export function IconAlertTriangle({ stroke = 'currentColor', className = 'w-8 h-8' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
    </svg>
  )
}

export function IconPersonality({ stroke = 'currentColor', className = 'w-7 h-7' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
    </svg>
  )
}

export function IconHeart({ stroke = 'currentColor', className = 'w-7 h-7' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
    </svg>
  )
}

export function IconQuestion({ stroke = 'currentColor', className = 'w-8 h-8' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
  )
}

export function IconCalendar({ stroke = 'currentColor', className = 'w-5 h-5' }) {
  return (
    <svg {...base({ stroke, className })}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

export function IconHistory({ stroke = 'currentColor', className = 'w-5 h-5' }) {
  return (
    <svg {...base({ stroke, className })}>
      <path d="M12 8v4l3 3"/><path d="M3.05 11a9 9 0 1118 2m0 0l2 2m-2-2l-2 2"/>
    </svg>
  )
}