import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CATEGORIES = ['food', 'transport', 'stay', 'activities', 'drinks', 'shopping', 'health', 'loan', 'other']

// Keyword-based fallback (no API key needed)
function quickCategorize(text: string): string {
  const t = text.toLowerCase()
  if (/pad thai|noodle|rice|burger|pizza|chicken|beef|pork|fish|salad|breakfast|lunch|dinner|meal|eat|food|restaurant|cafe|coffee|street food|market/.test(t)) return 'food'
  if (/taxi|uber|grab|bus|train|ferry|boat|tuk|motorbike|scooter|flight|ticket|transport|ride|metro|subway/.test(t)) return 'transport'
  if (/hostel|hotel|airbnb|guesthouse|bungalow|room|bed|accommodation|stay|night/.test(t)) return 'stay'
  if (/tour|temple|museum|park|activity|ticket|entrance|visit|snorkel|dive|surf|trek|hike|zip/.test(t)) return 'activities'
  if (/beer|wine|cocktail|drink|bar|club|gin|vodka|rum|whiskey|alcohol|shots/.test(t)) return 'drinks'
  if (/shirt|pants|dress|shoes|bag|market|souvenir|shop|buy|clothes|cloth/.test(t)) return 'shopping'
  if (/doctor|pharmacy|medicine|hospital|clinic|pill|sick|health|mosquito|sunscreen/.test(t)) return 'health'
  if (/borrow|lend|loan|owe|pay back|return/.test(t)) return 'loan'
  return 'other'
}

function extractAmount(text: string): { amount: number | null; currency: string } {
  const CURRENCY_WORDS: Record<string, string> = {
    baht: 'THB', bath: 'THB', thb: 'THB',
    dong: 'VND', vnd: 'VND',
    rupiah: 'IDR', rp: 'IDR',
    ringgit: 'MYR', myr: 'MYR',
    peso: 'PHP', php: 'PHP',
    euro: 'EUR', eur: 'EUR',
    dollar: 'USD', usd: 'USD',
    pound: 'GBP', gbp: 'GBP',
    yen: 'JPY', jpy: 'JPY',
    won: 'KRW', krw: 'KRW',
    rupee: 'INR', inr: 'INR',
    kip: 'LAK', lak: 'LAK',
    riel: 'KHR', khr: 'KHR',
  }
  const lower = text.toLowerCase()
  let currency = 'EUR'
  for (const [word, code] of Object.entries(CURRENCY_WORDS)) {
    if (lower.includes(word)) { currency = code; break }
  }
  const num = text.match(/[\d,]+\.?\d*/)
  const amount = num ? parseFloat(num[0].replace(',', '')) : null
  return { amount, currency }
}

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

  // If no API key, use keyword fallback
  if (!process.env.ANTHROPIC_API_KEY) {
    const { amount, currency } = extractAmount(text)
    const category = quickCategorize(text)
    const label = text.slice(0, 40).trim()
    return NextResponse.json({ category, label, amount, currency })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Extract expense info from this text and return ONLY valid JSON, nothing else:
"${text}"

JSON schema: { "category": one of [${CATEGORIES.join(',')}], "label": short clean label max 30 chars, "amount": number or null, "currency": 3-letter code }

Examples:
"pad thai 80 baht" → {"category":"food","label":"Pad Thai","amount":80,"currency":"THB"}
"hostel per night 15 euro" → {"category":"stay","label":"Hostel","amount":15,"currency":"EUR"}
"grab taxi airport" → {"category":"transport","label":"Grab Taxi","amount":null,"currency":"THB"}`
      }],
    })

    const txt = message.content[0].type === 'text' ? message.content[0].text : ''
    const json = JSON.parse(txt.match(/\{[\s\S]*\}/)?.[0] ?? '{}')
    return NextResponse.json({
      category: CATEGORIES.includes(json.category) ? json.category : quickCategorize(text),
      label: json.label ?? text.slice(0, 30),
      amount: json.amount ?? null,
      currency: json.currency ?? 'EUR',
    })
  } catch {
    const { amount, currency } = extractAmount(text)
    return NextResponse.json({ category: quickCategorize(text), label: text.slice(0, 30), amount, currency })
  }
}
