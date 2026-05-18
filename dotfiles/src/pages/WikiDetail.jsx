import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faArrowLeft, faUser, faClock, faEye, faTag, 
  faShareNodes, faClipboard, faCheck
} from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'

function CopyButton({ code }) {
  const [copied, setCopied] = useState(false)
  
  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
      title="Copy code"
    >
      <FontAwesomeIcon icon={copied ? faCheck : faClipboard} className="w-3.5 h-3.5 text-white/70" />
    </button>
  )
}

export default function WikiDetail() {
  const { id } = useParams()
  const [wiki, setWiki] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWiki = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('wikis')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        
        if (data) {
          setWiki(data)
          await supabase.rpc('increment_wiki_views', { wiki_id: id })
        }
      } catch (err) {
        console.error(err)
        setError('Wiki not found')
      } finally {
        setLoading(false)
      }
    }
    
    fetchWiki()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white/5 rounded w-1/3" />
          <div className="h-4 bg-white/5 rounded w-1/4" />
          <div className="h-64 bg-white/5 rounded" />
        </div>
      </div>
    )
  }

  if (error || !wiki) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-24 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Wiki not found</h1>
        <p className="text-white/40 mb-6">The wiki you're looking for doesn't exist or has been removed.</p>
        <Link to="/wiki" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e8ff47] text-black font-medium">
          <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
          Back to Wiki
        </Link>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <Link 
        to="/wiki" 
        className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-6 transition-colors"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
        Back to Wiki
      </Link>

      {wiki.cover_url && (
        <div className="relative h-48 sm:h-64 rounded-xl overflow-hidden mb-8">
          <img 
            src={wiki.cover_url} 
            alt={wiki.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[#e8ff47]/10 text-[#e8ff47]">
            {wiki.category}
          </span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">
          {wiki.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/40">
          <span className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5" />
            {wiki.author || 'anonymous'}
          </span>
          <span className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(wiki.created_at), { addSuffix: true })}
          </span>
          <span className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
            {wiki.views || 0} views
          </span>
        </div>

        {wiki.tags && wiki.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {wiki.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/8 text-[10px] text-white/40">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-in prose-sm sm:prose-base max-w-none">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <div className="relative group rounded-lg overflow-hidden my-4">
                  <CopyButton code={String(children).replace(/\n$/, '')} />
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className="px-1.5 py-0.5 rounded bg-white/10 text-[#e8ff47] font-mono text-sm" {...props}>
                  {children}
                </code>
              )
            },
            h1: ({ children }) => <h1 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-8 mb-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-semibold text-white mt-6 mb-2">{children}</h3>,
            p: ({ children }) => <p className="text-white/70 leading-relaxed mb-4">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside text-white/70 mb-4 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside text-white/70 mb-4 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="text-white/70">{children}</li>,
            a: ({ href, children }) => (
              <a href={href} className="text-[#e8ff47] hover:underline" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[#e8ff47] pl-4 my-4 text-white/60 italic">
                {children}
              </blockquote>
            ),
            hr: () => <hr className="border-white/10 my-8" />,
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-white/10 rounded-lg">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-white/[0.05]">{children}</thead>,
            th: ({ children }) => <th className="px-4 py-2 text-left text-white/70 font-medium border border-white/10">{children}</th>,
            td: ({ children }) => <td className="px-4 py-2 text-white/60 border border-white/10">{children}</td>,
          }}
        >
          {wiki.content}
        </ReactMarkdown>
      </div>

      <footer className="mt-12 pt-6 border-t border-white/10">
        <p className="text-xs text-white/30 text-center">
          Last updated {formatDistanceToNow(new Date(wiki.updated_at || wiki.created_at), { addSuffix: true })}
        </p>
      </footer>
    </article>
  )
}