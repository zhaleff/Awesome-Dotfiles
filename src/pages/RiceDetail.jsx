import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft, faEye, faCopy, faCheck, faThumbsUp, faThumbsDown,
  faShareAlt, faDownload, faPaperPlane, faExpand, faXmark
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import clsx from 'clsx'
import toast from 'react-hot-toast'

/* ─────────────────────────────────────────────────────────────
   COPY BUTTON
───────────────────────────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handle} className="rd-copy-btn">
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────
   LIGHTBOX
───────────────────────────────────────────────────────────── */
function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="rd-lightbox"
      >
        <motion.img
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          src={src} alt={alt}
          className="rd-lightbox-img"
          onClick={(e) => e.stopPropagation()}
        />
        <button onClick={onClose} className="rd-lightbox-close">
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─────────────────────────────────────────────────────────────
   COMMENTS
───────────────────────────────────────────────────────────── */
function Comments({ riceId }) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [author, setAuthor] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchComments() }, [riceId])

  async function fetchComments() {
    const { data } = await supabase
      .from('comments').select('*')
      .eq('rice_id', riceId).order('created_at', { ascending: false })
    setComments(data ?? [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('comments').insert({
        rice_id: riceId,
        author: author.trim() || 'anonymous',
        body: body.trim(),
      })
      if (error) throw error
      setBody(''); setAuthor('')
      toast.success('Comment posted!')
      fetchComments()
    } catch { toast.error('Failed to post comment.') }
    finally { setSubmitting(false) }
  }

  return (
    <section className="rd-comments">
      <div className="rd-section-label">
        <span>Comments</span>
        {!loading && comments.length > 0 && (
          <span className="rd-badge">{comments.length}</span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="rd-compose">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Comparte tu opinión sobre este setup…"
          rows={3}
          className="rd-compose-textarea"
        />
        <div className="rd-compose-footer">
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Tu nombre (opcional)"
            className="rd-compose-name"
          />
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className={clsx('rd-compose-submit', (submitting || !body.trim()) && 'rd-compose-submit--disabled')}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            Post
          </button>
        </div>
      </form>

      {loading ? (
        <div className="rd-spinner-wrap"><span className="rd-spinner" /></div>
      ) : comments.length === 0 ? (
        <p className="rd-empty">Sé el primero en comentar.</p>
      ) : (
        <div className="rd-comment-list">
          <AnimatePresence>
            {comments.map((c, i) => (
              <motion.article
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rd-comment"
              >
                <div className="rd-avatar">{c.author?.[0]?.toUpperCase() ?? '?'}</div>
                <div className="rd-comment-body">
                  <header className="rd-comment-meta">
                    <span className="rd-comment-author">{c.author || 'anonymous'}</span>
                    <time className="rd-comment-time">
                      {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                    </time>
                  </header>
                  <p className="rd-comment-text">{c.body}</p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}

/* ─────────────────────────────────────────────────────────────
   CANVAS HELPER
───────────────────────────────────────────────────────────── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function RiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rice, setRice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [vote, setVote] = useState(null)
  const [voting, setVoting] = useState(true)
  const [bannerLoading, setBannerLoading] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  async function getIpHash() {
    try {
      const res = await fetch('https://ifconfig.me/ip')
      const ip = await res.text()
      if (!ip) return 'unknown'
      const buf = new TextEncoder().encode(ip.trim())
      const hash = await crypto.subtle.digest('SHA-256', buf)
      return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
    } catch { return 'unknown' }
  }

  useEffect(() => {
    async function fetchRice() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('rices').select('*').eq('id', id).single()
        if (error || !data) { setNotFound(true); setLoading(false); return }
        setRice(data)
        if (!localStorage.getItem(`viewed_${id}`)) {
          await supabase.rpc('increment_views', { row_id: id })
          localStorage.setItem(`viewed_${id}`, '1')
        }
        const localVote = localStorage.getItem(`vote_${id}`)
        if (localVote) {
          setVote(localVote)
        } else {
          const ipHash = await getIpHash()
          const { data: existing } = await supabase.from('votes').select('vote_type').eq('rice_id', id).eq('vote_ip', ipHash).maybeSingle()
          if (existing) { setVote(existing.vote_type); localStorage.setItem(`vote_${id}`, existing.vote_type) }
        }
      } catch { setNotFound(true) }
      setLoading(false); setVoting(false)
    }
    fetchRice()
  }, [id])

  async function handleVote(type) {
    if (voting) return
    setVoting(true)
    try {
      const localKey = `vote_${id}`
      const localVote = localStorage.getItem(localKey)
      const ipHash = await getIpHash()
      let nl = rice.likes ?? 0, nd = rice.dislikes ?? 0
      if (localVote === type) {
        if (type === 'up') nl--; else nd--
        localStorage.removeItem(localKey); setVote(null)
        await supabase.from('votes').delete().eq('rice_id', id).eq('vote_ip', ipHash)
        toast.success('Vote removed')
      } else if (localVote) {
        if (localVote === 'up') nl--; else nd--
        if (type === 'up') nl++; else nd++
        localStorage.setItem(localKey, type); setVote(type)
        await supabase.from('votes').update({ vote_type: type }).eq('rice_id', id).eq('vote_ip', ipHash)
        toast.success('Vote changed!')
      } else {
        if (type === 'up') nl++; else nd++
        localStorage.setItem(localKey, type); setVote(type)
        await supabase.from('votes').insert({ rice_id: id, vote_ip: ipHash, vote_type: type })
        toast.success('Voted!')
      }
      await supabase.from('rices').update({ likes: Math.max(0, nl), dislikes: Math.max(0, nd) }).eq('id', id)
      setRice(p => p ? { ...p, likes: Math.max(0, nl), dislikes: Math.max(0, nd) } : null)
    } catch { toast.error('Failed to vote') }
    finally { setVoting(false) }
  }

  async function downloadBanner() {
    if (bannerLoading) return
    setBannerLoading(true)
    const canvas = document.createElement('canvas')
    canvas.width = 1200; canvas.height = 630
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'; img.src = rice.image_url
    img.onerror = () => { toast.error('Could not load image.'); setBannerLoading(false) }
    img.onload = () => {
      const ir = img.width / img.height, cr = 1200 / 630
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (ir > cr) { sw = img.height * cr; sx = (img.width - sw) / 2 }
      else { sh = img.width / cr; sy = (img.height - sh) / 2 }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 1200, 630)
      const vg = ctx.createLinearGradient(0, 0, 0, 630)
      vg.addColorStop(0, 'rgba(0,0,0,0.15)'); vg.addColorStop(0.45, 'rgba(0,0,0,0.3)'); vg.addColorStop(1, 'rgba(0,0,0,0.88)')
      ctx.fillStyle = vg; ctx.fillRect(0, 0, 1200, 630)
      ctx.fillStyle = 'rgba(6,6,6,0.82)'; ctx.fillRect(0, 470, 1200, 160)
      const ag = ctx.createLinearGradient(0, 470, 1200, 470)
      ag.addColorStop(0, '#e8ff47'); ag.addColorStop(0.5, '#b8ff00'); ag.addColorStop(1, 'rgba(232,255,71,0)')
      ctx.fillStyle = ag; ctx.fillRect(0, 470, 1200, 2)
      const palette = Array.isArray(rice.palette) ? rice.palette : []
      if (palette.length > 0) {
        let dotX = 48
        palette.slice(0, 8).forEach((color) => {
          ctx.beginPath(); ctx.arc(dotX, 502, 8, 0, Math.PI * 2)
          ctx.fillStyle = color; ctx.fill(); dotX += 24
        })
      }
      if (rice.wm) {
        ctx.font = '500 13px ui-monospace, monospace'
        const tw = ctx.measureText(rice.wm).width
        const bw = tw + 24, bh = 26, bx = 48, by = 28
        roundRect(ctx, bx, by, bw, bh, 5)
        ctx.fillStyle = 'rgba(232,255,71,0.1)'; ctx.fill()
        ctx.strokeStyle = 'rgba(232,255,71,0.4)'; ctx.lineWidth = 1; ctx.stroke()
        ctx.fillStyle = '#e8ff47'; ctx.textAlign = 'left'
        ctx.fillText(rice.wm, bx + 12, by + 17)
      }
      if (rice.distro) {
        ctx.font = '500 13px ui-monospace, monospace'
        const wmW = rice.wm ? ctx.measureText(rice.wm).width + 24 + 8 : 0
        const tw = ctx.measureText(rice.distro).width
        const bw = tw + 24, bh = 26, bx = 48 + wmW, by = 28
        roundRect(ctx, bx, by, bw, bh, 5)
        ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.fillText(rice.distro, bx + 12, by + 17)
      }
      ctx.textAlign = 'left'; ctx.font = '700 48px ui-sans-serif, system-ui'; ctx.fillStyle = '#ffffff'
      const maxW = 900; let title = rice.title ?? ''
      while (ctx.measureText(title).width > maxW && title.length > 0) title = title.slice(0, -1)
      if (title !== rice.title) title += '…'
      const titleY = palette.length > 0 ? 562 : 548
      ctx.fillText(title, 48, titleY)
      ctx.font = '400 15px ui-sans-serif, system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.35)'
      const meta = [rice.author ? `by ${rice.author}` : 'anonymous', `${rice.views ?? 0} views`, `${rice.likes ?? 0} likes`].join('  ·  ')
      ctx.fillText(meta, 48, titleY + 28)
      ctx.textAlign = 'right'; ctx.font = '500 13px ui-monospace, monospace'; ctx.fillStyle = 'rgba(232,255,71,0.5)'
      ctx.fillText('awesome-dotfiles.vercel.app', 1152, titleY + 28)
      const slug = (rice.title || 'banner').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const link = document.createElement('a')
      link.download = `${slug}-banner.png`; link.href = canvas.toDataURL('image/png'); link.click()
      setBannerLoading(false); toast.success('Banner downloaded!')
    }
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: rice.title, text: `Check out ${rice.title} by ${rice.author || 'anonymous'}`, url }) }
      catch (err) { if (err.name !== 'AbortError') { await navigator.clipboard.writeText(url); toast.success('Link copied') } }
    } else { await navigator.clipboard.writeText(url); toast.success('Link copied') }
  }

  if (loading) return (
    <div className="rd-loading">
      <span className="rd-spinner rd-spinner--accent" />
    </div>
  )

  if (notFound) return (
    <div className="rd-404">
      <p className="rd-404-code">404</p>
      <p className="rd-404-msg">Este setup no existe o fue eliminado.</p>
      <button onClick={() => navigate('/')} className="rd-404-back">← Volver al gallery</button>
    </div>
  )

  const createdDate = rice.created_at ? new Date(rice.created_at) : null
  const likes = rice.likes ?? 0, dislikes = rice.dislikes ?? 0
  const total = likes + dislikes
  const likePercent = total > 0 ? Math.round((likes / total) * 100) : null

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&display=swap');
        @keyframes rd-spin { to { transform: rotate(360deg) } }

        .rd-page {
          --accent: #e8ff47;
          --accent-dim: rgba(232,255,71,.07);
          --accent-border: rgba(232,255,71,.18);
          --surface: rgba(255,255,255,.03);
          --surface-raised: rgba(255,255,255,.05);
          --surface-hover: rgba(255,255,255,.06);
          --border: rgba(255,255,255,.07);
          --border-strong: rgba(255,255,255,.13);
          --text: #f0ede8;
          --text-mid: rgba(240,237,232,.5);
          --text-faint: rgba(240,237,232,.22);
          --text-ghost: rgba(240,237,232,.09);
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          color: var(--text);
          max-width: 1120px;
          margin: 0 auto;
          padding: 88px 40px 120px;
          min-height: 100vh;
        }

        .rd-back {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 600; letter-spacing: .1em;
          text-transform: uppercase; color: var(--text-faint);
          background: none; border: none; cursor: pointer;
          font-family: inherit; transition: color .15s;
          margin-bottom: 52px; padding: 0;
        }
        .rd-back:hover { color: var(--text); }
        .rd-back svg { width: 10px; }

        /* ── Hero full-width ── */
        .rd-hero-wrap { margin-bottom: 56px; }
        .rd-hero {
          position: relative; border-radius: 20px;
          overflow: hidden; cursor: zoom-in;
          border: 1px solid var(--border);
          box-shadow: 0 40px 100px rgba(0,0,0,.6), 0 8px 24px rgba(0,0,0,.35);
        }
        .rd-hero img {
          width: 100%; max-height: 580px; object-fit: cover;
          display: block; transition: transform .7s cubic-bezier(.16,1,.3,1);
        }
        .rd-hero:hover img { transform: scale(1.012); }
        .rd-hero-overlay {
          position: absolute; inset: 0; background: transparent;
          display: flex; align-items: center; justify-content: center;
          transition: background .25s;
        }
        .rd-hero:hover .rd-hero-overlay { background: rgba(0,0,0,.16); }
        .rd-hero-expand {
          width: 52px; height: 52px; border-radius: 50%;
          background: rgba(0,0,0,.55); backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,.18);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity .2s; color: #fff;
        }
        .rd-hero:hover .rd-hero-expand { opacity: 1; }

        /* ── Layout: main + sticky sidebar ── */
        .rd-layout {
          display: grid;
          grid-template-columns: 1fr 264px;
          gap: 0 48px;
          align-items: start;
        }
        .rd-main { grid-column: 1; min-width: 0; }
        .rd-sidebar {
          grid-column: 2; grid-row: 1 / 99;
          position: sticky; top: 32px;
          display: flex; flex-direction: column; gap: 12px;
        }

        /* ── Title block ── */
        .rd-titleblock {
          padding: 0 0 36px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 36px;
        }
        .rd-tags {
          display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 22px;
        }
        .rd-tag {
          font-size: 10px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; padding: 4px 11px; border-radius: 99px;
          border: 1px solid var(--border-strong); color: var(--text-faint);
        }
        .rd-tag--accent {
          border-color: var(--accent-border);
          background: var(--accent-dim); color: var(--accent);
        }
        h1.rd-title {
          font-size: clamp(30px, 4vw, 52px);
          font-weight: 800; letter-spacing: -0.03em;
          line-height: 1.08; margin: 0 0 22px; color: var(--text);
        }
        .rd-meta {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .rd-author-chip { display: flex; align-items: center; gap: 8px; }
        .rd-avatar-sm {
          width: 28px; height: 28px; border-radius: 8px;
          background: var(--accent-dim); border: 1px solid var(--accent-border);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; color: var(--accent); flex-shrink: 0;
        }
        .rd-meta-name { font-size: 13px; color: var(--text-mid); font-weight: 500; }
        .rd-meta-dot { color: var(--text-ghost); }
        .rd-meta-stat {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: var(--text-faint);
          font-family: ui-monospace, monospace;
        }
        .rd-meta-stat svg { width: 10px; }

        .rd-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .rd-action-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px;
          background: var(--surface); border: 1px solid var(--border);
          font-size: 12px; font-weight: 500; font-family: inherit;
          color: var(--text-mid); cursor: pointer; transition: all .15s;
          letter-spacing: .02em;
        }
        .rd-action-btn:hover {
          background: var(--surface-hover); border-color: var(--border-strong); color: var(--text);
        }
        .rd-action-btn:disabled { opacity: .4; cursor: not-allowed; }
        .rd-action-btn svg { width: 11px; }

        /* ── Vote ── */
        .rd-vote-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 48px; flex-wrap: wrap;
        }
        .rd-vote-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px;
          font-size: 13px; font-weight: 600; font-family: inherit;
          background: var(--surface); border: 1px solid var(--border);
          color: var(--text-mid); cursor: pointer; transition: all .2s;
        }
        .rd-vote-btn:hover { border-color: var(--border-strong); color: var(--text); }
        .rd-vote-btn:disabled { cursor: not-allowed; }
        .rd-vote-btn--up-active { background: var(--accent); border-color: var(--accent); color: #000 !important; }
        .rd-vote-btn--down-active { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.28); color: rgb(252,165,165) !important; }
        .rd-vote-num { font-family: ui-monospace, monospace; font-size: 13px; }
        .rd-like-bar-wrap { display: flex; align-items: center; gap: 10px; }
        .rd-like-bar-track { width: 80px; height: 2px; border-radius: 99px; background: rgba(255,255,255,.06); overflow: hidden; }
        .rd-like-bar-fill { height: 100%; background: var(--accent); border-radius: 99px; }
        .rd-like-pct { font-size: 10px; color: var(--text-faint); font-family: ui-monospace,monospace; }

        /* ── Section label ── */
        .rd-section-label {
          display: flex; align-items: center; gap: 8px; margin-bottom: 18px;
          font-size: 10px; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; color: var(--text-faint);
          font-family: ui-monospace, monospace;
        }
        .rd-badge {
          padding: 1px 7px; border-radius: 99px;
          background: rgba(255,255,255,.04); border: 1px solid var(--border);
          font-size: 10px; color: var(--text-faint);
        }

        /* ── About ── */
        .rd-about { margin-bottom: 48px; }
        .rd-about p { font-size: 15px; color: var(--text-mid); line-height: 1.8; margin: 0; }

        /* ── Notes ── */
        .rd-notes { margin-bottom: 48px; }
        .rd-notes-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 14px;
        }
        .rd-notes-header .rd-section-label { margin-bottom: 0; }
        .rd-notes-block {
          background: rgba(0,0,0,.4); border: 1px solid var(--border);
          border-radius: 14px; padding: 24px; overflow-x: auto;
        }
        .rd-notes-block pre {
          margin: 0; font-family: ui-monospace, monospace;
          font-size: 12px; color: rgba(255,255,255,.35);
          line-height: 1.9; white-space: pre-wrap; word-break: break-words;
        }

        .rd-copy-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 5px 11px; border-radius: 7px;
          background: var(--surface); border: 1px solid var(--border);
          font-size: 11px; font-family: ui-monospace, monospace;
          letter-spacing: .04em; color: var(--text-faint);
          cursor: pointer; transition: all .15s;
        }
        .rd-copy-btn:hover { color: var(--text-mid); border-color: var(--border-strong); }
        .rd-copy-btn svg { width: 10px; }

        .rd-divider { height: 1px; background: var(--border); margin: 0 0 48px; }

        /* ── Comments ── */
        .rd-compose {
          border-radius: 14px; border: 1px solid var(--border);
          background: var(--surface); overflow: hidden;
          margin-bottom: 32px; transition: border-color .15s;
        }
        .rd-compose:focus-within { border-color: var(--border-strong); }
        .rd-compose-textarea {
          width: 100%; padding: 18px 20px 10px;
          background: transparent; border: none; outline: none; resize: none;
          font-family: inherit; font-size: 14px; color: var(--text);
          line-height: 1.65; box-sizing: border-box;
        }
        .rd-compose-footer {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px 14px; border-top: 1px solid var(--border);
        }
        .rd-compose-name {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: inherit; font-size: 12px; color: var(--text-faint);
        }
        .rd-compose-submit {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 9px;
          background: var(--accent); border: none; color: #000;
          font-size: 12px; font-weight: 700; font-family: inherit;
          cursor: pointer; letter-spacing: .02em; transition: opacity .15s;
        }
        .rd-compose-submit--disabled {
          opacity: .25; cursor: not-allowed;
          background: rgba(255,255,255,.07); color: var(--text-faint);
        }
        .rd-compose-submit svg { width: 10px; }

        .rd-comment-list { display: flex; flex-direction: column; }
        .rd-comment {
          display: flex; gap: 14px; padding: 20px 0;
          border-bottom: 1px solid var(--border);
        }
        .rd-comment:last-child { border-bottom: none; }
        .rd-avatar {
          width: 34px; height: 34px; border-radius: 9px;
          background: var(--accent-dim); border: 1px solid var(--accent-border);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 800; color: var(--accent); flex-shrink: 0;
        }
        .rd-comment-body { flex: 1; min-width: 0; }
        .rd-comment-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 6px; }
        .rd-comment-author { font-size: 13px; font-weight: 600; color: rgba(240,237,232,.65); }
        .rd-comment-time { font-size: 11px; color: var(--text-faint); font-family: ui-monospace,monospace; }
        .rd-comment-text { font-size: 14px; color: var(--text-mid); line-height: 1.7; word-break: break-word; margin: 0; }

        .rd-empty { font-size: 12px; color: var(--text-ghost); text-align: center; padding: 32px 0; font-family: ui-monospace,monospace; }
        .rd-spinner-wrap { display: flex; justify-content: center; padding: 32px 0; }
        .rd-spinner {
          display: inline-block; width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid var(--border); border-top-color: var(--text-mid);
          animation: rd-spin .65s linear infinite;
        }
        .rd-spinner--accent { border-top-color: var(--accent); }

        /* ── Sidebar ── */
        .rd-card {
          border-radius: 16px; border: 1px solid var(--border);
          background: var(--surface-raised); overflow: hidden;
        }
        .rd-card-header {
          padding: 13px 18px 11px; border-bottom: 1px solid var(--border);
          font-size: 9px; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; color: var(--text-faint);
          font-family: ui-monospace, monospace;
        }
        .rd-spec-row {
          padding: 12px 18px; border-bottom: 1px solid var(--border);
          display: flex; flex-direction: column; gap: 3px;
        }
        .rd-spec-row:last-child { border-bottom: none; }
        .rd-spec-label {
          font-size: 9px; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: var(--text-ghost);
          font-family: ui-monospace, monospace;
        }
        .rd-spec-value { font-size: 13px; color: rgba(240,237,232,.65); font-weight: 500; }

        .rd-palette-card { padding: 16px 18px; }
        .rd-palette-label {
          font-size: 9px; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; color: var(--text-faint);
          font-family: ui-monospace, monospace; margin-bottom: 14px;
        }
        .rd-palette-swatches { display: flex; flex-wrap: wrap; gap: 6px; }
        .rd-swatch {
          width: 28px; height: 28px; border-radius: 7px;
          border: 1px solid var(--border); cursor: pointer;
          transition: transform .12s, border-color .12s;
        }
        .rd-swatch:hover { transform: scale(1.2); border-color: var(--border-strong); }

        .rd-github-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 14px 18px; border-radius: 14px;
          background: var(--accent); color: #000;
          font-size: 13px; font-weight: 700; font-family: inherit;
          text-decoration: none; letter-spacing: .02em;
          transition: opacity .15s, transform .15s;
        }
        .rd-github-btn:hover { opacity: .85; transform: translateY(-1px); }
        .rd-github-btn svg { width: 14px; }

        /* ── Lightbox ── */
        .rd-lightbox {
          position: fixed; inset: 0; z-index: 100;
          display: flex; align-items: center; justify-content: center;
          background: rgba(5,5,4,.96); backdrop-filter: blur(10px);
          padding: 24px; cursor: zoom-out;
        }
        .rd-lightbox-img {
          max-width: 100%; max-height: 100%;
          object-fit: contain; border-radius: 16px;
          box-shadow: 0 40px 80px rgba(0,0,0,.7);
        }
        .rd-lightbox-close {
          position: absolute; top: 20px; right: 20px;
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,.09); border: 1px solid rgba(255,255,255,.13);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,.55); cursor: pointer; transition: all .15s;
          font-size: 14px;
        }
        .rd-lightbox-close:hover { background: rgba(255,255,255,.14); color: #fff; }

        /* ── States ── */
        .rd-loading {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
        }
        .rd-404 {
          min-height: 100vh; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 14px; text-align: center; padding: 0 24px;
        }
        .rd-404-code { font-size: 80px; font-weight: 800; color: rgba(255,255,255,.04); margin: 0; letter-spacing: -.04em; }
        .rd-404-msg { font-size: 15px; color: var(--text-mid); margin: 0; }
        .rd-404-back { font-size: 13px; color: var(--accent); background: none; border: none; cursor: pointer; font-family: inherit; }

        @media (max-width: 860px) {
          .rd-page { padding: 60px 20px 80px; }
          .rd-layout { grid-template-columns: 1fr; }
          .rd-sidebar { position: static; grid-row: auto; }
        }
      `}</style>

      {lightbox && <Lightbox src={rice.image_url} alt={rice.title} onClose={() => setLightbox(false)} />}

      <motion.div
        className="rd-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: .4 }}
      >
        {/* Back */}
        <button onClick={() => navigate(-1)} className="rd-back">
          <FontAwesomeIcon icon={faArrowLeft} />
          volver
        </button>

        {/* Hero — full width */}
        {rice.image_url && (
          <motion.div
            className="rd-hero-wrap"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, ease: [.16, 1, .3, 1] }}
          >
            <div className="rd-hero" onClick={() => setLightbox(true)}>
              <img src={rice.image_url} alt={rice.title} />
              <div className="rd-hero-overlay">
                <div className="rd-hero-expand">
                  <FontAwesomeIcon icon={faExpand} style={{ width: 16 }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Two-column grid */}
        <div className="rd-layout">

          {/* ── Main ── */}
          <main className="rd-main">
            <motion.div
              className="rd-titleblock"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .1, duration: .4 }}
            >
              {/* Pills */}
              <div className="rd-tags">
                {rice.wm && <span className="rd-tag rd-tag--accent">{rice.wm}</span>}
                {rice.distro && <span className="rd-tag">{rice.distro}</span>}
                {rice.license && <span className="rd-tag">{rice.license}</span>}
              </div>

              <h1 className="rd-title">{rice.title}</h1>

              <div className="rd-meta">
                <div className="rd-author-chip">
                  <div className="rd-avatar-sm">{rice.author?.[0]?.toUpperCase() ?? '?'}</div>
                  <span className="rd-meta-name">{rice.author ?? 'anonymous'}</span>
                </div>
                {createdDate && (
                  <>
                    <span className="rd-meta-dot">·</span>
                    <span className="rd-meta-stat">{formatDistanceToNow(createdDate, { addSuffix: true })}</span>
                  </>
                )}
                <span className="rd-meta-dot">·</span>
                <span className="rd-meta-stat">
                  <FontAwesomeIcon icon={faEye} />
                  {rice.views ?? 0}
                </span>
              </div>

              <div className="rd-actions">
                <button onClick={downloadBanner} disabled={bannerLoading} className="rd-action-btn">
                  <FontAwesomeIcon icon={faDownload} />
                  {bannerLoading ? 'Generando…' : 'Banner'}
                </button>
                <button onClick={handleShare} className="rd-action-btn">
                  <FontAwesomeIcon icon={faShareAlt} />
                  Compartir
                </button>
              </div>
            </motion.div>

            {/* Vote */}
            <motion.div
              className="rd-vote-row"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .16 }}
            >
              <button
                onClick={() => handleVote('up')} disabled={voting}
                className={clsx('rd-vote-btn', vote === 'up' && 'rd-vote-btn--up-active')}
              >
                <FontAwesomeIcon icon={faThumbsUp} style={{ width: 13 }} />
                <span className="rd-vote-num">{likes}</span>
              </button>
              <button
                onClick={() => handleVote('down')} disabled={voting}
                className={clsx('rd-vote-btn', vote === 'down' && 'rd-vote-btn--down-active')}
              >
                <FontAwesomeIcon icon={faThumbsDown} style={{ width: 13 }} />
                <span className="rd-vote-num">{dislikes}</span>
              </button>
              {likePercent !== null && (
                <div className="rd-like-bar-wrap">
                  <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,.07)' }} />
                  <div className="rd-like-bar-track">
                    <motion.div
                      className="rd-like-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${likePercent}%` }}
                      transition={{ duration: .8, ease: 'easeOut', delay: .3 }}
                    />
                  </div>
                  <span className="rd-like-pct">{likePercent}%</span>
                </div>
              )}
            </motion.div>

            {/* Description */}
            {rice.description && (
              <motion.div className="rd-about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}>
                <div className="rd-section-label">Descripción</div>
                <p>{rice.description}</p>
              </motion.div>
            )}

            {/* Notes */}
            {rice.notes && (
              <motion.div className="rd-notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .24 }}>
                <div className="rd-notes-header">
                  <div className="rd-section-label">Notes</div>
                  <CopyButton text={rice.notes} />
                </div>
                <div className="rd-notes-block">
                  <pre>{rice.notes}</pre>
                </div>
              </motion.div>
            )}

            <div className="rd-divider" />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .28 }}>
              <Comments riceId={id} />
            </motion.div>
          </main>

          {/* ── Sidebar ── */}
          <motion.aside
            className="rd-sidebar"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .22, duration: .4 }}
          >
            {/* Specs */}
            <div className="rd-card">
              <div className="rd-card-header">Especificaciones</div>
              {[
                { label: 'WM / DE', value: rice.wm },
                { label: 'Distro', value: rice.distro },
                { label: 'Licencia', value: rice.license },
                { label: 'Publicado', value: createdDate ? format(createdDate, 'MMM d, yyyy') : null },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label} className="rd-spec-row">
                  <span className="rd-spec-label">{label}</span>
                  <span className="rd-spec-value">{value}</span>
                </div>
              ))}
            </div>

            {/* Palette */}
            {rice.palette?.length > 0 && (
              <div className="rd-card rd-palette-card">
                <div className="rd-palette-label">Paleta</div>
                <div className="rd-palette-swatches">
                  {rice.palette.map((color, i) => (
                    <button
                      key={i} title={color} className="rd-swatch"
                      style={{ backgroundColor: color }}
                      onClick={() => { navigator.clipboard.writeText(color); toast.success(color) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* GitHub */}
            {rice.github_url && (
              <a href={rice.github_url} target="_blank" rel="noreferrer" className="rd-github-btn">
                <FontAwesomeIcon icon={faGithub} />
                Ver dotfiles
              </a>
            )}
          </motion.aside>
        </div>
      </motion.div>
    </>
  )
}
