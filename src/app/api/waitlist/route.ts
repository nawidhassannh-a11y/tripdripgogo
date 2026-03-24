import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  // If Supabase is not configured yet, store locally (dev mode)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('[waitlist] Supabase not configured — dev mode, email:', email)
    return NextResponse.json({ ok: true })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('waitlist')
    .insert({ email, source: 'landing_page' })

  if (error) {
    // Ignore duplicate email errors
    if (error.code === '23505') {
      return NextResponse.json({ ok: true })
    }
    console.error('[waitlist] Supabase error:', error)
    return NextResponse.json({ error: 'Could not save email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
