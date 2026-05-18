import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faArrowRight, faArrowLeft, faCircleNotch, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/uploadcare'
import clsx from 'clsx'

const WM_OPTIONS = ['Hyprland', 'Niri', 'i3', 'Sway', 'MangoWM', 'bspwm', 'dwm', 'Omarchy', 'Qtile', 'AwesomeWM', 'XFCE', 'KDE', 'GNOME', 'Other']
const DISTRO_OPTIONS = ['Arch', 'NixOS', 'Debian', 'Fedora', 'Ubuntu', 'Void', 'Gentoo', 'EndeavourOS', 'openSUSE', 'Other']
const LICENSE_OPTIONS = ['MIT', 'GPL-3.0', 'Apache-2.0', 'Unlicense', 'BSD-3-Clause', 'MPL-2.0', 'None']

const STEPS = ['Screenshot', 'Details', 'Config', 'Review']

function Label({ children, required }) {
  return (
    <label className="block text-[11px] text-white/30 uppercase tracking-widest mb-2.5">
      {children}{required && <span className="text-[#e8ff47] ml-1">*</span>}
    </label>
  )
}
function Field({ error, className, ...props }) {
  return (
    <input
      className={clsx(
        'w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-white placeholder:text-white/15 outline-none',
        error ? 'border-red-500/40' : 'border-white/8 focus:border-[#e8ff47]/30 focus:bg-white/[0.06]',
        className
      )}
      {...props}
    />
  )
}
function Textarea({ ...props }) {
  return (
    <textarea
      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/8 text-sm text-white placeholder:text-white/15 outline-none resize-none focus:border-[#e8ff47]/30 focus:bg-white/[0.06]"
      {...props}
    />
  )
}
function Chips({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt === value ? '' : opt)}
          className={clsx(
            'px-3.5 py-1.5 rounded-full text-xs border',
            value === opt
              ? 'bg-[#e8ff47] border-[#e8ff47] text-black'
              : 'bg-white/[0.03] border-white/8 text-white/35 hover:text-white hover:border-white/20'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={clsx(
            'flex items-center gap-1.5',
            i <= current ? 'text-white' : 'text-white/20'
          )}>
            <div className={clsx(
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
              i < current ? 'bg-[#e8ff47] text-black' : i === current ? 'border border-[#e8ff47] text-[#e8ff47]' : 'border border-white/10 text-white/20'
            )}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className="text-[11px] hidden sm:block">{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={clsx('w-8 h-px', i < current ? 'bg-[#e8ff47]/40' : 'bg-white/8')} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function Submit() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [wm, setWm] = useState('')
  const [distro, setDistro] = useState('')
  const [license, setLicense] = useState('')
  const [palette, setPalette] = useState([])
  const [colorInput, setColorInput] = useState('#')
  const { register, handleSubmit, getValues, formState: { errors } } = useForm()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 8 * 1024 * 1024,
    multiple: false,
    onDropAccepted: ([file]) => { setImageFile(file); setImagePreview(URL.createObjectURL(file)) },
    onDropRejected: () => toast.error('Image must be under 8MB.'),
  })

  const addColor = () => {
    const hex = colorInput.trim()
    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) { toast.error('Enter a valid hex, e.g. #1e1e2e'); return }
    if (palette.includes(hex) || palette.length >= 10) return
    setPalette((p) => [...p, hex])
    setColorInput('#')
  }

  const next = () => {
    if (step === 0 && !imageFile) { toast.error('Please upload a screenshot first.'); return }
    if (step === 1) {
      const { title } = getValues()
      if (!title) { toast.error('Title is required.'); return }
      if (!wm) { toast.error('Please select a WM / DE.'); return }
      if (!distro) { toast.error('Please select a distro.'); return }
    }
    setStep((s) => s + 1)
  }

  const onSubmit = async (data) => {
    setSubmitting(true)
    const toastId = toast.loading('Uploading...')
    try {
      const image_url = await uploadImage(imageFile)
      toast.loading('Saving...', { id: toastId })
      const { error } = await supabase.from('rices').insert({
        title: data.title,
        author: data.author || 'anonymous',
        description: data.description || '',
        github_url: data.githubUrl || '',
        notes: data.notes || '',
        wm, distro, palette, license, image_url,
        status: 'pending',
        views: 0, likes: 0, dislikes: 0,
      })
      if (error) throw error
      toast.success('Submitted!', { id: toastId })
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong.', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  const variants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 pt-28 pb-24">
      <div className="mb-10">
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#e8ff47] mb-3">New submission</p>
        <h1 className="text-3xl text-white mb-1">Share your setup</h1>
        <p className="text-sm text-white/30">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
      </div>

      <StepIndicator current={step} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">

          {step === 0 && (
            <motion.div key="step0" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col gap-6">
              <div>
                <Label required>Screenshot</Label>
                <div
                  {...getRootProps()}
                  className={clsx(
                    'relative rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden',
                    isDragActive ? 'border-[#e8ff47]/50 bg-[#e8ff47]/5' : 'border-white/8 hover:border-white/16 bg-white/[0.02]'
                  )}
                >
                  <input {...getInputProps()} />
                  <AnimatePresence mode="wait">
                    {imagePreview ? (
                      <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                        <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-72 rounded-2xl" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl pointer-events-none" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null) }}
                          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:bg-black/80"
                        >
                          <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-3 left-3 text-[10px] text-white/40">Click to replace</span>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <FontAwesomeIcon icon={faCloudArrowUp} className="w-4 h-4 text-white/20" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-white/30">Drop your screenshot here</p>
                          <p className="text-xs text-white/15 mt-0.5">PNG, JPG, WEBP — max 8MB</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <button type="button" onClick={next} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#e8ff47] hover:bg-[#d4eb30] text-black text-sm">
                Continue <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label required>Title</Label>
                  <Field placeholder="Minimal Hyprland + Catppuccin" error={errors.title} {...register('title', { required: true })} />
                  {errors.title && <p className="text-xs text-red-400 mt-1.5">Required.</p>}
                </div>
                <div>
                  <Label>Author</Label>
                  <Field placeholder="anonymous" {...register('author')} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={3} placeholder="What makes your setup special..." {...register('description')} />
              </div>
              <div>
                <Label required>Window manager / DE</Label>
                <Chips options={WM_OPTIONS} value={wm} onChange={setWm} />
              </div>
              <div>
                <Label required>Distro</Label>
                <Chips options={DISTRO_OPTIONS} value={distro} onChange={setDistro} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(0)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/8 text-white/40 hover:text-white text-sm">
                  <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" /> Back
                </button>
                <button type="button" onClick={next} className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-[#e8ff47] hover:bg-[#d4eb30] text-black text-sm">
                  Continue <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col gap-6">
              <div>
                <Label>Dotfiles URL</Label>
                <div className="relative">
                  <FontAwesomeIcon icon={faGithub} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                  <Field className="pl-11" placeholder="https://github.com/you/dotfiles" {...register('githubUrl')} />
                </div>
              </div>
              <div>
                <Label>License</Label>
                <Chips options={LICENSE_OPTIONS} value={license} onChange={setLicense} />
              </div>
              <div>
                <Label>Color palette</Label>
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded border border-white/15" style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(colorInput) ? colorInput : 'transparent' }} />
                    <Field className="pl-11 font-mono text-xs" placeholder="#1e1e2e" value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())} />
                  </div>
                  <button type="button" onClick={addColor} className="px-4 rounded-xl bg-white/[0.04] border border-white/8 text-white/30 hover:text-white text-xs">+</button>
                </div>
                {palette.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {palette.map((color) => (
                      <div key={color} className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/8">
                        <div className="w-3.5 h-3.5 rounded-md border border-white/10 flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-[11px] font-mono text-white/35">{color}</span>
                        <button type="button" onClick={() => setPalette(p => p.filter(x => x !== color))} className="text-white/15 hover:text-white/60 ml-0.5">
                          <FontAwesomeIcon icon={faXmark} className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Label>Notes / config snippets</Label>
                <Textarea rows={4} placeholder="Shell, font, terminal, compositor..." className="font-mono text-xs" {...register('notes')} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/8 text-white/40 hover:text-white text-sm">
                  <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" /> Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-[#e8ff47] hover:bg-[#d4eb30] text-black text-sm">
                  Review <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="flex flex-col gap-6">
              <div className="rounded-2xl overflow-hidden border border-white/8">
                {imagePreview && <img src={imagePreview} alt="Preview" className="w-full object-cover max-h-48" />}
                <div className="p-5 flex flex-col gap-3">
                  <div>
                    <p className="text-base text-white">{getValues('title') || '—'}</p>
                    <p className="text-xs text-white/30 mt-0.5">by {getValues('author') || 'anonymous'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {wm && <span className="px-2.5 py-1 rounded-full text-[10px] bg-white/[0.04] border border-white/8 text-white/40">{wm}</span>}
                    {distro && <span className="px-2.5 py-1 rounded-full text-[10px] bg-white/[0.04] border border-white/8 text-white/40">{distro}</span>}
                    {license && <span className="px-2.5 py-1 rounded-full text-[10px] bg-white/[0.04] border border-white/8 text-white/40">{license}</span>}
                  </div>
                  {palette.length > 0 && (
                    <div className="flex gap-1">
                      {palette.map((c) => <div key={c} className="w-5 h-5 rounded border border-white/10" style={{ backgroundColor: c }} />)}
                    </div>
                  )}
                  {getValues('description') && <p className="text-xs text-white/30 leading-relaxed">{getValues('description')}</p>}
                </div>
              </div>
              <p className="text-[11px] text-center text-white/15">Your submission will be reviewed before appearing publicly.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/8 text-white/40 hover:text-white text-sm">
                  <FontAwesomeIcon icon={faArrowLeft} className="w-3.5 h-3.5" /> Back
                </button>
                <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-[#e8ff47] hover:bg-[#d4eb30] disabled:opacity-40 text-black text-sm">
                  {submitting ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin w-4 h-4" /> : <><span>Submit rice</span><FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5" /></>}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </form>
    </div>
  )
}
