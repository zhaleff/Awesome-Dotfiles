import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [total, setTotal] = useState(null)

  useEffect(() => {
    supabase
      .from('rices')
      .select('*', { count: 'exact', head: true })
      .then(({ count }) => setTotal(count))
      .catch(() => { })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">

      <section className="pt-36 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-3 mb-8">
            {total !== null && (
              <span className="text-xs text-white/20">{total.toLocaleString()} setups indexed</span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end gap-10 mb-10">
            <div className="flex-1">
              <h1 className="text-6xl sm:text-7xl lg:text-8xl tracking-[-0.05em] leading-[0.9] text-text">
                Built for <br />
                <span className='text-6xl sm:text-7xl lg:text-8xl tracking-[-0.05em] leading-[0.9] text-accent'>you</span>
              </h1>
            </div>
            <p className="text-base text-white/35 max-w-sm leading-relaxed lg:mb-2">
              The central hub for Linux desktop configurations. Discover setups, color palettes, and dotfiles from the community.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/gallery" className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent hover:bg-white text-black text-sm">
              Browse gallery
              <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
            </Link>
            <Link to="/submit" className="flex items-center px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm">
              Submit your rice
            </Link>
            <a href="https://reddit.com/r/unixporn" target="_blank" rel="noreferrer" className="flex items-center px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/30 hover:text-white text-sm">
              r/unixporn
            </a>
          </div>
        </motion.div>
      </section>

      <div className="border-t border-white/5 mb-20" />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="pb-28"
      >


        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-white/40">Recent submissions</p>
          <Link to="/gallery" className="text-xs text-white/25 hover:text-accent">
            View all →
          </Link>
        </div>

        <RecentPreviews />
      </motion.section>

    </div>
  )
}

function RecentPreviews() {
  const [rices, setRices] = useState([])

  useEffect(() => {
    supabase
      .from('rices')
      .select('id, title, author, image_url, wm, distro')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => setRices(data ?? []))
      .catch(() => { })
  }, [])

  if (!rices.length) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-video rounded-xl bg-white/[0.03] animate-pulse border border-white/5" />
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {rices.map((rice, i) => (
        <motion.div
          key={rice.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
        >
          <Link to={`/rice/${rice.id}`} className="group block rounded-xl overflow-hidden border border-white/8 bg-white/[0.02] hover:border-[#e8ff47]/25">
            <div className="aspect-video overflow-hidden bg-black relative">
              {rice.image_url ? (
                <img src={rice.image_url} alt={rice.title} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[10px] text-white/10 uppercase tracking-widest">no preview</span>
                </div>
              )}
              {rice.wm && (
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] text-white/60">
                  {rice.wm}
                </span>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="text-sm text-white/70 group-hover:text-white line-clamp-1">{rice.title}</p>
              <span className="text-xs text-white/20 flex-shrink-0 ml-2">{rice.author ?? 'anon'}</span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
