import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back.')
      navigate('/admin')
    } catch (err) {
      toast.error('Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#e8ff47] mb-3">Admin</p>
          <h1 className="text-3xl text-white mb-2">Sign in</h1>
          <p className="text-sm text-white/30">Restricted access. Authorized users only.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-white/30 mb-2">Email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              className={clsx(
                'w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-white placeholder:text-white/15 outline-none transition-all',
                errors.email ? 'border-red-500/40' : 'border-white/8 focus:border-[#e8ff47]/30'
              )}
              {...register('email', { required: true })}
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-widest text-white/30 mb-2">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className={clsx(
                'w-full px-4 py-3 rounded-xl bg-white/[0.04] border text-sm text-white placeholder:text-white/15 outline-none transition-all',
                errors.password ? 'border-red-500/40' : 'border-white/8 focus:border-[#e8ff47]/30'
              )}
              {...register('password', { required: true })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 rounded-xl bg-[#e8ff47] hover:bg-[#d4eb30] disabled:opacity-40 text-black text-sm transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

      </div>
    </div>
  )
}
