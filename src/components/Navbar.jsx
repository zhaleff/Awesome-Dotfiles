import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons'
import logo from '../assets/blacknode.png'
import clsx from 'clsx'

const navLinks = [
  { label: 'Gallery', to: '/gallery' },
  { label: 'Themes', to: '/themes' },
  { label: 'About', to: '/about' },
  { label: 'Wiki', to: '/wiki' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)

    window.addEventListener('scroll', fn, { passive: true })

    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
        <motion.header
          animate={
            scrolled
              ? {
                borderRadius: '999px',
                width: '100%',
                backgroundColor: 'rgba(22, 24, 32, 0.85)',
              }
              : {
                borderRadius: '999px',
                width: 'auto',
                backgroundColor: 'rgba(30, 32, 40, 0.95)',
              }
          }
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            backdropFilter: 'blur(12px)',
            border: '0.5px solid rgba(255,255,255,0.07)',
            overflow: 'hidden',
          }}
        >
          <div className="h-12 flex items-center gap-6 px-4">
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0 group"
            >
              <img
                src={logo}
                alt="logo"
                className="h-5 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
              />

              <motion.span
                animate={{
                  opacity: scrolled ? 1 : 0,
                  width: scrolled ? 'auto' : 0,
                }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-text text-sm tracking-tight overflow-hidden whitespace-nowrap"
                style={{ fontFamily: "'Lato', sans-serif" }}
              >
                Awesome <span className="text-accent">Dotfiles</span>
              </motion.span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, to }) => (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      'relative px-3 py-1.5 text-sm rounded-full transition-colors',
                      isActive
                        ? 'text-text'
                        : 'text-muted hover:text-text/70'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-white/10"
                          transition={{
                            type: 'spring',
                            bounce: 0.2,
                            duration: 0.4,
                          }}
                        />
                      )}

                      <span className="relative z-10">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <motion.div
              animate={{
                opacity: scrolled ? 1 : 0,
                width: scrolled ? 'auto' : 0,
              }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:flex items-center overflow-hidden ml-auto"
            >
              <Link
                to="/submit"
                className="whitespace-nowrap flex items-center px-4 py-1.5 rounded-full bg-accent hover:bg-accent/80 text-surface text-sm font-semibold transition-colors"
              >
                Share your build
              </Link>
            </motion.div>

            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden ml-auto w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-white/40 hover:text-white transition-colors"
            >
              <FontAwesomeIcon
                icon={mobileOpen ? faXmark : faBars}
                className="w-3.5 h-3.5"
              />
            </button>
          </div>
        </motion.header>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-20 left-4 right-4 z-40 bg-surface-2 border border-border rounded-full md:hidden overflow-hidden"
          >
            <nav className="p-3 flex flex-col gap-1">
              {navLinks.map(({ label, to }) => (
                <NavLink
                  key={label}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      'px-3 py-2.5 rounded-full text-sm transition-colors',
                      isActive
                        ? 'bg-white/10 text-text'
                        : 'text-muted hover:text-text'
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="mt-2 pt-3 border-t border-border">
                <Link
                  to="/submit"
                  className="flex items-center justify-center w-full py-2.5 rounded-full bg-accent text-surface text-sm font-semibold"
                >
                  Share your build
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
