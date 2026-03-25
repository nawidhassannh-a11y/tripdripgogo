'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Plus, Sparkles, Loader2, X } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import type { TripDocument } from '@/types'

const DOC_TYPES: { type: TripDocument['type']; label: string; emoji: string }[] = [
  { type: 'flight',    label: 'Flight',    emoji: '✈️' },
  { type: 'hotel',     label: 'Hotel',     emoji: '🏨' },
  { type: 'insurance', label: 'Insurance', emoji: '🛡️' },
  { type: 'activity',  label: 'Activity',  emoji: '🎯' },
  { type: 'other',     label: 'Other',     emoji: '📄' },
]

const DOC_EMOJIS: Record<string, string> = {
  flight: '✈️', hotel: '🏨', insurance: '🛡️', activity: '🎯', other: '📄',
}

// eSIM data per country code
const ESIM_OFFERS = [
  { flag: '🇹🇭', country: 'Thailand',  price: 'From €4.50 / 1GB' },
  { flag: '🇮🇩', country: 'Indonesia', price: 'From €3.50 / 1GB' },
  { flag: '🇻🇳', country: 'Vietnam',   price: 'From €3.00 / 1GB' },
  { flag: '🇪🇸', country: 'Spain',     price: 'From €2.50 / 1GB' },
  { flag: '🇯🇵', country: 'Japan',     price: 'From €5.00 / 1GB' },
]

export default function DocsPage() {
  const { activeTrip, activeTripDocuments, addDocument, trackEvent } = useTripStore()
  const [addOpen, setAddOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [docType, setDocType] = useState<TripDocument['type']>('flight')
  const [fileName, setFileName] = useState('')
  const [fileBase64, setFileBase64] = useState<string | null>(null)
  const [fileMime, setFileMime] = useState<string>('')
  const [parsing, setParsing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const trip = activeTrip()
  const docs = activeTripDocuments()

  if (!trip) {
    return (
      <div style={{ minHeight: 'calc(100dvh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>No active trip. <a href="/home" style={{ color: '#000', fontWeight: 700 }}>Create one</a></p>
      </div>
    )
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setFileMime(file.type)
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1] ?? ''
      setFileBase64(base64)
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''))
    }
    reader.readAsDataURL(file)
  }

  async function handleAdd() {
    if (!title.trim()) return
    setParsing(true)
    let extractedData: Record<string, string> = {}
    let parsedAt: string | undefined
    try {
      const res = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), type: docType, fileBase64: fileBase64 ?? undefined, mimeType: fileMime || undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        extractedData = data.extractedData ?? {}
        parsedAt = new Date().toISOString()
      }
    } catch { /* continue without parsing */ }

    addDocument({
      id: Math.random().toString(36).slice(2, 10),
      tripId: trip!.id, type: docType, title: title.trim(),
      extractedData: Object.keys(extractedData).length > 0 ? extractedData : undefined,
      parsedAt, createdAt: new Date().toISOString(),
    })
    trackEvent('doc_uploaded', { type: docType })
    setTitle(''); setDocType('flight'); setFileName(''); setFileBase64(null); setFileMime('')
    setParsing(false); setAddOpen(false)
  }

  const grouped = DOC_TYPES.map(dt => ({
    ...dt,
    docs: docs.filter(d => d.type === dt.type),
  })).filter(g => g.docs.length > 0)

  // Determine eSIM offers based on trip stops
  const relevantEsim = ESIM_OFFERS.slice(0, 3)

  return (
    <div style={{ padding: '20px 24px 8px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5 }}>Documents</h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Everything in one place</p>
      </div>

      {/* AI card */}
      <div
        onClick={() => setAddOpen(true)}
        style={{ background: '#111', borderRadius: 20, padding: 18, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, cursor: 'pointer' }}
      >
        <span style={{ fontSize: 34 }}>🤖</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>AI Document Scan</div>
          <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>
            Upload a booking confirmation — AI fills everything in automatically
          </div>
        </div>
        <span style={{ fontSize: 22, color: '#fff', fontWeight: 300 }}>→</span>
      </div>

      {/* Doc groups */}
      {grouped.length === 0 ? (
        <div style={{ background: 'var(--card)', borderRadius: 20, padding: 24, textAlign: 'center', marginBottom: 24 }}>
          <p style={{ fontSize: 14, color: 'var(--text3)' }}>No documents yet</p>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Add your first booking confirmation above</p>
        </div>
      ) : (
        grouped.map(group => (
          <div key={group.type} style={{ marginBottom: 16 }}>
            <div className="section-label">{group.label.toUpperCase()}</div>
            {group.docs.map(doc => (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 22, width: 30, textAlign: 'center' }}>{DOC_EMOJIS[doc.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {doc.title}
                  </div>
                  {doc.extractedData && Object.keys(doc.extractedData).length > 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                      {Object.values(doc.extractedData).slice(0, 2).join(' · ')}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      {new Date(doc.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {doc.parsedAt && <Sparkles size={13} color="#34C759" />}
                  <span style={{ padding: '4px 10px', borderRadius: 999, background: '#E8F9ED', color: '#34C759', fontSize: 11, fontWeight: 700 }}>
                    Saved
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ))
      )}

      {/* Insurance CTA */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-label">INSURANCE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 22, width: 30, textAlign: 'center' }}>🛡️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Travel Insurance</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Not added yet</div>
          </div>
          <span style={{ padding: '4px 10px', borderRadius: 999, background: '#FFEBEA', color: '#FF3B30', fontSize: 11, fontWeight: 700 }}>Required</span>
        </div>
        <a href="https://safetywing.com" target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', padding: '10px 0', fontSize: 13, color: '#007AFF', textDecoration: 'none' }}>
          → Get SafetyWing — long-term travel
        </a>
      </div>

      {/* eSIM section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-label" style={{ margin: 0 }}>DATA — AIRALO eSIM</div>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>Buy before you land</span>
        </div>
        {relevantEsim.map(esim => (
          <a key={esim.country} href="https://www.airalo.com" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', borderRadius: 16, padding: '14px 16px', marginBottom: 8, textDecoration: 'none' }}>
            <span style={{ fontSize: 28 }}>{esim.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{esim.country}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{esim.price}</div>
            </div>
            <div style={{ padding: '6px 14px', borderRadius: 999, background: '#000', color: '#fff', fontSize: 12, fontWeight: 600 }}>
              Get eSIM
            </div>
          </a>
        ))}
      </div>

      <div style={{ height: 32 }} />

      {/* FAB */}
      <button onClick={() => setAddOpen(true)}
        style={{ position: 'fixed', bottom: 80, right: 24, width: 56, height: 56, borderRadius: '50%', background: '#000', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 30 }}>
        <Plus size={24} color="#fff" />
      </button>

      {/* Add doc sheet */}
      <AnimatePresence>
        {addOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => !parsing && setAddOpen(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 rounded-t-[24px] shadow-2xl px-6 pb-8 pt-4"
              style={{ background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--card-deep)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Add document</h3>
                <button onClick={() => !parsing && setAddOpen(false)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--card)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={15} color="var(--text2)" />
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {DOC_TYPES.map(dt => (
                  <button key={dt.type} onClick={() => setDocType(dt.type)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      background: docType === dt.type ? '#000' : 'var(--card)', color: docType === dt.type ? '#fff' : 'var(--text2)',
                    }}>
                    {dt.emoji} {dt.label}
                  </button>
                ))}
              </div>

              <input type="text" placeholder="Document title (e.g. KLM BKK-DPS)" value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !parsing && handleAdd()}
                className="input" style={{ marginBottom: 12 }} autoFocus />

              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={handleFileChange} />
              <button onClick={() => fileRef.current?.click()}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px', borderRadius: 14, border: `2px dashed ${fileName ? '#34C759' : 'var(--border)'}`,
                  background: fileName ? '#E8F9ED' : 'none', color: fileName ? '#34C759' : 'var(--text3)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 12,
                }}>
                <Upload size={14} />
                {fileName || 'Attach file (optional) — AI will extract info'}
              </button>

              <button onClick={handleAdd} disabled={!title.trim() || parsing} className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 18, opacity: (!title.trim() || parsing) ? 0.4 : 1 }}>
                {parsing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Loader2 size={15} className="animate-spin" /> Parsing with AI…</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={15} /> Save &amp; parse</span>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
