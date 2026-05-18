import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AnimatePresence, motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faXmark, faMagnifyingGlass, faPlus, faArrowRight, faCircleNotch,
  faBookOpen, faTag, faFire, faWandMagic, faPalette, faCode,
  faEye
} from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const CATEGORIES = [
  { id: 'waybar', label: 'Waybar', icon: faCode, color: '#6ee7b7' },
  { id: 'styles', label: 'Styles', icon: faPalette, color: '#f472b6' },
  { id: 'tips', label: 'Tips', icon: faFire, color: '#fb923c' },
  { id: 'guides', label: 'Guides', icon: faBookOpen, color: '#60a5fa' },
  { id: 'hyprland', label: 'Hyprland', icon: faWandMagic, color: '#a78bfa' },
  { id: 'other', label: 'Other', icon: faTag, color: '#94a3b8' },
]

function Label({ children, required }) {
  return (
    <label className="block text-xs font-medium text-white/40 mb-2">
      {children}{required && <span className="text-[#e8ff47] ml-1">*</span>}
    </label>
  )
}

function Field({ error, className, ...props }) {
  return (
    <input
      className={clsx(
        'w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border text-sm text-white placeholder:text-white/10 outline-none transition-all font-normal',
        error ? 'border-red-500/40 focus:border-red-500/60' : 'border-white/5 focus:border-[#e8ff47]/30 focus:bg-white/[0.05]',
        className
      )}
      {...props}
    />
  )
}

function Textarea({ error, className, ...props }) {
  return (
    <textarea
      className={clsx(
        'w-full px-4 py-2.5 rounded-lg bg-white/[0.03] border text-sm text-white placeholder:text-white/10 outline-none transition-all resize-none font-normal',
        error ? 'border-red-500/40 focus:border-red-500/60' : 'border-white/5 focus:border-[#e8ff47]/30 focus:bg-white/[0.05]',
        className
      )}
      {...props}
    />
  )
}

function WikiEntry({ wiki }) {
  const category = CATEGORIES.find(c => c.id === wiki.category) || CATEGORIES[5]

  return (
    <Link to={`/wiki/${wiki.id}`} className="block group">
      <article className="relative p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 hover:bg-white/[0.04] transition-all">
        <div className="flex items-start justify-between gap-4 mb-3">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-medium"
            style={{ backgroundColor: `${category.color}10`, color: category.color }}>
            <FontAwesomeIcon icon={category.icon} className="w-3 h-3" />
            {category.label}
          </span>
          <div className="flex items-center gap-3 text-[11px] text-white/30">
            <span className="flex items-center gap-1.5 font-normal">
              <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
              {wiki.views || 0}
            </span>
          </div>
        </div>

        <h2 className="text-lg font-medium text-white group-hover:text-[#e8ff47] transition-colors mb-2 leading-snug">
          {wiki.title}
        </h2>

        <p className="text-sm text-white/40 line-clamp-2 mb-4 font-normal leading-relaxed">
          {wiki.summary}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="text-xs text-white/30 font-normal">
            {wiki.author || 'anonymous'}
          </span>
          <span className="text-[11px] text-white/20 font-normal">
            {formatDistanceToNow(new Date(wiki.created_at), { addSuffix: true })}
          </span>
        </div>
      </article>
    </Link>
  )
}

function SubmitModal({ isOpen, onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false)
  const [category, setCategory] = useState('')
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const onSubmit = async (data) => {
    if (!category) { toast.error('Select a category'); return }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('wikis').insert({
        title: data.title,
        summary: data.summary,
        content: data.content,
        author: data.author || 'anonymous',
        category,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        cover_url: data.coverUrl || '',
        views: 0,
      })
      if (error) throw error
      toast.success('Wiki published')
      reset(); setCategory(''); onSuccess()
    } catch (err) {
      toast.error('Error saving data')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="absolute inset-0 bg-[#050505]/90 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-[#0d0d0f] border border-white/10 shadow-xl overflow-hidden font-sans"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.01]">
              <h2 className="text-base font-medium text-white">Create New Wiki Entry</h2>
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <Label required>Title</Label>
                    <Field placeholder="Entry title..." {...register('title', { required: true })} error={errors.title} />
                  </div>
                  <div>
                    <Label required>Summary (List view)</Label>
                    <Textarea rows={3} placeholder="Short description..." {...register('summary', { required: true })} error={errors.summary} />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <Label required>Category</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((cat) => (
                        <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                          className={clsx('px-3 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2',
                            category === cat.id ? 'border-[#e8ff47] bg-[#e8ff47]/5 text-[#e8ff47]' : 'border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10')}>
                          <FontAwesomeIcon icon={cat.icon} className="opacity-40" />
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Field placeholder="Your name or handle" {...register('author')} />
                  </div>
                </div>
              </div>

              <div>
                <Label required>Documentation Content (Markdown)</Label>
                <Textarea rows={10} className="font-mono text-[13px] leading-normal" placeholder="# Write your guide here..."
                  {...register('content', { required: true })} error={errors.content} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Cover URL</Label>
                  <Field placeholder="https://..." {...register('coverUrl')} />
                </div>
                <div>
                  <Label>Tags</Label>
                  <Field placeholder="linux, config, tips" {...register('tags')} />
                </div>
              </div>
            </form>

            <div className="p-5 border-t border-white/5 bg-white/[0.01] flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-xs font-medium text-white/40 hover:text-white transition-colors">
                Cancel
              </button>
              <button type="submit" onClick={handleSubmit(onSubmit)} disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#e8ff47] hover:bg-[#d9f035] disabled:opacity-50 text-black font-medium text-xs transition-all shadow-lg">
                {submitting ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" /> : <span>Publish Entry</span>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function Wiki() {
  const [wikis, setWikis] = useState([]); const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(''); const [activeCategory, setActiveCategory] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const fetchWikis = async (category) => {
    setLoading(true)
    try {
      let query = supabase.from('wikis').select('*').order('created_at', { ascending: false })
      if (category) query = query.eq('category', category)
      const { data, error } = await query
      if (error) throw error; setWikis(data || [])
    } catch (err) { setWikis([]) } finally { setLoading(false) }
  }

  useEffect(() => { fetchWikis(activeCategory) }, [activeCategory])

  const filteredWikis = wikis.filter(w =>
    !search || w.title?.toLowerCase().includes(search.toLowerCase()) ||
    w.summary?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-24 font-sans">
      <header className="mb-12 flex items-end justify-between border-b border-white/5 pb-8">
        <div>
          <p className="text-xs font-medium text-[#e8ff47] mb-2">Wiki</p>
          <h1 className="text-3xl font-medium text-white tracking-tight">Documentation</h1>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-all border border-white/10">
          <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
          <span>Contribute</span>
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15 w-3.5 h-3.5" />
          <input type="text" placeholder="Search database..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-sm text-white placeholder:text-white/10 outline-none focus:border-white/20 transition-all font-normal" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <button onClick={() => setActiveCategory('')}
          className={clsx('px-4 py-2 rounded-lg text-xs font-medium border transition-all',
            !activeCategory ? 'border-[#e8ff47] bg-[#e8ff47] text-black' : 'border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10')}>
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(activeCategory === cat.id ? '' : cat.id)}
            className={clsx('px-4 py-2 rounded-lg text-xs font-medium border transition-all flex items-center gap-2',
              activeCategory === cat.id ? 'border-[#e8ff47] bg-[#e8ff47] text-black' : 'border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10')}>
            <FontAwesomeIcon icon={cat.icon} className="text-[10px] opacity-40" />
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FontAwesomeIcon icon={faCircleNotch} className="w-5 h-5 text-white/10 animate-spin" />
        </div>
      ) : filteredWikis.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl">
          <p className="text-white/20 text-sm">No entries found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredWikis.map((wiki) => (
            <WikiEntry key={wiki.id} wiki={wiki} />
          ))}
        </div>
      )}

      <SubmitModal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        onSuccess={() => { setModalOpen(false); fetchWikis(activeCategory) }} />
    </div>
  )
}
