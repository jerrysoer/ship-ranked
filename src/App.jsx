import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './lib/supabase'

// ─── Analytics ───────────────────────────────────────────────────────────────

const track = (event, data) => {
  try { if (window.umami) window.umami.track(event, data) } catch (e) { /* noop */ }
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k'
  return n.toString()
}

function getCategoryLabel(value) {
  return CATEGORIES.find(c => c.value === value)?.label || value
}

function getInitialCategory() {
  const params = new URLSearchParams(window.location.search)
  return params.get('category') || 'all'
}

// ─── Copy Share ──────────────────────────────────────────────────────────────

async function copyShare(project, setCopiedId) {
  const shareUrl = `https://ship-ranked.vercel.app/p/${project.full_name.replace('/', '--')}`
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

// ─── Podium Card ─────────────────────────────────────────────────────────────

function PodiumCard({ project, position, copiedId, setCopiedId }) {
  const starsAnimated = useCountUp(project.stars_gained_7d, 800, 500 + position * 100)
  const isFirst = position === 0

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('podium-click', { name: project.name, rank: project.rank })}
      style={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        background: isFirst
          ? 'radial-gradient(ellipse at top, rgba(255,184,48,0.08) 0%, var(--surface) 70%)'
          : 'var(--surface)',
        border: `1px solid ${isFirst ? 'rgba(255,184,48,0.3)' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '24px 20px',
        transition: 'transform 0.2s, border-color 0.2s',
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
      {/* Rank number */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: isFirst ? '52px' : '40px',
        lineHeight: 1,
        color: isFirst ? 'var(--gold)' : 'var(--text-dim)',
        textShadow: isFirst ? '0 0 40px rgba(255,184,48,0.4)' : 'none',
        marginBottom: '12px',
      }}>
        {project.rank}
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
            {project.full_name}
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
        {project.description}
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
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--up)',
          }}>
            +{starsAnimated}
          </span>
          <DeltaBadge project={project} animate delay={800 + position * 100} />
        </div>
        <ShareButton project={project} copiedId={copiedId} setCopiedId={setCopiedId} size="small" />
      </div>
    </a>
  )
}

// ─── Chart Row ───────────────────────────────────────────────────────────────

function ChartRow({ project, index, copiedId, setCopiedId }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <a
      ref={ref}
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('row-click', { name: project.name, rank: project.rank })}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        minHeight: '64px',
        borderBottom: '1px solid var(--border)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s',
        cursor: 'pointer',
        touchAction: 'manipulation',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-8px)',
        transitionProperty: 'opacity, transform, background, border-color',
        transitionDuration: '0.4s',
        transitionDelay: `${Math.min(index * 40, 320)}ms`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(2px)'
        e.currentTarget.style.background = 'rgba(77,156,255,0.03)'
        e.currentTarget.style.borderLeftColor = 'var(--accent-blue)'
        e.currentTarget.style.borderLeftWidth = '2px'
        e.currentTarget.style.borderLeftStyle = 'solid'
      }}
      onMouseLeave={(e) => {
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
        <div style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: '14px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {project.name}
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
          {project.description}
        </div>
      </div>

      {/* Delta */}
      <div style={{ flexShrink: 0 }}>
        <DeltaBadge project={project} />
      </div>

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
    </a>
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
            The chart ranks momentum, not legacy.
          </p>

          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: 1.8,
            marginBottom: '24px',
          }}>
            <p style={{ margin: '0 0 12px' }}>
              Every project here earned its spot the same way — by getting people excited
              enough to star it this week.
            </p>
            <p style={{ margin: '0 0 12px' }}>
              We count one thing: stars gained in the last 7 days. A repo with 12 total stars
              but +10 this week ranks above a repo with 500 total stars but only +2 this week.
              That's it. No algorithm. No editorial picks. No pay-to-play.
            </p>
            <p style={{ margin: 0 }}>
              This means the chart resets every week. Last week's #1 has to earn it again.
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
                title: 'Simple is honest.',
                body: 'One metric, no weights, no editorial layer. You can verify every ranking by checking the repo\'s star history yourself.',
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
              A project tagged NEW appeared on the chart for the first time this week.
              It might be a brand-new repo or an older one that just hit its stride.
              Either way, it wasn't ranked last week and it is now.
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

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(getInitialCategory)
  const [copiedId, setCopiedId] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      if (!supabase) {
        // Filter mock data by category client-side
        const filtered = category === 'all'
          ? MOCK_DATA
          : MOCK_DATA.filter(p => p.category === category)
        setProjects(filtered)
        setLoading(false)
        return
      }
      let query = supabase
        .from('ranked_projects')
        .select('*')
        .order('rank', { ascending: true })
        .limit(25)
      if (category !== 'all') query = query.eq('category', category)
      const { data } = await query
      setProjects(data || [])
      setLoading(false)
    }
    fetchData()
  }, [category])

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
    track('category-change', { category: value })
  }, [])

  const podium = projects.slice(0, 3)
  const rows = projects.slice(3)
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

      {/* ─── Category Filter ────────────────────────────────────── */}
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
        </div>
      </div>

      {/* ─── Content ────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ paddingTop: '24px' }}>
          <LoadingSkeleton />
        </div>
      ) : projects.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          color: 'var(--text-muted)',
        }}>
          No projects found in this category yet.
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
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── How Rankings Work ──────────────────────────────────── */}
      <HowRankingsWork />

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
          <div style={{ marginTop: '4px' }}>Part of the Ship ecosystem</div>
          <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>
            Updated {lastUpdated}
          </div>
        </div>
      </footer>
    </div>
  )
}
