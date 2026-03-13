import { PLATFORMS, AGENT_TABS, EXTRA_TABS } from '../lib/platforms'

function TabButton({ tabKey, platform, onChange, counts, agentCounts }) {
  const p = PLATFORMS[tabKey]
  const isActive = platform === tabKey
  // "All" counts only agent projects (MCP is separate)
  const count = tabKey === 'all'
    ? Object.values(agentCounts).reduce((a, b) => a + b, 0)
    : counts[tabKey] || 0

  return (
    <button
      key={tabKey}
      onClick={() => onChange(tabKey)}
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
}

export default function PlatformTabs({ platform, onChange, counts }) {
  // Agent counts exclude MCP
  const agentCounts = Object.fromEntries(
    Object.entries(counts).filter(([k]) => k !== 'mcp')
  )

  // Hide agent tabs with < 10 projects (except 'all')
  const visibleAgentTabs = AGENT_TABS.filter(
    (p) => p === 'all' || (counts[p] || 0) >= 10
  )

  // MCP tab uses lower threshold (new category, fewer repos initially)
  const visibleExtraTabs = EXTRA_TABS.filter(
    (p) => (counts[p] || 0) >= 5
  )

  // Don't render if only "all" tab would show and no extra tabs
  if (visibleAgentTabs.length <= 1 && visibleExtraTabs.length === 0) return null

  return (
    <div
      className="hide-scrollbar"
      style={{
        display: 'flex',
        gap: '4px',
        overflowX: 'auto',
        padding: '0 0 12px',
        marginBottom: '4px',
        alignItems: 'center',
      }}
    >
      {visibleAgentTabs.map((key) => (
        <TabButton
          key={key}
          tabKey={key}
          platform={platform}
          onChange={onChange}
          counts={counts}
          agentCounts={agentCounts}
        />
      ))}

      {visibleExtraTabs.length > 0 && (
        <>
          {/* Visual divider between agent tabs and extra tabs */}
          <div
            style={{
              width: '1px',
              height: '20px',
              background: 'var(--border)',
              margin: '0 8px',
              flexShrink: 0,
            }}
          />
          {visibleExtraTabs.map((key) => (
            <TabButton
              key={key}
              tabKey={key}
              platform={platform}
              onChange={onChange}
              counts={counts}
              agentCounts={agentCounts}
            />
          ))}
        </>
      )}
    </div>
  )
}
