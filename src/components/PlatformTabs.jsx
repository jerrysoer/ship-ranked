import { PLATFORMS, PLATFORM_ORDER } from '../lib/platforms'

export default function PlatformTabs({ platform, onChange, counts }) {
  // Hide tabs with < 10 projects (except 'all')
  const visibleTabs = PLATFORM_ORDER.filter(
    (p) => p === 'all' || (counts[p] || 0) >= 10
  )

  // Don't render if only "all" tab would show
  if (visibleTabs.length <= 1) return null

  return (
    <div
      className="hide-scrollbar"
      style={{
        display: 'flex',
        gap: '4px',
        overflowX: 'auto',
        padding: '0 0 12px',
        marginBottom: '4px',
      }}
    >
      {visibleTabs.map((key) => {
        const p = PLATFORMS[key]
        const isActive = platform === key
        const count = key === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[key] || 0

        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: isActive ? 700 : 400,
              color: isActive ? p.color : '#4A5568',
              background: 'transparent',
              border: 'none',
              borderBottom: isActive ? `2px solid ${p.color}` : '2px solid transparent',
              padding: '8px 12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = '#A0AEC0'
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = '#4A5568'
            }}
          >
            <span>{p.emoji}</span>
            <span>{p.label}</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                opacity: 0.5,
              }}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
