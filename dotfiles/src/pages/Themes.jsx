import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { supabase } from '../lib/supabase'
import Typewriter from 'typewriter-effect'

function ThemeRow({ theme, index }) {
  return (
    <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    className="group flex flex-col md:flex-row gap-6 lg:gap-10 py-8 border-b border-white/5 last:border-0"
    >
    <div className="w-full md:w-[320px] lg:w-[420px] shrink-0 relative aspect-[16/9] overflow-hidden rounded-xl bg-white/[0.02]">
    {theme.image_url ? (
      <img
      src={theme.image_url}
      alt={theme.title}
      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      loading="lazy"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center">
      <span className="text-[10px] text-white/20 uppercase tracking-widest font-medium">no preview</span>
      </div>
    )}
    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
    </div>
    <div className="flex flex-col justify-center flex-1 py-2">
    <div className="flex items-center justify-between mb-4">
    <h3 className="text-2xl font-medium text-white/90 group-hover:text-white transition-colors">
    {theme.title}
    </h3>
    {theme.github_url && (
      <a href={theme.github_url} target="_blank" rel="noreferrer" className="text-white/20 hover:text-white transition-colors p-2">
      <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
      </a>
    )}
    </div>
    {theme.description && (
      <p className="text-sm text-white/40 leading-relaxed font-medium max-w-2xl">{theme.description}</p>
    )}
    </div>
    </motion.div>
  )
}

export default function Themes() {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchThemes() {
      try {
        const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('created_at', { ascending: false })
        if (error) throw error
          setThemes(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchThemes()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-32">
    <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    className="mb-20"
    >
    <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#e8ff47] mb-6">Color themes</p>
    <div className="flex flex-col lg:flex-row lg:items-end gap-12">
    <div className="flex-1">
    <h1 className="text-6xl sm:text-7xl lg:text-8xl font-medium tracking-[-0.05em] leading-[0.9] text-white">Themes</h1>
    <div className="text-6xl sm:text-7xl lg:text-8xl font-medium tracking-[-0.05em] leading-[0.9] text-[#e8ff47] mt-1">
    <Typewriter
    options={{
      strings: ['Gruvbox.', 'Tokyo Night.', 'Rose Pine.', 'Catppuccin.', 'Nord.', 'Dracula.'],
      autoStart: true,
      loop: true,
      delay: 65,
      deleteSpeed: 45,
      cursorClassName: 'text-[#e8ff47]',
    }}
    />
    </div>
    </div>
    <p className="text-sm text-white/40 max-w-xs leading-relaxed font-medium lg:mb-3">
    The most loved color themes in the Linux ricing community, all in one place.
    </p>
    </div>
    </motion.div>

    <div className="border-t border-white/5 mb-12" />

    {loading ? (
      <div className="flex flex-col gap-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-full h-[240px] rounded-xl bg-white/[0.02] animate-pulse border border-white/5" />
      ))}
      </div>
    ) : themes.length === 0 ? (
      <div className="py-24 text-center">
      <p className="text-sm text-white/20 font-medium">No themes yet.</p>
      </div>
    ) : (
      <div className="flex flex-col">
      {themes.map((theme, i) => (
        <ThemeRow key={theme.id} theme={theme} index={i} />
      ))}
      </div>
    )}
    </div>
  )
}
