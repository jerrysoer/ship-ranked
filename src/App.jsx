import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { supabase } from './lib/supabase'

// ─── Analytics ───────────────────────────────────────────────────────────────

const track = (event, data) => {
  if (!supabase) return
  supabase.from('analytics_events').insert({ event, data }).then(null, () => {})
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_DATA = [
  {
    id: 'github:stackblitz/bolt.new',
    name: 'bolt.new',
    full_name: 'stackblitz/bolt.new',
    description: 'Prompt, run, edit, and deploy full-stack web applications',
    url: 'https://github.com/stackblitz/bolt.new',
    builder_handle: 'stackblitz',
    avatar_url: 'https://avatars.githubusercontent.com/u/12101536',
    category: 'tools',
    stars_total: 12500,
    stars_gained_7d: 847,
    rank: 1,
    rank_delta: 2,
    is_new: false,
    claude_signal: 'claude-md',
  },
  {
    id: 'github:mckaywrigley/chatbot-ui',
    name: 'chatbot-ui',
    full_name: 'mckaywrigley/chatbot-ui',
    description: 'AI chat interface with Claude Code integration and plugin system',
    url: 'https://github.com/mckaywrigley/chatbot-ui',
    builder_handle: 'mckaywrigley',
    avatar_url: 'https://avatars.githubusercontent.com/u/20173636',
    category: 'ai-apps',
    stars_total: 9800,
    stars_gained_7d: 612,
    rank: 2,
    rank_delta: 0,
    is_new: false,
    claude_signal: 'claude-md',
  },
  {
    id: 'github:anthropics/claude-code',
    name: 'claude-code',
    full_name: 'anthropics/claude-code',
    description: 'An agentic coding tool that lives in your terminal',
    url: 'https://github.com/anthropics/claude-code',
    builder_handle: 'anthropics',
    avatar_url: 'https://avatars.githubusercontent.com/u/76263028',
    category: 'tools',
    stars_total: 28400,
    stars_gained_7d: 534,
    rank: 3,
    rank_delta: -1,
    is_new: false,
    claude_signal: 'claude-md',
  },
  {
    id: 'github:zaidmukaddam/scira',
    name: 'scira',
    full_name: 'zaidmukaddam/scira',
    description: 'Minimalist AI-powered search engine built with Claude',
    url: 'https://github.com/zaidmukaddam/scira',
    builder_handle: 'zaidmukaddam',
    avatar_url: 'https://avatars.githubusercontent.com/u/60508542',
    category: 'ai-apps',
    stars_total: 4200,
    stars_gained_7d: 389,
    rank: 4,
    rank_delta: 5,
    is_new: false,
    claude_signal: 'claude-gen',
  },
  {
    id: 'github:jamesbrennan/shipterm',
    name: 'shipterm',
    full_name: 'jamesbrennan/shipterm',
    description: 'Beautiful terminal dashboard for monitoring deployments',
    url: 'https://github.com/jamesbrennan/shipterm',
    builder_handle: 'jamesbrennan',
    avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
    category: 'dev-utilities',
    stars_total: 890,
    stars_gained_7d: 267,
    rank: 5,
    rank_delta: 0,
    is_new: true,
    claude_signal: 'claude-md',
  },
  {
    id: 'github:leerob/vibe-chess',
    name: 'vibe-chess',
    full_name: 'leerob/vibe-chess',
    description: 'Multiplayer chess with AI commentary, fully vibe-coded',
    url: 'https://github.com/leerob/vibe-chess',
    builder_handle: 'leerob',
    avatar_url: 'https://avatars.githubusercontent.com/u/9113740',
    category: 'games',
    stars_total: 2100,
    stars_gained_7d: 198,
    rank: 6,
    rank_delta: -2,
    is_new: false,
    claude_signal: 'claude-gen',
  },
  {
    id: 'github:surjithctly/astroship',
    name: 'astroship',
    full_name: 'surjithctly/astroship',
    description: 'Astro starter template for SaaS websites and landing pages',
    url: 'https://github.com/surjithctly/astroship',
    builder_handle: 'surjithctly',
    avatar_url: 'https://avatars.githubusercontent.com/u/1884175',
    category: 'tools',
    stars_total: 3400,
    stars_gained_7d: 156,
    rank: 7,
    rank_delta: 1,
    is_new: false,
    claude_signal: 'claude-md',
  },
  {
    id: 'github:pixelperfect/roast-my-code',
    name: 'roast-my-code',
    full_name: 'pixelperfect/roast-my-code',
    description: 'Paste code, get roasted by an AI that has zero chill',
    url: 'https://github.com/pixelperfect/roast-my-code',
    builder_handle: 'pixelperfect',
    avatar_url: 'https://avatars.githubusercontent.com/u/9999999',
    category: 'fun',
    stars_total: 410,
    stars_gained_7d: 134,
    rank: 8,
    rank_delta: 0,
    is_new: true,
    claude_signal: 'claude-gen',
  },
  {
    id: 'github:kennethreitz/autoenv',
    name: 'autoenv',
    full_name: 'kennethreitz/autoenv',
    description: 'Directory-based environments with Claude-assisted config',
    url: 'https://github.com/kennethreitz/autoenv',
    builder_handle: 'kennethreitz',
    avatar_url: 'https://avatars.githubusercontent.com/u/119893',
    category: 'dev-utilities',
    stars_total: 5600,
    stars_gained_7d: 87,
    rank: 9,
    rank_delta: -3,
    is_new: false,
    claude_signal: 'claude-md',
  },
  {
    id: 'github:tinypixel/doomscroll',
    name: 'doomscroll',
    full_name: 'tinypixel/doomscroll',
    description: 'Infinite procedurally generated doom levels in the browser',
    url: 'https://github.com/tinypixel/doomscroll',
    builder_handle: 'tinypixel',
    avatar_url: 'https://avatars.githubusercontent.com/u/8888888',
    category: 'games',
    stars_total: 320,
    stars_gained_7d: 64,
    rank: 10,
    rank_delta: 0,
    is_new: true,
    claude_signal: 'claude-gen',
  },
]

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'tools', label: 'Tools' },
  { value: 'games', label: 'Games' },
  { value: 'ai-apps', label: 'AI Apps' },
  { value: 'dev-utilities', label: 'Dev Utilities' },
  { value: 'fun', label: 'Fun & Weird' },
]

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useCountUp(target, duration = 800, delay = 0) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!target) return
    const timeout = setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 4)
        setValue(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, duration, delay])
  return value
}

function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.1, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, isVisible]
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k'
  return n.toString()
}

function getCategoryLabel(value) {
  return CATEGORIES.find(c => c.value === value)?.label || value
}

function getView() {
  return new URLSearchParams(window.location.search).get('view')
}

function getInitialCategory() {
  const params = new URLSearchParams(window.location.search)
  return params.get('category') || 'all'
}

function getDeepLinkProject() {
  const params = new URLSearchParams(window.location.search)
  const slug = params.get('project')
  if (!slug) return null
  return slug.replace('--', '/')
}

function getSignalLabel(signal) {
  if (signal === 'claude-md') return 'CLAUDE.md'
  if (signal === 'topic-claude-code') return 'Claude Code'
  if (signal === 'topic-vibe-coding') return 'Vibe Coded'
  return signal || ''
}

function stripHtml(str) {
  if (!str) return str
  return str.replace(/<[^>]+>/g, '').trim()
}

// ─── Copy Share ──────────────────────────────────────────────────────────────

async function copyShare(project, setCopiedId) {
  const shareUrl = `${API_BASE}/p/${project.full_name.replace('/', '--')}`
  const text = `My project ranked #${project.rank} on ShipRanked this week\n\n` +
    `★ ${project.stars_total.toLocaleString()} total stars  ↑ +${project.stars_gained_7d} gained this week\n` +
    `Built with Claude Code\n\n` +
    `${project.url}\n` +
    `See the full chart → ${shareUrl}`
  try {
    await navigator.clipboard.writeText(text)
    track('share-copied', { name: project.name, rank: project.rank })
    setCopiedId(project.id)
    setTimeout(() => setCopiedId(null), 2000)
  } catch {
    // Clipboard API not available
  }
}

// ─── Delta Badge ─────────────────────────────────────────────────────────────

function DeltaBadge({ project, animate = false, delay = 0 }) {
  const [show, setShow] = useState(!animate)

  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [animate, delay])

  if (project.is_new) {
    return (
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--gold)',
          background: 'rgba(255,184,48,0.12)',
          padding: '2px 8px',
          borderRadius: '4px',
          opacity: show ? 1 : 0,
          transform: show ? 'scale(1)' : 'scale(0)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        NEW
      </span>
    )
  }

  if (project.rank_delta === 0) {
    return (
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--neutral)',
          opacity: show ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
      >
        —
      </span>
    )
  }

  const isUp = project.rank_delta > 0
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        fontWeight: 500,
        color: isUp ? 'var(--up)' : 'var(--down)',
        opacity: show ? 1 : 0,
        transform: show ? 'scale(1)' : 'scale(0)',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {isUp ? '↑' : '↓'} {isUp ? '+' : ''}{project.rank_delta}
    </span>
  )
}

// ─── Share Button ────────────────────────────────────────────────────────────

function ShareButton({ project, copiedId, setCopiedId, size = 'normal' }) {
  const isCopied = copiedId === project.id
  const dim = size === 'small' ? 28 : 32

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        copyShare(project, setCopiedId)
      }}
      title="Copy share text"
      style={{
        width: dim,
        height: dim,
        borderRadius: '6px',
        border: '1px solid var(--border)',
        background: isCopied ? 'rgba(0,229,160,0.1)' : 'transparent',
        color: isCopied ? 'var(--up)' : 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!isCopied) {
          e.currentTarget.style.borderColor = 'var(--border-bright)'
          e.currentTarget.style.color = 'var(--text-primary)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isCopied) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-muted)'
        }
      }}
    >
      {isCopied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data, width = 48, height = 16, color = 'var(--up)' }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 2) - 1
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={width} height={height} style={{ flexShrink: 0, display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Podium Card ─────────────────────────────────────────────────────────────

function PodiumCard({ project, position, copiedId, setCopiedId, highlighted, sparklineData, onProjectClick }) {
  const starsAnimated = useCountUp(project.stars_gained_7d, 800, 500 + position * 100)
  const isFirst = position === 0

  return (
    <div
      data-project={project.full_name}
      onClick={() => {
        track('project-click', { name: project.name, rank: project.rank, category: project.category })
        onProjectClick(project)
      }}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        background: isFirst
          ? 'radial-gradient(ellipse at top, rgba(255,184,48,0.08) 0%, var(--surface) 70%)'
          : 'var(--surface)',
        border: `1px solid ${isFirst ? 'rgba(255,184,48,0.3)' : 'var(--border)'}`,
        borderLeft: highlighted ? '3px solid var(--gold)' : undefined,
        boxShadow: highlighted ? '0 0 20px rgba(255,184,48,0.15)' : undefined,
        borderRadius: '12px',
        padding: '24px 20px',
        transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.6s, border-left 0.6s',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeUp 0.5s ease-out both',
        animationDelay: `${position * 100}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = isFirst ? 'rgba(255,184,48,0.5)' : 'var(--border-bright)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = isFirst ? 'rgba(255,184,48,0.3)' : 'var(--border)'
      }}
    >
      {/* Rank number + movement */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '10px',
        marginBottom: '12px',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: isFirst ? '52px' : '40px',
          lineHeight: 1,
          color: isFirst ? 'var(--gold)' : 'var(--text-dim)',
          textShadow: isFirst ? '0 0 40px rgba(255,184,48,0.4)' : 'none',
        }}>
          {project.rank}
        </span>
        <DeltaBadge project={project} animate delay={800 + position * 100} />
      </div>

      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <img
          src={project.avatar_url}
          alt=""
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '1px solid var(--border)',
          }}
          loading="lazy"
        />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '16px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {project.name}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}>
            <a
              href={`?view=builder&handle=${encodeURIComponent(project.builder_handle || project.full_name.split('/')[0])}`}
              onClick={(e) => { e.stopPropagation() }}
              style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-blue)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              {project.full_name}
            </a>
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
        marginBottom: '16px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {stripHtml(project.description)}
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-muted)',
          }}>
            ★ {formatNumber(project.stars_total)}
          </span>
          <Sparkline data={sparklineData} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--up)',
          }}>
            +{starsAnimated}
          </span>
        </div>
        <ShareButton project={project} copiedId={copiedId} setCopiedId={setCopiedId} size="small" />
      </div>
    </div>
  )
}

// ─── Chart Row ───────────────────────────────────────────────────────────────

function ChartRow({ project, index, copiedId, setCopiedId, highlighted, sparklineData, onProjectClick }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <div
      ref={ref}
      data-project={project.full_name}
      onClick={() => {
        track('project-click', { name: project.name, rank: project.rank, category: project.category })
        onProjectClick(project)
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        minHeight: '64px',
        borderBottom: '1px solid var(--border)',
        borderLeft: highlighted ? '3px solid var(--gold)' : undefined,
        boxShadow: highlighted ? '0 0 20px rgba(255,184,48,0.15)' : undefined,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s',
        cursor: 'pointer',
        touchAction: 'manipulation',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-8px)',
        transitionProperty: 'opacity, transform, background, border-color, box-shadow, border-left',
        transitionDuration: '0.4s',
        transitionDelay: `${Math.min(index * 40, 320)}ms`,
      }}
      onMouseEnter={(e) => {
        if (highlighted) return
        e.currentTarget.style.transform = 'translateX(2px)'
        e.currentTarget.style.background = 'rgba(77,156,255,0.03)'
        e.currentTarget.style.borderLeftColor = 'var(--accent-blue)'
        e.currentTarget.style.borderLeftWidth = '2px'
        e.currentTarget.style.borderLeftStyle = 'solid'
      }}
      onMouseLeave={(e) => {
        if (highlighted) return
        e.currentTarget.style.transform = 'translateX(0)'
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderLeftColor = 'transparent'
        e.currentTarget.style.borderLeftWidth = '0px'
        e.currentTarget.style.borderLeftStyle = 'none'
      }}
      onTouchStart={(e) => {
        e.currentTarget.style.transform = 'scale(0.99)'
      }}
      onTouchEnd={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {/* Rank */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '24px',
        color: 'var(--text-dim)',
        minWidth: '36px',
        textAlign: 'right',
      }}>
        {project.rank}
      </div>

      {/* Avatar */}
      <img
        src={project.avatar_url}
        alt=""
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid var(--border)',
          flexShrink: 0,
        }}
        loading="lazy"
      />

      {/* Name + Description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {project.name}
          </span>
          {project.builder_handle && (
            <a
              href={`?view=builder&handle=${encodeURIComponent(project.builder_handle)}`}
              onClick={(e) => { e.stopPropagation() }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-dim)',
                textDecoration: 'none',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-blue)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)' }}
            >
              @{project.builder_handle}
            </a>
          )}
        </div>
        <div
          className="row-description"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {stripHtml(project.description)}
        </div>
      </div>

      {/* Delta */}
      <div style={{ flexShrink: 0 }}>
        <DeltaBadge project={project} />
      </div>

      {/* Sparkline */}
      <Sparkline data={sparklineData} />

      {/* Stars gained */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--up)',
        minWidth: '48px',
        textAlign: 'right',
        flexShrink: 0,
      }}>
        +{project.stars_gained_7d}
      </div>

      {/* Category pill */}
      <span
        className="row-category"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--text-muted)',
          background: 'var(--surface)',
          padding: '2px 8px',
          borderRadius: '4px',
          border: '1px solid var(--border)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        {getCategoryLabel(project.category)}
      </span>

      {/* Share */}
      <ShareButton project={project} copiedId={copiedId} setCopiedId={setCopiedId} size="small" />

      {/* Arrow */}
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  )
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div>
      {/* Podium skeletons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '12px',
        marginBottom: '32px',
      }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            style={{
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px 20px',
              background: 'var(--surface)',
            }}
          >
            <div className="skeleton" style={{ width: '40px', height: '40px', marginBottom: '12px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              <div className="skeleton" style={{ width: '120px', height: '16px' }} />
            </div>
            <div className="skeleton" style={{ width: '100%', height: '12px', marginBottom: '6px' }} />
            <div className="skeleton" style={{ width: '60%', height: '12px', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="skeleton" style={{ width: '60px', height: '14px' }} />
              <div className="skeleton" style={{ width: '40px', height: '14px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Row skeletons */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            minHeight: '64px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="skeleton" style={{ width: '36px', height: '24px' }} />
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '140px', height: '14px', marginBottom: '4px' }} />
            <div className="skeleton" style={{ width: '200px', height: '12px' }} />
          </div>
          <div className="skeleton" style={{ width: '40px', height: '14px' }} />
          <div className="skeleton" style={{ width: '48px', height: '14px' }} />
        </div>
      ))}
    </div>
  )
}

// ─── Project Modal ───────────────────────────────────────────────────────────

function ProjectModal({ project, sparklineData, copiedId, setCopiedId, onClose }) {
  const [badgeCopied, setBadgeCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [badgeStyle, setBadgeStyle] = useState('default')

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!project) return null

  const slug = project.full_name.replace('/', '--')
  const shareUrl = `${API_BASE}/p/${slug}`
  const currentBadgeMd = badgeMdForStyle(slug, badgeStyle)
  const currentBadgeUrl = badgeUrlForStyle(slug, badgeStyle)

  const copyBadge = async () => {
    try {
      await navigator.clipboard.writeText(currentBadgeMd)
      setBadgeCopied(true)
      setTimeout(() => setBadgeCopied(false), 2000)
    } catch { /* noop */ }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch { /* noop */ }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeUp 0.2s ease-out',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-bright)',
          borderRadius: '16px',
          padding: '32px 28px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'fadeUp 0.3s ease-out',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Avatar + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <img
            src={project.avatar_url}
            alt=""
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--border)' }}
          />
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '20px' }}>
              {project.name}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
              {project.full_name}
              {project.builder_handle && (
                <>
                  {' · '}
                  <a
                    href={`?view=builder&handle=${encodeURIComponent(project.builder_handle)}`}
                    onClick={(e) => { e.stopPropagation() }}
                    style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}
                  >
                    @{project.builder_handle}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          margin: '16px 0',
        }}>
          {stripHtml(project.readme_summary || project.description)}
        </p>

        {/* Badges */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            background: 'var(--bg)',
            padding: '3px 10px',
            borderRadius: '4px',
            border: '1px solid var(--border)',
          }}>
            {getCategoryLabel(project.category)}
          </span>
          {project.claude_signal && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--claude-amber)',
              background: 'rgba(255,140,66,0.1)',
              padding: '3px 10px',
              borderRadius: '4px',
              border: '1px solid rgba(255,140,66,0.2)',
            }}>
              {getSignalLabel(project.claude_signal)}
            </span>
          )}
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: '16px',
          background: 'var(--bg)',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>RANK</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '28px', color: project.rank <= 3 ? 'var(--gold)' : 'var(--text-primary)' }}>
              #{project.rank}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>MOVEMENT</div>
            <div style={{ fontSize: '20px' }}>
              <DeltaBadge project={project} />
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>TOTAL STARS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 600 }}>
              ★ {project.stars_total.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>GAINED (7D)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 600, color: 'var(--up)' }}>
              +{project.stars_gained_7d.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Sparkline (larger) */}
        {sparklineData && sparklineData.length >= 2 && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg)',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            marginBottom: '20px',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px' }}>7-DAY TREND</div>
            <Sparkline data={sparklineData} width={200} height={60} />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '10px',
              background: 'var(--accent-blue)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View on GitHub
          </a>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={copyLink}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: linkCopied ? 'rgba(0,229,160,0.1)' : 'transparent',
                color: linkCopied ? 'var(--up)' : 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {linkCopied ? 'Copied!' : 'Copy share link'}
            </button>
            <ShareButton project={project} copiedId={copiedId} setCopiedId={setCopiedId} />
          </div>
        </div>

        {/* Badge embed with style picker */}
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'var(--bg)',
          borderRadius: '10px',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
              README BADGE
            </div>
            <button
              onClick={copyBadge}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: badgeCopied ? 'var(--up)' : 'var(--accent-blue)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              {badgeCopied ? 'Copied!' : 'Copy Markdown'}
            </button>
          </div>

          {/* Style pills */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {BADGE_STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => { setBadgeStyle(s.value); setBadgeCopied(false) }}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  fontWeight: badgeStyle === s.value ? 600 : 400,
                  color: badgeStyle === s.value ? 'var(--accent-blue)' : 'var(--text-muted)',
                  background: badgeStyle === s.value ? 'var(--accent-blue-glow)' : 'transparent',
                  border: `1px solid ${badgeStyle === s.value ? 'var(--accent-blue)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  padding: '3px 10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Live preview */}
          <div style={{ marginBottom: '8px', minHeight: '24px' }}>
            <img
              src={currentBadgeUrl}
              alt="Badge preview"
              style={{ height: '20px' }}
              key={badgeStyle}
            />
          </div>

          <code style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            wordBreak: 'break-all',
            lineHeight: 1.6,
          }}>
            {currentBadgeMd}
          </code>
        </div>

        {/* Claim section */}
        <ClaimSection project={project} />
      </div>
    </div>
  )
}

// ─── How Rankings Work ───────────────────────────────────────────────────────

function HowRankingsWork() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      marginTop: '48px',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => {
          setOpen(!open)
          track('rankings-toggle', { open: !open })
        }}
        style={{
          width: '100%',
          padding: '20px',
          background: 'var(--surface)',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          fontWeight: 600,
        }}
      >
        <span>How Rankings Work</span>
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div style={{
          padding: '0 20px 24px',
          background: 'var(--surface)',
          animation: 'fadeUp 0.3s ease-out',
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '20px',
            color: 'var(--gold)',
            marginTop: '0',
            marginBottom: '16px',
          }}>
            One metric: stars gained over 7 days.
          </p>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: 1.8,
            marginBottom: '24px',
          }}>
            <p style={{ margin: '0 0 12px' }}>
              Every day we snapshot every project's star count. The chart shows how many
              new stars each project picked up over a rolling 7-day window.
            </p>
            <p style={{ margin: '0 0 12px' }}>
              A repo with 12 total stars but +10 this week ranks above a repo with
              500 total stars but only +2. No algorithm, no editorial picks, no pay-to-play.
            </p>
            <p style={{ margin: 0 }}>
              The chart rolls forward every day. Last week's #1 has to earn it again.
              A project you shipped yesterday can be at the top by Friday.
            </p>
          </div>

          {/* Insight rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {[
              {
                title: 'Fresh beats old.',
                body: 'A brand-new repo with 50 stars this week outranks a 10k-star repo with 3. The chart measures what\'s happening now, not what happened last year.',
              },
              {
                title: 'One number, no tricks.',
                body: 'Stars gained in 7 days. That\'s the only input. You can verify any ranking yourself by checking the repo\'s star history.',
              },
              {
                title: 'It rewards shipping.',
                body: 'The fastest way up the chart is to ship something people want. No SEO tricks, no growth hacks — just build and share.',
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px' }}>
                <span style={{
                  color: 'var(--up)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 500,
                  flexShrink: 0,
                  lineHeight: 1.6,
                }}>
                  ↑
                </span>
                <div>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                  }}>
                    {item.title}
                  </span>{' '}
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}>
                    {item.body}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* What NEW means */}
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '16px',
            marginBottom: '16px',
          }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '14px',
              marginBottom: '6px',
            }}>
              What <span style={{
                color: 'var(--gold)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                background: 'rgba(255,184,48,0.12)',
                padding: '1px 6px',
                borderRadius: '3px',
              }}>NEW</span> means
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              margin: 0,
            }}>
              A project tagged NEW wasn't on the chart yesterday but is today.
              It could be a brand-new repo or an older one that just hit its stride.
            </p>
          </div>

          {/* What we verify */}
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '16px',
          }}>
            <div style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '14px',
              marginBottom: '6px',
            }}>
              What we verify
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              margin: 0,
            }}>
              Every project on this chart has a verified Claude Code signal — either
              a CLAUDE.md file in the repo, Claude Code mentioned in commits, or confirmation
              from the builder. We check so you don't have to.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Hall of Fame ────────────────────────────────────────────────────────────

function HallOfFame() {
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    if (!supabase) return
    async function fetchFeatured() {
      const { data } = await supabase
        .from('ranked_projects')
        .select('*')
        .eq('category', 'featured')
        .order('stars_total', { ascending: false })
      setFeatured(data || [])
    }
    fetchFeatured()
  }, [])

  if (featured.length === 0) return null

  return (
    <div style={{ marginTop: '48px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '18px',
          margin: '0 0 4px',
          color: 'var(--text-primary)',
        }}>
          Hall of Fame
        </h3>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-dim)',
          margin: 0,
        }}>
          Projects that shaped the ecosystem
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
        paddingBottom: '8px',
        scrollbarWidth: 'thin',
      }}>
        {featured.map(project => (
          <a
            key={project.id}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              minWidth: '220px',
              maxWidth: '260px',
              padding: '16px',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              background: 'var(--surface)',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              transition: 'border-color 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={project.avatar_url}
                alt=""
                width={28}
                height={28}
                style={{ borderRadius: '6px', opacity: 0.8 }}
              />
              <span style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '14px',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {project.full_name?.split('/')[1] || project.full_name}
              </span>
            </div>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              margin: 0,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}>
              {project.description}
            </p>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-dim)',
            }}>
              {project.stars_total >= 1000
                ? `${(project.stars_total / 1000).toFixed(1)}k`
                : project.stars_total} ★
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

// SHA-256 hash loaded from VITE_DASHBOARD_HASH env var (see .env)
const DASHBOARD_PASSWORD_HASH = import.meta.env.VITE_DASHBOARD_HASH || ''

function DashboardGate({ children }) {
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem('sr-dash') === '1' } catch { return false }
  })
  const [input, setInput] = useState('')

  if (authed) return children

  return (
    <div style={{
      maxWidth: '360px',
      margin: '120px auto',
      padding: '0 16px',
      textAlign: 'center',
    }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '20px',
        marginBottom: '24px',
      }}>
        ShipRanked Dashboard
      </h2>
      <input
        type="password"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
              .then(buf => {
                const hash = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
                if (hash === DASHBOARD_PASSWORD_HASH) {
                  sessionStorage.setItem('sr-dash', '1')
                  setAuthed(true)
                } else {
                  setInput('')
                }
              })
          }
        }}
        placeholder="Password"
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-dim)',
        marginTop: '12px',
      }}>
        Press Enter to continue
      </p>
    </div>
  )
}

// ─── Dashboard: Tab & Analytics Components ──────────────────────────────────

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid var(--accent-blue)' : '2px solid transparent',
        padding: '8px 16px',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--text-primary)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = 'var(--text-muted)'
      }}
    >
      {label}
    </button>
  )
}

function AnalyticsSkeleton() {
  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ padding: '16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <div className="skeleton" style={{ width: '80px', height: '10px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ width: '60px', height: '28px' }} />
          </div>
        ))}
      </div>
      <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '10px' }} />
    </div>
  )
}

function AnalyticsUnavailable() {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      color: 'var(--text-dim)',
      textAlign: 'center',
      padding: '48px 0',
    }}>
      Analytics data is currently unavailable.
    </div>
  )
}

function SummaryCards({ summary }) {
  const cards = [
    { label: 'Total Events', value: summary.total },
    { label: 'Today', value: summary.today },
    { label: 'Badge Views', value: summary.badgeViews },
    { label: 'Share Clicks', value: summary.shareClicks },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '32px' }}>
      {cards.map(card => (
        <div key={card.label} style={{
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            {card.label}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            {card.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  )
}

function EventsByType({ byType }) {
  if (!byType.length) return null
  const max = byType[0].count
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '16px',
        marginBottom: '16px',
        color: 'var(--text-primary)',
      }}>
        Events by Type
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {byType.map(item => (
          <div key={item.event} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              width: '140px',
              flexShrink: 0,
              textAlign: 'right',
            }}>
              {item.event}
            </span>
            <div style={{
              flex: 1,
              height: '6px',
              background: 'var(--border)',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(item.count / max) * 100}%`,
                height: '100%',
                background: 'var(--accent-blue)',
                borderRadius: '3px',
                transition: 'width 0.5s ease-out',
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-primary)',
              width: '48px',
              flexShrink: 0,
            }}>
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DailyTrend({ dailyTrend }) {
  if (!dailyTrend.length) return null
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '16px',
        marginBottom: '16px',
        color: 'var(--text-primary)',
      }}>
        Daily Trend (14 days)
      </h3>
      <Sparkline
        data={dailyTrend.map(d => d.count)}
        width={780}
        height={60}
        color="var(--accent-blue)"
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--text-dim)',
        marginTop: '4px',
      }}>
        <span>{dailyTrend[0].date}</span>
        <span>{dailyTrend[dailyTrend.length - 1].date}</span>
      </div>
    </div>
  )
}

function TopBadgeProjects({ projects }) {
  if (!projects.length) {
    return (
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '16px',
          marginBottom: '16px',
          color: 'var(--text-primary)',
        }}>
          Top Badge Projects
        </h3>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-dim)',
        }}>
          No badge views yet
        </div>
      </div>
    )
  }
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '16px',
        marginBottom: '16px',
        color: 'var(--text-primary)',
      }}>
        Top Badge Projects
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {projects.map((p, i) => (
          <div key={p.project} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            background: i === 0 ? 'rgba(255,184,48,0.04)' : 'transparent',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-dim)',
              width: '24px',
            }}>
              #{i + 1}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-primary)',
              flex: 1,
            }}>
              {p.project.replace('github:', '')}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--accent-blue)',
              background: 'var(--accent-blue-glow)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}>
              {p.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatEventData(event, data) {
  if (!data) return ''
  if (event === 'badge-view' || event === 'project-click') {
    return data.project?.replace('github:', '') || ''
  }
  if (event === 'share-click') {
    return data.name || data.project?.replace('github:', '') || ''
  }
  if (event === 'category-filter') return data.category || ''
  if (event === 'sort-toggle') return data.sortBy || ''
  if (event === 'filter-new' || event === 'filter-small') return data.active ? 'on' : 'off'
  const vals = Object.values(data)
  const first = vals.find(v => typeof v === 'string')
  return first ? (first.length > 40 ? first.slice(0, 37) + '...' : first) : ''
}

function RecentActivity({ recent }) {
  if (!recent.length) return null
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: '16px',
        marginBottom: '16px',
        color: 'var(--text-primary)',
      }}>
        Recent Activity
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {recent.map((e, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 8px',
            borderRadius: '6px',
            fontSize: '12px',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: e.source === 'client' ? 'var(--up)' : 'var(--accent-blue)',
              flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              fontWeight: 500,
              width: '120px',
              flexShrink: 0,
            }}>
              {e.event}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {formatEventData(e.event, e.data)}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)',
              flexShrink: 0,
            }}>
              {timeAgo(e.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('https://ship-ranked.vercel.app/api/analytics')
      .then(res => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  if (loading) return <AnalyticsSkeleton />
  if (error || !data) return <AnalyticsUnavailable />

  return (
    <div>
      <SummaryCards summary={data.summary} />
      <EventsByType byType={data.byType} />
      <DailyTrend dailyTrend={data.dailyTrend} />
      <TopBadgeProjects projects={data.topBadgeProjects} />
      <RecentActivity recent={data.recent} />
    </div>
  )
}

function Dashboard() {
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState(null)
  const [tab, setTab] = useState('drafts')

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    async function fetchDrafts() {
      const { data } = await supabase
        .from('weekly_drafts')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(20)
      setDrafts(data || [])
      setLoading(false)
    }
    fetchDrafts()
  }, [])

  const copyToClipboard = useCallback((text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedField(id)
    setTimeout(() => setCopiedField(null), 2000)
  }, [])

  const markPosted = useCallback(async (draftId) => {
    if (!supabase) return
    await supabase.from('weekly_drafts').update({ posted: true }).eq('id', draftId)
    setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, posted: true } : d))
  }, [])

  // Group drafts by week_start
  const grouped = useMemo(() => {
    const map = {}
    for (const d of drafts) {
      const week = d.week_start || 'unknown'
      if (!map[week]) map[week] = []
      map[week].push(d)
    }
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [drafts])

  const CopyButton = ({ text, id, label }) => (
    <button
      onClick={() => copyToClipboard(text, id)}
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        border: '1px solid var(--border)',
        background: copiedField === id ? 'rgba(34,197,94,0.15)' : 'var(--surface)',
        color: copiedField === id ? 'var(--up)' : 'var(--text-muted)',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        transition: 'all 0.2s',
      }}
    >
      {copiedField === id ? 'Copied!' : label || 'Copy'}
    </button>
  )

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '24px',
            margin: '0 0 4px',
          }}>
            Dashboard
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-dim)',
            margin: 0,
          }}>
            ShipRanked admin tools
          </p>
        </div>
        <a
          href="?"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          ← Back to rankings
        </a>
      </div>

      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <TabButton label="Drafts" active={tab === 'drafts'} onClick={() => setTab('drafts')} />
        <TabButton label="Analytics" active={tab === 'analytics'} onClick={() => setTab('analytics')} />
      </div>

      {tab === 'drafts' ? (<>
      {loading && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', padding: '48px 0' }}>
          Loading drafts...
        </div>
      )}

      {!loading && drafts.length === 0 && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-dim)', textAlign: 'center', padding: '48px 0' }}>
          No drafts yet. Drafts are generated on Mondays.
        </div>
      )}

      {grouped.map(([week, weekDrafts]) => (
        <div key={week} style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '16px',
            marginBottom: '16px',
            color: 'var(--text-primary)',
          }}>
            Week of {week}
          </h3>

          {weekDrafts.map(draft => (
            <div
              key={draft.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '12px',
                background: draft.posted ? 'rgba(34,197,94,0.03)' : 'var(--surface)',
                opacity: draft.posted ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: draft.platform === 'reddit' ? 'rgba(255,69,0,0.12)' : 'rgba(29,155,240,0.12)',
                  color: draft.platform === 'reddit' ? '#ff4500' : '#1d9bf0',
                  textTransform: 'uppercase',
                }}>
                  {draft.platform}
                </span>
                {draft.subreddit && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                  }}>
                    r/{draft.subreddit}
                  </span>
                )}
                {draft.posted && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--up)',
                    fontWeight: 600,
                  }}>
                    POSTED
                  </span>
                )}
                <div style={{ flex: 1 }} />
                {!draft.posted && (
                  <button
                    onClick={() => markPosted(draft.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-dim)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                    }}
                  >
                    Mark posted
                  </button>
                )}
              </div>

              {draft.suggested_title && (
                <div style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '14px',
                  marginBottom: '8px',
                }}>
                  {draft.suggested_title}
                </div>
              )}

              {draft.platform === 'x' ? (
                // X thread: parse JSON and show each tweet separately
                (() => {
                  try {
                    const tweets = JSON.parse(draft.content)
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {Object.entries(tweets).map(([key, text]) => (
                          <div key={key} style={{
                            padding: '12px',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.02)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '10px',
                                color: 'var(--text-dim)',
                                textTransform: 'uppercase',
                              }}>
                                {key}
                              </span>
                              <CopyButton text={text} id={`${draft.id}-${key}`} label="Copy tweet" />
                            </div>
                            <pre style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '12px',
                              color: 'var(--text-muted)',
                              lineHeight: 1.6,
                              margin: 0,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                            }}>
                              {text}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )
                  } catch {
                    // Fallback: show raw content
                    return (
                      <pre style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        lineHeight: 1.6,
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {draft.content}
                      </pre>
                    )
                  }
                })()
              ) : (
                // Reddit: show full content with copy button
                <div>
                  <pre style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    margin: '0 0 12px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {draft.content}
                  </pre>
                  <CopyButton text={draft.content} id={draft.id} label="Copy post" />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      </>) : (
        <AnalyticsTab />
      )}
    </div>
  )
}

// ─── API Base ────────────────────────────────────────────────────────────────

const API_BASE = 'https://ship-ranked.vercel.app'
const SPA_BASE = 'https://jerrysoer.github.io/ship-ranked/'

// ─── Badge Style Picker ─────────────────────────────────────────────────────

const BADGE_STYLES = [
  { value: 'default', label: 'Default' },
  { value: 'compact', label: 'Compact' },
  { value: 'trending', label: 'Trending' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
]

function badgeUrlForStyle(slug, style) {
  const base = `${API_BASE}/api/badge?project=${slug}`
  return style === 'default' ? base : `${base}&style=${style}`
}

function badgeMdForStyle(slug, style) {
  const badgeUrl = badgeUrlForStyle(slug, style)
  const shareUrl = `${API_BASE}/p/${slug}`
  return `[![ShipRanked](${badgeUrl})](${shareUrl})`
}

// ─── Claim Section ──────────────────────────────────────────────────────────

function ClaimSection({ project }) {
  const [claimStatus, setClaimStatus] = useState(null) // null | 'loading' | 'unclaimed' | 'verified' | 'editing'
  const [profile, setProfile] = useState(null)
  const [handle, setHandle] = useState('')
  const [claimResult, setClaimResult] = useState(null) // { ok, reason, instructions, claim_token }
  const [editFields, setEditFields] = useState({ tagline: '', website_url: '', x_handle: '', discord_url: '' })
  const [saving, setSaving] = useState(false)

  // Check claim status on mount
  useEffect(() => {
    setClaimStatus('loading')
    fetch(`${API_BASE}/api/claim?project_id=${encodeURIComponent(project.id)}`)
      .then(r => r.json())
      .then(data => {
        if (data.claimed) {
          setProfile(data.profile)
          setEditFields({
            tagline: data.profile?.tagline || '',
            website_url: data.profile?.website_url || '',
            x_handle: data.profile?.x_handle || '',
            discord_url: data.profile?.discord_url || '',
          })
          setClaimStatus('verified')
        } else {
          setClaimStatus('unclaimed')
        }
      })
      .catch(() => setClaimStatus('unclaimed'))
  }, [project.id])

  const submitClaim = async () => {
    setClaimResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: project.id, github_handle: handle }),
      })
      const data = await res.json()
      setClaimResult(data)
      if (data.ok) {
        try { localStorage.setItem(`sr-claim-${project.id}`, data.claim_token) } catch {}
        setClaimStatus('verified')
        setProfile({ github_handle: handle, verified: true })
      }
    } catch {
      setClaimResult({ ok: false, reason: 'error', instructions: 'Something went wrong. Please try again.' })
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    const token = claimResult?.claim_token || (() => {
      try { return localStorage.getItem(`sr-claim-${project.id}`) } catch { return null }
    })()
    if (!token) { setSaving(false); return }

    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_handle: profile.github_handle, claim_token: token, ...editFields }),
      })
      const data = await res.json()
      if (data.ok) setProfile(data.profile)
    } catch { /* noop */ }
    setSaving(false)
  }

  if (claimStatus === 'loading' || claimStatus === null) return null

  const sectionStyle = {
    marginTop: '16px',
    padding: '12px 16px',
    background: 'var(--bg)',
    borderRadius: '10px',
    border: '1px solid var(--border)',
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-dim)',
    marginBottom: '4px',
    display: 'block',
  }

  // Verified — show profile with edit
  if (claimStatus === 'verified') {
    const hasToken = claimResult?.claim_token || (() => {
      try { return localStorage.getItem(`sr-claim-${project.id}`) } catch { return null }
    })()

    return (
      <div style={sectionStyle}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px',
        }}>
          <span style={{ color: 'var(--up)', fontSize: '14px' }}>✓</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--up)', fontWeight: 600 }}>
            CLAIMED
          </span>
        </div>

        {profile?.tagline && (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
            "{profile.tagline}"
          </p>
        )}

        {hasToken && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <div>
                <label style={labelStyle}>Tagline</label>
                <input style={inputStyle} value={editFields.tagline} onChange={e => setEditFields(f => ({ ...f, tagline: e.target.value }))} placeholder="Your tagline..." />
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input style={inputStyle} value={editFields.website_url} onChange={e => setEditFields(f => ({ ...f, website_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label style={labelStyle}>X Handle</label>
                <input style={inputStyle} value={editFields.x_handle} onChange={e => setEditFields(f => ({ ...f, x_handle: e.target.value }))} placeholder="@handle" />
              </div>
              <div>
                <label style={labelStyle}>Discord</label>
                <input style={inputStyle} value={editFields.discord_url} onChange={e => setEditFields(f => ({ ...f, discord_url: e.target.value }))} placeholder="https://discord.gg/..." />
              </div>
            </div>
            <button
              onClick={saveProfile}
              disabled={saving}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'var(--accent-blue)',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '12px',
                cursor: saving ? 'wait' : 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </>
        )}
      </div>
    )
  }

  // Unclaimed — show claim form
  return (
    <div style={sectionStyle}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px' }}>
        CLAIM THIS PROJECT
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={handle}
          onChange={e => setHandle(e.target.value)}
          placeholder="Your GitHub username"
          onKeyDown={e => { if (e.key === 'Enter' && handle) submitClaim() }}
        />
        <button
          onClick={submitClaim}
          disabled={!handle}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid var(--accent-blue)',
            background: 'var(--accent-blue)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '12px',
            cursor: handle ? 'pointer' : 'not-allowed',
            opacity: handle ? 1 : 0.5,
            flexShrink: 0,
          }}
        >
          Claim
        </button>
      </div>
      {claimResult && !claimResult.ok && (
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: claimResult.reason === 'no-shipranked-md' ? 'var(--gold)' : 'var(--down)',
          marginTop: '8px',
          lineHeight: 1.6,
        }}>
          {claimResult.instructions}
        </p>
      )}
    </div>
  )
}

// ─── Weekly Recap ────────────────────────────────────────────────────────────

function WeeklyRecap() {
  const params = new URLSearchParams(window.location.search)
  const [week, setWeek] = useState(params.get('week') || '')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recapCopied, setRecapCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    const url = week
      ? `${API_BASE}/api/recap?week=${encodeURIComponent(week)}`
      : `${API_BASE}/api/recap`
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setWeek(d.week); setLoading(false) })
      .catch(() => setLoading(false))
  }, [week])

  const navigateWeek = (direction) => {
    if (!data?.week) return
    const [year, wNum] = data.week.split('-W').map(Number)
    const newWeek = direction === 'next' ? wNum + 1 : wNum - 1
    // Simplified week navigation (doesn't handle year boundaries perfectly)
    const newYear = newWeek < 1 ? year - 1 : newWeek > 52 ? year + 1 : year
    const adjustedWeek = newWeek < 1 ? 52 : newWeek > 52 ? 1 : newWeek
    const newWeekStr = `${newYear}-W${String(adjustedWeek).padStart(2, '0')}`
    setWeek(newWeekStr)
    const url = new URL(window.location)
    url.searchParams.set('week', newWeekStr)
    window.history.replaceState({}, '', url)
  }

  const copyRecapUrl = async () => {
    const shareUrl = `${API_BASE}/recap/${data?.week || week}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setRecapCopied(true)
      setTimeout(() => setRecapCopied(false), 2000)
    } catch {}
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '18px', letterSpacing: '0.05em' }}>
          SHIPRANKED
        </div>
        <a href="?" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Back to rankings
        </a>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div className="skeleton" style={{ width: '200px', height: '32px', margin: '0 auto 16px' }} />
          <div className="skeleton" style={{ width: '300px', height: '20px', margin: '0 auto' }} />
        </div>
      ) : !data ? (
        <div style={{ textAlign: 'center', padding: '80px 0', fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>
          No recap data available for this week.
        </div>
      ) : (
        <>
          {/* Week title */}
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--gold)', letterSpacing: '2px', marginBottom: '8px' }}>
              WEEKLY RECAP
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 4vw, 36px)', margin: '0 0 8px' }}>
              Week of {data.weekLabel}
            </h1>
          </div>

          {/* Winner spotlight */}
          {data.top5?.[0] && (() => {
            const winner = data.top5[0]
            return (
              <div style={{
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(255,184,48,0.3)',
                background: 'radial-gradient(ellipse at top, rgba(255,184,48,0.08) 0%, var(--surface) 70%)',
                textAlign: 'center',
                marginBottom: '32px',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '64px', color: 'var(--gold)', lineHeight: 1 }}>
                  #1
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '12px 0' }}>
                  {winner.avatar_url && (
                    <img src={winner.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)' }} />
                  )}
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '24px' }}>{winner.name}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px', maxWidth: '400px', marginInline: 'auto' }}>
                  {winner.description}
                </p>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--up)' }}>
                  ★ {winner.stars_total?.toLocaleString()} · +{winner.stars_gained_7d?.toLocaleString()} this week
                </div>
              </div>
            )
          })()}

          {/* Top 5 list */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', marginBottom: '12px' }}>Top 5</h2>
            {data.top5?.map((p, i) => (
              <div key={p.full_name || i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: i === 0 ? 'var(--gold)' : 'var(--text-dim)', minWidth: '28px' }}>
                  {p.rank}
                </span>
                {p.avatar_url && <img src={p.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)' }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px' }}>{p.name}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
                  ★ {formatNumber(p.stars_total || 0)}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500, color: 'var(--up)' }}>
                  +{p.stars_gained_7d || 0}
                </span>
              </div>
            ))}
          </div>

          {/* Biggest Movers */}
          {data.biggestMovers?.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', marginBottom: '12px' }}>Biggest Movers</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {data.biggestMovers.map((p, i) => (
                  <div key={p.full_name || i} style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '28px', color: 'var(--up)' }}>
                      ↑{p.rank_delta}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', marginTop: '4px' }}>{p.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Now #{p.rank}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New This Week */}
          {data.newEntries?.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '18px', marginBottom: '12px' }}>New This Week</h2>
              {data.newEntries.map((p, i) => (
                <div key={p.full_name || i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--gold)',
                    background: 'rgba(255,184,48,0.12)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}>NEW</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', flex: 1 }}>{p.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>#{p.rank}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stats bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            marginBottom: '32px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px' }}>{data.stats?.totalProjects || 0}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>PROJECTS</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px', color: 'var(--up)' }}>
                +{(data.stats?.totalStarsGained || 0).toLocaleString()}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>STARS GAINED</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px', color: 'var(--gold)' }}>{data.stats?.newCount || 0}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>NEW ENTRIES</div>
            </div>
          </div>

          {/* Week navigator + share */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', paddingBottom: '48px' }}>
            <button
              onClick={() => navigateWeek('prev')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              ← Prev Week
            </button>
            <button
              onClick={copyRecapUrl}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: recapCopied ? 'rgba(0,229,160,0.1)' : 'transparent',
                color: recapCopied ? 'var(--up)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {recapCopied ? 'Copied!' : 'Share Recap'}
            </button>
            <button
              onClick={() => navigateWeek('next')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Next Week →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Builder Profile ─────────────────────────────────────────────────────────

function BuilderProfile() {
  const params = new URLSearchParams(window.location.search)
  const handle = params.get('handle') || ''
  const [projects, setProjects] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [builderCopied, setBuilderCopied] = useState(false)

  useEffect(() => {
    if (!handle) { setLoading(false); return }
    setLoading(true)

    const fetches = []

    // Fetch builder's projects
    if (supabase) {
      fetches.push(
        supabase.from('ranked_projects').select('*')
          .eq('builder_handle', handle)
          .eq('review_status', 'approved')
          .order('rank')
          .then(({ data }) => setProjects(data || []))
      )
      fetches.push(
        supabase.from('builder_profiles').select('*')
          .eq('github_handle', handle)
          .single()
          .then(({ data }) => setProfile(data))
      )
    }

    Promise.all(fetches).finally(() => setLoading(false))
  }, [handle])

  const copyBuilderUrl = async () => {
    const shareUrl = `${API_BASE}/builder/${encodeURIComponent(handle)}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setBuilderCopied(true)
      setTimeout(() => setBuilderCopied(false), 2000)
    } catch {}
  }

  // Stats
  const totalStars = projects.reduce((s, p) => s + (p.stars_total || 0), 0)
  const starsGained7d = projects.reduce((s, p) => s + (p.stars_gained_7d || 0), 0)
  const bestRank = projects.length > 0 ? Math.min(...projects.map(p => p.rank || 999)) : null

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ padding: '16px 0' }}>
        <a href="?" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Back to rankings
        </a>
      </div>

      {loading ? (
        <div style={{ padding: '48px 0' }}>
          <div className="skeleton" style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: '16px' }} />
          <div className="skeleton" style={{ width: '200px', height: '24px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '150px', height: '16px' }} />
        </div>
      ) : (
        <>
          {/* Builder card */}
          <div style={{ padding: '32px 0 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src={`https://avatars.githubusercontent.com/${handle}`}
              alt=""
              style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--border)' }}
            />
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', margin: '0 0 4px' }}>
                @{handle}
              </h1>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href={`https://github.com/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-blue)', textDecoration: 'none' }}
                >
                  GitHub
                </a>
                {profile?.x_handle && (
                  <a
                    href={`https://x.com/${profile.x_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-blue)', textDecoration: 'none' }}
                  >
                    {profile.x_handle}
                  </a>
                )}
              </div>
              {profile?.tagline && (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 0' }}>
                  {profile.tagline}
                </p>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            marginBottom: '24px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px' }}>{totalStars.toLocaleString()}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>TOTAL STARS</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px', color: 'var(--up)' }}>+{starsGained7d.toLocaleString()}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>GAINED (7D)</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px', color: 'var(--gold)' }}>
                {bestRank ? `#${bestRank}` : '—'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>BEST RANK</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '24px' }}>{projects.length}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>PROJECTS</div>
            </div>
          </div>

          {/* Project list */}
          {projects.length > 0 ? (
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  onClick={() => {
                    const url = new URL(window.location)
                    url.searchParams.delete('view')
                    url.searchParams.delete('handle')
                    url.searchParams.set('project', project.full_name.replace('/', '--'))
                    window.location.href = url.toString()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(77,156,255,0.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--text-dim)', minWidth: '32px', textAlign: 'right' }}>
                    {project.rank || '—'}
                  </div>
                  <img src={project.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)' }} loading="lazy" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px' }}>{project.name}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {stripHtml(project.description)}
                    </div>
                  </div>
                  <DeltaBadge project={project} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500, color: 'var(--up)', minWidth: '48px', textAlign: 'right' }}>
                    +{project.stars_gained_7d || 0}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-muted)' }}>
              No ranked projects found for @{handle}.
            </div>
          )}

          {/* Share button */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
            <button
              onClick={copyBuilderUrl}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: builderCopied ? 'rgba(0,229,160,0.1)' : 'transparent',
                color: builderCopied ? 'var(--up)' : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {builderCopied ? 'Copied!' : 'Share Profile'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  // View routing
  const view = getView()
  if (view === 'dashboard') {
    return (
      <DashboardGate>
        <Dashboard />
      </DashboardGate>
    )
  }
  if (view === 'recap') return <WeeklyRecap />
  if (view === 'builder') return <BuilderProfile />

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(getInitialCategory)
  const [copiedId, setCopiedId] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [highlightedProject, setHighlightedProject] = useState(null)
  const deepLinkTarget = useMemo(() => getDeepLinkProject(), [])

  // New state: filters & sorting
  const [sortBy, setSortBy] = useState('rank')
  const [showNewOnly, setShowNewOnly] = useState(false)
  const [smallOnly, setSmallOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)

  // New state: banner
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try { return sessionStorage.getItem('sr-banner-dismissed') === '1' } catch { return false }
  })

  // New state: sparklines + modal
  const [sparklines, setSparklines] = useState({})
  const [detailProject, setDetailProject] = useState(null)

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      if (!supabase) {
        let filtered = [...MOCK_DATA]
        if (category !== 'all') filtered = filtered.filter(p => p.category === category)
        if (showNewOnly) filtered = filtered.filter(p => p.is_new)
        if (smallOnly) filtered = filtered.filter(p => p.stars_total < 1000)
        if (sortBy === 'movers') {
          filtered.sort((a, b) => (b.rank_delta || 0) - (a.rank_delta || 0))
          filtered = filtered.map((p, i) => ({ ...p, rank: i + 1 }))
        }
        setProjects(filtered)
        setLoading(false)
        return
      }

      let query = supabase.from('ranked_projects').select('*')
        .eq('review_status', 'approved')
        .neq('category', 'featured')

      if (sortBy === 'movers') {
        query = query.order('rank_delta', { ascending: false })
      } else {
        query = query.order('rank', { ascending: true })
      }

      query = query.limit(25)
      if (category !== 'all') query = query.eq('category', category)
      if (showNewOnly) query = query.eq('is_new', true)
      if (smallOnly) query = query.lt('stars_total', 1000)

      const { data } = await query
      let results = data || []

      // Re-assign visual rank when sorting by movers
      if (sortBy === 'movers') {
        results = results.map((p, i) => ({ ...p, rank: i + 1 }))
      }

      setProjects(results)
      setLoading(false)
    }
    fetchData()
  }, [category, sortBy, showNewOnly, smallOnly])

  // Fetch sparkline snapshots
  useEffect(() => {
    if (!supabase || projects.length === 0) return
    async function fetchSparklines() {
      const projectIds = projects.map(p => p.id)
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
      const { data } = await supabase
        .from('ranked_snapshots')
        .select('project_id,stars_total,captured_at')
        .in('project_id', projectIds)
        .gte('captured_at', sevenDaysAgo)
        .order('captured_at', { ascending: true })
      if (!data) return
      const grouped = {}
      for (const row of data) {
        if (!grouped[row.project_id]) grouped[row.project_id] = []
        grouped[row.project_id].push(row.stars_total)
      }
      setSparklines(grouped)
    }
    fetchSparklines()
  }, [projects])

  // Deep-link: scroll to ?project= and highlight
  useEffect(() => {
    if (!deepLinkTarget || loading || projects.length === 0) return
    const match = projects.find(p => p.full_name === deepLinkTarget)
    if (!match) return

    track('og-view', { name: match.name, rank: match.rank })

    const scrollTimer = setTimeout(() => {
      setHighlightedProject(match.full_name)
      const el = document.querySelector(`[data-project="${CSS.escape(match.full_name)}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 600)

    const clearTimer = setTimeout(() => setHighlightedProject(null), 3600)
    return () => { clearTimeout(scrollTimer); clearTimeout(clearTimer) }
  }, [deepLinkTarget, loading, projects])

  // Scroll detection for header glass effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 240)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Category change handler
  const handleCategoryChange = useCallback((value) => {
    setCategory(value)
    const url = new URL(window.location)
    if (value === 'all') {
      url.searchParams.delete('category')
    } else {
      url.searchParams.set('category', value)
    }
    window.history.replaceState({}, '', url)
    track('category-filter', { category: value })
  }, [])

  // Banner dismiss handler
  const dismissBanner = useCallback(() => {
    setBannerDismissed(true)
    try { sessionStorage.setItem('sr-banner-dismissed', '1') } catch { /* noop */ }
  }, [])

  // Client-side search filter
  const filteredProjects = useMemo(() => {
    if (!debouncedSearch) return projects
    const q = debouncedSearch.toLowerCase()
    return projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.full_name.toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    )
  }, [projects, debouncedSearch])

  // Show banner when all stars_gained_7d are 0 (data is calibrating)
  const showBanner = !bannerDismissed && projects.length > 0 && projects.every(p => p.stars_gained_7d === 0)

  const podium = filteredProjects.slice(0, 3)
  const rows = filteredProjects.slice(3)
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 16px' }}>

      {/* ─── Header ─────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          background: scrolled ? 'rgba(10,15,30,0.85)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          transition: 'all 0.3s',
          margin: '0 -16px',
          paddingInline: '16px',
          paddingBlock: '16px',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '18px',
          letterSpacing: '0.05em',
        }}>
          SHIPRANKED
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          animation: 'softPulse 3s ease-in-out infinite',
        }}>
          Updated {lastUpdated}
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <div style={{
        padding: '48px 0 32px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(28px, 5vw, 42px)',
          lineHeight: 1.1,
          margin: '0 0 12px',
        }}>
          Who shipped it best
          <br />
          <span style={{ color: 'var(--gold)' }}>this week?</span>
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          color: 'var(--text-muted)',
          maxWidth: '480px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Live leaderboard ranking Claude Code projects by weekly star momentum.
          No algorithms — just what people are starring right now.
        </p>
      </div>

      {/* ─── Calibration Banner ───────────────────────────────────── */}
      {showBanner && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          border: '1px solid rgba(255,184,48,0.25)',
          borderRadius: '10px',
          background: 'rgba(255,184,48,0.04)',
          animation: 'fadeUp 0.4s ease-out',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}>
            <span style={{ color: 'var(--gold)', fontWeight: 600 }}>Rankings are calibrating</span>
            {' — full 7-day star data by '}
            {new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
          </div>
          <button
            onClick={dismissBanner}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ─── Search ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ position: 'relative' }}>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects..."
            style={{
              width: '100%',
              padding: '10px 36px 10px 36px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-bright)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ─── Filter Bar ──────────────────────────────────────────── */}
      <div
        style={{
          position: 'sticky',
          top: '53px',
          zIndex: 40,
          margin: '0 -16px',
          padding: '12px 16px',
          backdropFilter: 'blur(12px)',
          background: 'rgba(10,15,30,0.85)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '2px',
          }}
        >
          {/* Category pills */}
          {CATEGORIES.map(cat => {
            const isActive = category === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                  background: isActive ? 'var(--accent-blue-glow)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--accent-blue)' : 'var(--border)'}`,
                  borderRadius: '20px',
                  padding: '6px 16px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                  touchAction: 'manipulation',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = 'var(--border-bright)'
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                {cat.label}
              </button>
            )
          })}

          {/* Separator */}
          <div style={{ width: '1px', background: 'var(--border)', flexShrink: 0, margin: '4px 4px' }} />

          {/* Biggest Movers toggle */}
          <button
            onClick={() => {
              const next = sortBy === 'movers' ? 'rank' : 'movers'
              setSortBy(next)
              track('sort-toggle', { sortBy: next })
            }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: sortBy === 'movers' ? 600 : 500,
              color: sortBy === 'movers' ? 'var(--up)' : 'var(--text-muted)',
              background: sortBy === 'movers' ? 'rgba(0,229,160,0.1)' : 'transparent',
              border: `1px solid ${sortBy === 'movers' ? 'var(--up)' : 'var(--border)'}`,
              borderRadius: '20px',
              padding: '6px 16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              touchAction: 'manipulation',
              flexShrink: 0,
            }}
          >
            Biggest Movers
          </button>

          {/* New This Week */}
          <button
            onClick={() => {
              setShowNewOnly(!showNewOnly)
              track('filter-new', { active: !showNewOnly })
            }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: showNewOnly ? 600 : 500,
              color: showNewOnly ? 'var(--gold)' : 'var(--text-muted)',
              background: showNewOnly ? 'rgba(255,184,48,0.1)' : 'transparent',
              border: `1px solid ${showNewOnly ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: '20px',
              padding: '6px 16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              touchAction: 'manipulation',
              flexShrink: 0,
            }}
          >
            New This Week
          </button>

          {/* Under 1k Stars */}
          <button
            onClick={() => {
              setSmallOnly(!smallOnly)
              track('filter-small', { active: !smallOnly })
            }}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: smallOnly ? 600 : 500,
              color: smallOnly ? 'var(--claude-amber)' : 'var(--text-muted)',
              background: smallOnly ? 'rgba(255,140,66,0.1)' : 'transparent',
              border: `1px solid ${smallOnly ? 'var(--claude-amber)' : 'var(--border)'}`,
              borderRadius: '20px',
              padding: '6px 16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              touchAction: 'manipulation',
              flexShrink: 0,
            }}
          >
            Under 1k Stars
          </button>
        </div>
      </div>

      {/* ─── Content ────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ paddingTop: '24px' }}>
          <LoadingSkeleton />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          color: 'var(--text-muted)',
        }}>
          {debouncedSearch
            ? `No projects matching "${debouncedSearch}".`
            : 'No projects found in this category yet.'}
        </div>
      ) : (
        <>
          {/* ─── Podium ─────────────────────────────────────────── */}
          <div style={{ paddingTop: '24px' }}>
            {/* Mobile: vertical stack */}
            <div
              className="podium-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '12px',
                marginBottom: '32px',
              }}
            >
              {podium.map((project, i) => (
                <PodiumCard
                  key={project.id}
                  project={project}
                  position={i}
                  copiedId={copiedId}
                  setCopiedId={setCopiedId}
                  highlighted={highlightedProject === project.full_name}
                  sparklineData={sparklines[project.id]}
                  onProjectClick={setDetailProject}
                />
              ))}
            </div>
          </div>

          {/* ─── Chart Rows ─────────────────────────────────────── */}
          {rows.length > 0 && (
            <div style={{
              borderTop: '1px solid var(--border)',
            }}>
              {rows.map((project, i) => (
                <ChartRow
                  key={project.id}
                  project={project}
                  index={i}
                  copiedId={copiedId}
                  setCopiedId={setCopiedId}
                  highlighted={highlightedProject === project.full_name}
                  sparklineData={sparklines[project.id]}
                  onProjectClick={setDetailProject}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── How Rankings Work ──────────────────────────────────── */}
      <HowRankingsWork />

      {/* ─── Hall of Fame ────────────────────────────────────────── */}
      <HallOfFame />

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer style={{
        padding: '48px 0 32px',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        marginTop: '48px',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-dim)',
          lineHeight: 1.8,
        }}>
          <div>Powered by GitHub API + Supabase</div>
          <div style={{ marginTop: '4px' }}>
            Built by jerrysoer and Claude
            {' · '}
            <a
              href="https://github.com/jerrysoer/ship-ranked"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-blue)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              GitHub
            </a>
            {' · '}
            <a
              href={`${API_BASE}/api/rss`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-blue)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              RSS
            </a>
          </div>
          <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
            Updated {lastUpdated}
          </div>
        </div>
      </footer>

      {/* ─── Project Detail Modal ────────────────────────────────── */}
      {detailProject && (
        <ProjectModal
          project={detailProject}
          sparklineData={sparklines[detailProject.id]}
          copiedId={copiedId}
          setCopiedId={setCopiedId}
          onClose={() => setDetailProject(null)}
        />
      )}
    </div>
  )
}
