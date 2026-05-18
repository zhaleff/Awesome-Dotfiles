import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

export default function RiceCard({ rice, index = 0 }) {
  const date = rice.created_at ? new Date(rice.created_at) : null
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.02, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        to={`/rice/${rice.id}`}
        className="group block border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] transition-colors duration-300"
      >
        <div className="aspect-video overflow-hidden relative bg-black">
          {rice.image_url ? (
            <img
              src={rice.image_url}
              alt={rice.title}
              className="w-full h-full object-cover  group-hover:scale-[1.05]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[10px] text-white/10">no preview</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {rice.wm && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/8 text-[10px] font-medium text-white/50">
              {rice.wm}
            </span>
          )}
          {rice.palette?.length > 0 && (
            <div className="absolute bottom-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {rice.palette.slice(0, 5).map((color, i) => (
                <div key={i} className="w-3 h-3 rounded-sm border border-white/10 shadow-sm" style={{ backgroundColor: color }} />
              ))}
            </div>
          )}
        </div>
        <div className="px-4 py-3.5 flex flex-col gap-2">
          <h3 className="text-sm font-medium text-white/80 leading-snug line-clamp-1 group-hover:text-white transition-colors duration-200">
            {rice.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-white/5 border border-white/8 flex items-center justify-center text-[9px] font-semibold text-accent/80">
                {rice.author?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span className="text-xs text-white/25 group-hover:text-white/50">
                {rice.author ?? 'anonymous'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-white/15">
              <span className="group-hover:text-accent ">↑ {rice.likes ?? 0}</span>
              {date && <span>{formatDistanceToNow(date, { addSuffix: true })}</span>}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
