import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faThumbsUp, faShuffle, faChevronDown, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import RiceCard from './RiceCard'
import clsx from 'clsx'

const WM_OPTIONS = ['All', 'Niri', 'Hyprland', 'i3', 'MangoWM', 'Sway', 'Omarchy', 'bspwm', 'dwm', 'Qtile', 'AwesomeWM', 'XFCE', 'MiracleWM', 'KDE', 'GNOME']
const DISTRO_OPTIONS = ['All', 'Arch', 'NixOS', 'Debian', 'Fedora', 'Ubuntu', 'Void', 'Gentoo', 'EndeavourOS', 'openSUSE']

const SORT_OPTIONS = [
  { label: 'Recent', value: 'recent', icon: faClock, field: 'created_at' },
  { label: 'Most liked', value: 'liked', icon: faThumbsUp, field: 'likes' },
  { label: 'Random', value: 'random', icon: faShuffle, field: null },
]

function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const active = value && value !== 'All'
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all border',
          active
            ? 'bg-surface border-border text-black'
            : 'bg-white/[0.04] border-white/8 text-white/40 hover:text-white hover:border-white/15'
        )}
      >
        {active ? value : label}
        <FontAwesomeIcon icon={faChevronDown} className={clsx('w-2.5 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.11 }}
            className="absolute top-full mt-1.5 left-0 z-50 w-44 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-56 overflow-y-auto p-1">
              {options.map((opt) => (
                <li key={opt}>
                  <button
                    onClick={() => { onChange(opt); setOpen(false) }}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-colors',
                      value === opt ? 'bg-accent text-black' : 'text-white/40 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function RiceGrid({ defaultSort = 'recent' }) {
  const [rices, setRices] = useState([])
  const [allRices, setAllRices] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState(defaultSort)
  const [wm, setWm] = useState('All')
  const [distro, setDistro] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchRices() {
      setLoading(true)
      try {
        const sortOption = SORT_OPTIONS.find((o) => o.value === sort)
        let q = supabase
          .from('rices')
          .select('*')
          .eq('status', 'approved')
          .limit(48)

        if (sort === 'random') {
          q = q.order('created_at', { ascending: false })
        } else {
          q = q.order(sortOption.field, { ascending: false })
        }

        const { data, error } = await q
        if (error) throw error

        let docs = data
        if (sort === 'random') docs = docs.sort(() => Math.random() - 0.5)
        setAllRices(docs)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRices()
  }, [sort])

  useEffect(() => {
    let filtered = [...allRices]
    if (wm !== 'All') filtered = filtered.filter((r) => r.wm === wm)
    if (distro !== 'All') filtered = filtered.filter((r) => r.distro === distro)
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.author?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.wm?.toLowerCase().includes(q) ||
          r.distro?.toLowerCase().includes(q)
      )
    }
    setRices(filtered)
  }, [allRices, wm, distro, search])

  const hasFilters = wm !== 'All' || distro !== 'All' || search.trim() !== ''
  const clearAll = () => { setWm('All'); setDistro('All'); setSearch('') }

  return (
    <div>
      <div className="relative z-40 py-4 border-y border-white/5 bg-surface mb-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-0.5 bg-white/[0.04] border border-white/8 rounded-xl p-1">
              {SORT_OPTIONS.map(({ label, value, icon }) => (
                <button
                  key={value}
                  onClick={() => setSort(value)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                    sort === value ? 'bg-white/10 text-accent' : 'text-white/30 hover:text-white/60'
                  )}
                >
                  <FontAwesomeIcon icon={icon} className="w-3 h-3" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Dropdown label="WM / DE" options={WM_OPTIONS} value={wm} onChange={setWm} />
              <Dropdown label="Distro" options={DISTRO_OPTIONS} value={distro} onChange={setDistro} />
              <AnimatePresence>
                {hasFilters && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    onClick={clearAll}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="relative">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, author, WM, distro…"
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/8 rounded-xl text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {!loading && hasFilters && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white/20 mb-5 -mt-3">
          {rices.length} result{rices.length !== 1 ? 's' : ''}
        </motion.p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-xl bg-white/[0.03] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : rices.length === 0 ? (
        <div className="py-28 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-white/20">
            {hasFilters ? 'No results for these filters.' : 'No setups yet.'}
          </p>
          {!hasFilters && (
            <Link to="/submit" className="text-xs text-accent hover:underline">Be the first to submit →</Link>
          )}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {rices.map((rice, i) => (
              <motion.div
                key={rice.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2, delay: i < 6 ? i * 0.04 : 0 }}
              >
                <RiceCard rice={rice} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
