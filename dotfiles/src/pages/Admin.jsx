import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark, faArrowRightFromBracket, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function Admin() {
  const { user, initialized } = useAuth()
  const navigate = useNavigate()
  const [rices, setRices] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)

  useEffect(() => {
    if (initialized && user === null) navigate('/admin/login')
  }, [user, initialized, navigate])

  useEffect(() => {
    if (user) fetchPending()
  }, [user])

  async function fetchPending() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rices')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      if (error) throw error
      setRices(data)
    } catch {
      toast.error('Failed to load pending submissions.')
    } finally {
      setLoading(false)
    }
  }

  async function approve(id) {
    setActing(id)
    try {
      const { error } = await supabase.from('rices').update({ status: 'approved' }).eq('id', id)
      if (error) throw error
      setRices((prev) => prev.filter((r) => r.id !== id))
      toast.success('Approved!')
    } catch {
      toast.error('Failed to approve.')
    } finally {
      setActing(null)
    }
  }

  async function reject(id) {
    setActing(id)
    try {
      const { error } = await supabase.from('rices').delete().eq('id', id)
      if (error) throw error
      setRices((prev) => prev.filter((r) => r.id !== id))
      toast.success('Rejected and deleted.')
    } catch {
      toast.error('Failed to reject.')
    } finally {
      setActing(null)
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (!initialized) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#e8ff47] animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-24">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/20 mb-1">Admin</p>
          <h1 className="text-xl font-semibold text-white tracking-tight">Pending submissions</h1>
          <p className="text-xs text-white/25 font-mono mt-1">
            {loading ? '...' : `${rices.length} waiting for review`}
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/8 text-[11px] text-white/30 hover:text-white/60 hover:border-white/15 transition-all"
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-3 h-3" />
          Sign out
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-[#e8ff47] animate-spin" />
        </div>
      ) : rices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-[#e8ff47]/8 border border-[#e8ff47]/15 flex items-center justify-center mb-2">
            <FontAwesomeIcon icon={faCheck} className="w-4 h-4 text-[#e8ff47]/60" />
          </div>
          <p className="text-sm font-medium text-white/40">All clear</p>
          <p className="text-xs text-white/20 font-mono">no pending submissions</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {rices.map((rice, i) => {
              const createdDate = rice.created_at ? new Date(rice.created_at) : null
              const isActing = acting === rice.id
              return (
                <motion.div
                  key={rice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12, scale: 0.98 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="rounded-xl border border-white/8 bg-white/[0.02] overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
                    {/* Image */}
                    <div className="aspect-video md:aspect-auto bg-black/40 overflow-hidden relative">
                      {rice.image_url ? (
                        <img
                          src={rice.image_url}
                          alt={rice.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-white/15 uppercase tracking-widest">
                          no image
                        </div>
                      )}
                      {/* pending badge over image */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 border border-yellow-500/30 text-[10px] font-mono text-yellow-400 backdrop-blur-sm">
                          pending
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-3">
                        <div>
                          <h2 className="text-base font-semibold text-white leading-snug">{rice.title}</h2>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <div className="w-5 h-5 rounded-md bg-[#e8ff47]/10 border border-[#e8ff47]/20 flex items-center justify-center text-[8px] font-bold text-[#e8ff47]">
                              {rice.author?.[0]?.toUpperCase() ?? '?'}
                            </div>
                            <span className="text-xs text-white/40">{rice.author || 'anonymous'}</span>
                            {rice.wm && (
                              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/8 text-[10px] text-white/35 font-mono">
                                {rice.wm}
                              </span>
                            )}
                            {rice.distro && (
                              <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/8 text-[10px] text-white/35 font-mono">
                                {rice.distro}
                              </span>
                            )}
                            {createdDate && (
                              <span className="text-[10px] text-white/20 font-mono">
                                {formatDistanceToNow(createdDate, { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>

                        {rice.description && (
                          <p className="text-xs text-white/35 leading-relaxed line-clamp-2">{rice.description}</p>
                        )}

                        {rice.palette?.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            {rice.palette.slice(0, 10).map((color, i) => (
                              <div
                                key={i}
                                className="w-4 h-4 rounded-sm border border-white/10"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        )}

                        {rice.github_url && (
                          <a
                            href={rice.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors font-mono truncate max-w-xs w-fit"
                          >
                            <FontAwesomeIcon icon={faGithub} className="w-3 h-3 flex-shrink-0" />
                            {rice.github_url.replace('https://github.com/', '')}
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.05]">
                        <button
                          onClick={() => approve(rice.id)}
                          disabled={isActing}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#e8ff47]/8 border border-[#e8ff47]/20 text-[#e8ff47] hover:bg-[#e8ff47]/15 text-xs font-medium transition-all disabled:opacity-40"
                        >
                          <FontAwesomeIcon icon={isActing ? faSpinner : faCheck} className={clsx('w-3 h-3', isActing && 'animate-spin')} />
                          Approve
                        </button>
                        <button
                          onClick={() => reject(rice.id)}
                          disabled={isActing}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/8 border border-red-500/20 text-red-400 hover:bg-red-500/15 text-xs font-medium transition-all disabled:opacity-40"
                        >
                          <FontAwesomeIcon icon={isActing ? faSpinner : faXmark} className={clsx('w-3 h-3', isActing && 'animate-spin')} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
