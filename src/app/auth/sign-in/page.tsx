'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { ArrowRight, Loader2, CheckCircle2, Mail } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SignInContent() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/home'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (errorParam) setErrorMsg('Sign-in failed. Please try again.')
  }, [errorParam])

  async function handleGoogle() {
    setStatus('loading')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${next}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) { setErrorMsg(error.message); setStatus('error') }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMsg('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${next}` },
    })
    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-6">
        <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-primary-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white mb-1">Check your email</p>
          <p className="text-sm text-gray-500">We sent a magic link to <span className="font-medium text-gray-700 dark:text-slate-300">{email}</span></p>
        </div>
        <button
          className="text-sm text-primary-600 underline"
          onClick={() => setStatus('idle')}
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Google OAuth */}
      <button
        onClick={handleGoogle}
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-medium text-sm hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
      >
        {status === 'loading'
          ? <Loader2 size={18} className="animate-spin" />
          : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )
        }
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700" />
      </div>

      {/* Magic Link */}
      <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input pl-10 text-sm"
          />
        </div>
        <button type="submit" disabled={status === 'loading'} className="btn-primary w-full justify-center py-3.5">
          {status === 'loading'
            ? <Loader2 size={18} className="animate-spin" />
            : <><span>Send magic link</span> <ArrowRight size={16} /></>
          }
        </button>
      </form>

      {errorMsg && <p className="text-xs text-red-500 text-center">{errorMsg}</p>}

      <p className="text-xs text-gray-400 text-center leading-relaxed">
        By signing in, you agree to our Terms of Service. No password needed.
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-surface dark:bg-surface-dark">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-bold text-gray-900 dark:text-white text-xl mb-1">
            TripDrip<span className="text-primary-600">GoGo</span>
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Save your trip</h1>
          <p className="text-gray-500 text-sm">Sign in to sync your trip across devices.</p>
        </div>

        <div className="card p-5">
          <Suspense fallback={<div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" /></div>}>
            <SignInContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
