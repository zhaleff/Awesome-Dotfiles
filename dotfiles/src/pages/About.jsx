import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-28"
      >
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent mb-6">About</p>
        <div className="flex flex-col lg:flex-row lg:items-end gap-12">
          <div className="flex-1">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-medium tracking-[-0.05em] leading-[0.9] text-white mb-0">
              About <br /> <span className="text-accent">This Proyect</span>
            </h1>
            <div className="text-6xl sm:text-7xl lg:text-8xl font-medium tracking-[-0.05em] leading-[0.9] text-[#e8ff47] mt-1">

            </div>
          </div>
        </div>
      </motion.div>

      <div className="border-t border-white/5 mb-28" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 mb-28"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-1">01</p>
          <h2 className="text-2xl font-medium text-white tracking-tight">What is this</h2>
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-base text-white/50 leading-relaxed">
            Awesome Dotfiles is a community-maintained gallery for Linux desktop configurations — what the ricing community calls "rices." Every setup here has been submitted by a real person and manually reviewed before going live.
          </p>
          <p className="text-sm text-white/30 leading-relaxed">
            Each entry comes with a screenshot, the window manager and distro it runs on, a color palette, and usually a direct link to the dotfiles on GitHub. You can browse, filter, vote, and get inspired — or submit your own setup and share it with thousands of people who actually care about this stuff.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {['Community driven', 'Manually reviewed', 'No accounts needed', 'Always free'].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/8 text-xs text-white/40">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
      <div className="border-t border-white/5 mb-28" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 mb-28"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-1">02</p>
          <h2 className="text-2xl font-medium text-white tracking-tight">How it's built</h2>
        </div>
        <div className="flex flex-col gap-8">
          <p className="text-sm text-white/35 leading-relaxed">
            The entire stack is serverless. No backend to maintain, no servers to scale. Submissions go straight to Firestore, images land on UploadCare CDN, and the whole thing is hosted on Firebase. Fast, cheap, and reliable enough for what this needs to be.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { layer: 'Frontend', tech: 'React + Vite', detail: 'Fast builds, lazy loaded routes' },
              { layer: 'Database', tech: 'SupaBase', detail: 'Real-time NoSQL, composite indexes' },
              { layer: 'Images', tech: 'UploadCare', detail: 'CDN delivery, unsigned uploads' },
              { layer: 'Styling', tech: 'Tailwind CSS v4', detail: 'CSS variables, @theme directive' },
              { layer: 'Animations', tech: 'Framer Motion', detail: 'Entrance animations, transitions' },
              { layer: 'Hosting', tech: 'Vercel Hosting', detail: 'Global CDN, SSL included' },
            ].map(({ layer, tech, detail }) => (
              <div key={layer} className="flex flex-col gap-1 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/20 uppercase tracking-wider">{layer}</span>
                </div>
                <p className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">{tech}</p>
                <p className="text-[11px] text-white/25">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <div className="border-t border-white/5 mb-28" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 mb-28"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-1">03</p>
          <h2 className="text-2xl font-medium text-white tracking-tight">how does it help?</h2>
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-base text-white/50 leading-relaxed">
            Here you can find various dotfiles created by the community. You can definitely find inspiration in them; everyone has their own ricing style. You can even go beyond simply trying them out and modify them to your liking. No more asking someone else for their configuration; upload your own configuration right here and share it with the world. Easy to upload, easy to view, no cookies, no registration, nothing.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            {['Community driven', 'Manually reviewed', 'No accounts needed', 'Always free'].map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/8 text-xs text-white/40">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
      <div className="border-t border-white/5 mb-28" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
      >
        <div>
          <p className="text-xl font-medium text-white mb-1">More sections coming soon</p>
          <p className="text-sm text-white/25 italic">The project is currently under active development.</p>
        </div>
      </motion.div>
    </div>
  )
}
