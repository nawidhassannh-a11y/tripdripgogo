'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Plane, Hotel, Shield, Activity, Plus, Sparkles, Loader2 } from 'lucide-react'
import { useTripStore } from '@/store/tripStore'
import { cn } from '@/lib/utils'
import type { TripDocument } from '@/types'

const DOC_TYPES: { type: TripDocument['type']; label: string; icon: React.ElementType; color: string }[] = [
  { type: 'flight',     label: 'Flight',     icon: Plane,      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950' },
  { type: 'hotel',      label: 'Hotel',      icon: Hotel,      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950' },
  { type: 'insurance',  label: 'Insurance',  icon: Shield,     color: 'text-green-500 bg-green-50 dark:bg-green-950' },
  { type: 'activity',   label: 'Activity',   icon: Activity,   color: 'text-pink-500 bg-pink-50 dark:bg-pink-950' },
  { type: 'other',      label: 'Other',      icon: FileText,   color: 'text-gray-500 bg-gray-100 dark:bg-slate-800' },
]

function DocIcon({ type }: { type: TripDocument['type'] }) {
  const meta = DOC_TYPES.find(d => d.type === type) ?? DOC_TYPES[DOC_TYPES.length - 1]
  const Icon = meta.icon
  return (
    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', meta.color)}>
      <Icon size={18} />
    </div>
  )
}

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
      <div className="min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl mb-3">📄</div>
        <p className="text-gray-500 text-sm">No active trip. <a href="/create-trip" className="text-primary-600 underline">Create one</a></p>
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
      // Strip data URL prefix to get pure base64
      const base64 = result.split(',')[1] ?? ''
      setFileBase64(base64)
      // Auto-fill title from filename if empty
      if (!title) {
        setTitle(file.name.replace(/\.[^.]+$/, ''))
      }
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
        body: JSON.stringify({
          title: title.trim(),
          type: docType,
          fileBase64: fileBase64 ?? undefined,
          mimeType: fileMime || undefined,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        extractedData = data.extractedData ?? {}
        parsedAt = new Date().toISOString()
      }
    } catch {
      // Continue without parsing
    }

    addDocument({
      id: Math.random().toString(36).slice(2, 10),
      tripId: trip!.id,
      type: docType,
      title: title.trim(),
      extractedData: Object.keys(extractedData).length > 0 ? extractedData : undefined,
      parsedAt,
      createdAt: new Date().toISOString(),
    })
    trackEvent('doc_uploaded', { type: docType })

    setTitle('')
    setDocType('flight')
    setFileName('')
    setFileBase64(null)
    setFileMime('')
    setParsing(false)
    setAddOpen(false)
  }

  const grouped = DOC_TYPES.map(dt => ({
    ...dt,
    docs: docs.filter(d => d.type === dt.type),
  })).filter(g => g.docs.length > 0)

  return (
    <div className="px-4 pt-5 pb-2 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-medium">Documents</p>
          <h1 className="font-bold text-xl text-gray-900 dark:text-white">{trip.emoji} {trip.name}</h1>
        </div>
        <button onClick={() => setAddOpen(true)}
          className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center shadow-sm active:scale-95 transition-transform">
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Upload hint */}
      <div
        onClick={() => setAddOpen(true)}
        className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-300 transition-colors"
      >
        <Upload size={24} className="text-gray-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-500">Add booking confirmation</p>
        <p className="text-xs text-gray-400 mt-0.5">AI extracts flight numbers, dates & more</p>
      </div>

      {/* Doc list */}
      {docs.length === 0 ? (
        <div className="card p-6 text-center">
          <FileText size={24} className="text-gray-200 dark:text-slate-700 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No documents yet</p>
          <p className="text-xs text-gray-300 dark:text-slate-600 mt-0.5">Add your first booking confirmation</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(group => (
            <div key={group.type}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <group.icon size={11} /> {group.label}
              </p>
              <div className="space-y-2">
                {group.docs.map(doc => (
                  <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="card p-3 flex items-start gap-3">
                    <DocIcon type={doc.type} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{doc.title}</p>
                      {doc.extractedData && Object.keys(doc.extractedData).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(doc.extractedData).slice(0, 3).map(([k, v]) => (
                            <span key={k} className="text-[10px] bg-primary-50 dark:bg-primary-950 text-primary-600 px-1.5 py-0.5 rounded-full">
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(doc.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    {doc.parsedAt && <Sparkles size={13} className="text-primary-400 shrink-0 mt-0.5" />}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add doc sheet */}
      <AnimatePresence>
        {addOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => !parsing && setAddOpen(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl px-5 pb-8 pt-4">
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 rounded-full bg-gray-200 dark:bg-slate-700" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Add document</h3>

              <div className="flex gap-1.5 flex-wrap mb-4">
                {DOC_TYPES.map(dt => (
                  <button key={dt.type} onClick={() => setDocType(dt.type)}
                    className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                      docType === dt.type ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-500')}>
                    <dt.icon size={11} /> {dt.label}
                  </button>
                ))}
              </div>

              <input type="text" placeholder="Document title (e.g. KLM BKK-DPS)" value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !parsing && handleAdd()}
                className="input text-sm mb-3" autoFocus />

              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                onChange={handleFileChange} />
              <button onClick={() => fileRef.current?.click()}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 border border-dashed rounded-xl text-xs transition-colors mb-3',
                  fileName
                    ? 'border-primary-300 text-primary-600 bg-primary-50 dark:bg-primary-950'
                    : 'border-gray-200 dark:border-slate-700 text-gray-400 hover:border-primary-300'
                )}>
                <Upload size={14} />
                {fileName || 'Attach file (optional) — AI will extract info'}
              </button>

              <button onClick={handleAdd} disabled={!title.trim() || parsing}
                className={cn('btn-primary w-full justify-center py-3.5', (!title.trim() || parsing) && 'opacity-60 cursor-not-allowed')}>
                {parsing ? (
                  <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Parsing with AI…</span>
                ) : (
                  <span className="flex items-center gap-2"><Sparkles size={15} /> Save &amp; parse</span>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
