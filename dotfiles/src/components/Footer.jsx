import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCode } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faRedditAlien } from '@fortawesome/free-brands-svg-icons'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface mt-24">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-accent border border-accent/20 bg-accent/5 px-2.5 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              OPEN SOURCE
            </span>
            <p className="text-base font-bold tracking-tight text-text mb-2">
              Awesome<span className="text-accent">Dotfiles</span>
            </p>
            <p className="text-xs text-muted leading-relaxed max-w-[200px]">
              A curated gallery of Linux desktop setups — submitted and browsed by the community.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] text-border mb-4">EXPLORE</p>
            <ul className="flex flex-col gap-2.5">
              {['Gallery', 'Themes', 'Wiki', 'About'].map(item => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="text-sm text-muted hover:text-text transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.12em] text-border mb-4">CONTRIBUTE</p>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link to="/submit" className="text-sm text-accent hover:text-accent/80 transition-colors">
                  Submit your rice →
                </Link>
              </li>
              {[
                { label: 'Submission guide', to: '/guide' },
                { label: 'GitHub repo', to: 'https://github.com/zhaleff/Awesome-Dotfiles' },
                { label: 'r/unixporn', to: 'https://reddit.com/r/unixporn' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted hover:text-text transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="h-px bg-border mb-6" />
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-mono text-border">
            Copyright (c) {year} Zhaleff. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  )
}
