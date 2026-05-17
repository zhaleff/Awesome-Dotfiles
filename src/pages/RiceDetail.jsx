import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faEye,
  faCopy,
  faCheck,
  faThumbsUp,
  faThumbsDown,
  faShareAlt,
  faDownload,
  faExpand,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow, format } from 'date-fns'
import clsx from 'clsx'
import toast from 'react-hot-toast'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-surface text-muted hover:text-text transition-colors text-xs"
    >
      <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
      >
        <motion.img
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.3 }}
          src={src}
          alt={alt}
          onClick={(e) => e.stopPropagation()}
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
        />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full border border-border bg-surface text-muted hover:text-text transition-colors"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

export default function RiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [rice, setRice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [vote, setVote] = useState(null)
  const [voting, setVoting] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  async function getIpHash() {
    try {
      const res = await fetch('https://ifconfig.me/ip')
      const ip = await res.text()

      const buf = new TextEncoder().encode(ip.trim())

      const hash = await crypto.subtle.digest('SHA-256', buf)

      return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    } catch {
      return 'unknown'
    }
  }

  useEffect(() => {
    async function fetchRice() {
      setLoading(true)

      try {
        const { data, error } = await supabase
          .from('rices')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) {
          setNotFound(true)
          setLoading(false)
          return
        }

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

          const { data: existing } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('rice_id', id)
            .eq('vote_ip', ipHash)
            .maybeSingle()

          if (existing) {
            setVote(existing.vote_type)
            localStorage.setItem(`vote_${id}`, existing.vote_type)
          }
        }
      } catch {
        setNotFound(true)
      }

      setLoading(false)
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

      let nl = rice.likes ?? 0
      let nd = rice.dislikes ?? 0

      if (localVote === type) {
        if (type === 'up') nl--
        else nd--

        localStorage.removeItem(localKey)
        setVote(null)

        await supabase
          .from('votes')
          .delete()
          .eq('rice_id', id)
          .eq('vote_ip', ipHash)
      } else if (localVote) {
        if (localVote === 'up') nl--
        else nd--

        if (type === 'up') nl++
        else nd++

        localStorage.setItem(localKey, type)
        setVote(type)

        await supabase
          .from('votes')
          .update({ vote_type: type })
          .eq('rice_id', id)
          .eq('vote_ip', ipHash)
      } else {
        if (type === 'up') nl++
        else nd++

        localStorage.setItem(localKey, type)
        setVote(type)

        await supabase.from('votes').insert({
          rice_id: id,
          vote_ip: ipHash,
          vote_type: type,
        })
      }

      await supabase
        .from('rices')
        .update({
          likes: Math.max(0, nl),
          dislikes: Math.max(0, nd),
        })
        .eq('id', id)

      setRice((p) =>
        p
          ? {
            ...p,
            likes: Math.max(0, nl),
            dislikes: Math.max(0, nd),
          }
          : null
      )
    } catch {
      toast.error('Failed to vote')
    }

    setVoting(false)
  }

  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: rice.title,
          text: rice.title,
          url,
        })
      } catch { }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-border border-t-accent animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-7xl font-black text-muted/10">404</h1>

        <p className="text-muted">This setup does not exist.</p>

        <button
          onClick={() => navigate('/')}
          className="text-accent text-sm"
        >
          Back to gallery
        </button>
      </div>
    )
  }

  const createdDate = rice.created_at
    ? new Date(rice.created_at)
    : null

  const likes = rice.likes ?? 0
  const dislikes = rice.dislikes ?? 0

  const total = likes + dislikes

  const likePercent =
    total > 0 ? Math.round((likes / total) * 100) : 0

  return (
    <>
      {lightbox && (
        <Lightbox
          src={rice.image_url}
          alt={rice.title}
          onClose={() => setLightbox(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-6 md:px-10 pt-28 pb-24"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-text transition-colors mb-12"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          back
        </button>

        {rice.image_url && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-border bg-surface mb-14 cursor-zoom-in"
            onClick={() => setLightbox(true)}
          >
            <img
              src={rice.image_url}
              alt={rice.title}
              className="w-full max-h-[700px] object-cover"
            />

            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
                <FontAwesomeIcon icon={faExpand} />
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-14">
          <main>
            <div className="pb-10 border-b border-border mb-10">
              <div className="flex flex-wrap gap-2 mb-6">
                {rice.wm && (
                  <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
                    {rice.wm}
                  </span>
                )}

                {rice.distro && (
                  <span className="px-3 py-1 rounded-full bg-surface border border-border text-muted text-xs uppercase tracking-wider">
                    {rice.distro}
                  </span>
                )}
              </div>

              <h1 className="text-5xl md:text-6xl font-black tracking-[-0.05em] leading-none text-text mb-6">
                {rice.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                    {rice.author?.[0]?.toUpperCase() ?? '?'}
                  </div>

                  <span>{rice.author ?? 'anonymous'}</span>
                </div>

                {createdDate && (
                  <span>
                    {formatDistanceToNow(createdDate, {
                      addSuffix: true,
                    })}
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faEye} />
                  {rice.views ?? 0}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface text-muted hover:text-text transition-colors text-sm"
                >
                  <FontAwesomeIcon icon={faShareAlt} />
                  Share
                </button>

                <button
                  className={clsx(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm transition-colors',
                    vote === 'up'
                      ? 'bg-accent text-surface border-accent'
                      : 'bg-surface border-border text-muted hover:text-text'
                  )}
                  onClick={() => handleVote('up')}
                >
                  <FontAwesomeIcon icon={faThumbsUp} />
                  {likes}
                </button>

                <button
                  className={clsx(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm transition-colors',
                    vote === 'down'
                      ? 'bg-red-500/10 text-red-300 border-red-500/20'
                      : 'bg-surface border-border text-muted hover:text-text'
                  )}
                  onClick={() => handleVote('down')}
                >
                  <FontAwesomeIcon icon={faThumbsDown} />
                  {dislikes}
                </button>

                <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-border bg-surface">
                  <div className="w-24 h-1 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${likePercent}%` }}
                    />
                  </div>

                  <span className="text-xs text-muted">
                    {likePercent}%
                  </span>
                </div>
              </div>
            </div>

            {rice.description && (
              <section className="mb-12">
                <p className="text-lg text-muted leading-relaxed max-w-3xl">
                  {rice.description}
                </p>
              </section>
            )}

            {rice.notes && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs uppercase tracking-widest text-muted">
                    Notes
                  </span>

                  <CopyButton text={rice.notes} />
                </div>

                <div className="rounded-2xl border border-border bg-surface overflow-hidden">
                  <pre className="p-6 text-sm text-muted overflow-x-auto whitespace-pre-wrap leading-relaxed font-mono">
                    {rice.notes}
                  </pre>
                </div>
              </section>
            )}
          </main>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              <div className="px-5 py-4 border-b border-border text-xs uppercase tracking-widest text-muted">
                Details
              </div>

              {[
                ['WM / DE', rice.wm],
                ['Distro', rice.distro],
                ['License', rice.license],
                [
                  'Published',
                  createdDate
                    ? format(createdDate, 'MMM d, yyyy')
                    : null,
                ],
              ]
                .filter((r) => r[1])
                .map(([label, value]) => (
                  <div
                    key={label}
                    className="px-5 py-4 border-b border-border last:border-none"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-muted mb-1">
                      {label}
                    </p>

                    <p className="text-sm text-text">
                      {value}
                    </p>
                  </div>
                ))}
            </div>

            {rice.palette?.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="text-xs uppercase tracking-widest text-muted mb-4">
                  Palette
                </div>

                <div className="flex flex-wrap gap-3">
                  {rice.palette.map((color, i) => (
                    <button
                      key={i}
                      title={color}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        navigator.clipboard.writeText(color)
                        toast.success(color)
                      }}
                      className="w-10 h-10 rounded-xl border border-border hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
              </div>
            )}

            {rice.github_url && (
              <a
                href={rice.github_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-accent text-surface font-semibold hover:opacity-90 transition"
              >
                <FontAwesomeIcon icon={faGithub} />
                View dotfiles
              </a>
            )}
          </aside>
        </div>
      </motion.div>
    </>
  )
}
