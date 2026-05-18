import { motion } from 'framer-motion'
import RiceGrid from '../components/RiceGrid'

export default function Gallery() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="pt-36 pb-16"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-accent mb-4">Gallery</p>
            <h1 className="text-5xl sm:text-7xl tracking-[-0.04em] leading-[0.9] text-white">
              Dotfiles <span className='text-accent'>Gallery</span><br />
            </h1>
          </div>
          <p className="text-sm text-white/30 max-w-xs leading-relaxed lg:mb-2">
            Every approved setup from the community — filter by WM, distro, or sort however you want.
          </p>
        </div>
      </motion.section>

      <section className="pb-32">
        <RiceGrid defaultSort="recent" />
      </section>

    </div>
  )
}
