import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Keyword-based fallback for basic detection
function quickParse(title: string, type: string): { extractedData: Record<string, string>; summary: string } {
  if (type === 'flight') {
    const flightNum = title.match(/[A-Z]{2}\d{3,4}/)?.[0] ?? ''
    return {
      extractedData: { flightNumber: flightNum, status: 'booked' },
      summary: flightNum ? `Flight ${flightNum} detected` : 'Flight booking saved',
    }
  }
  if (type === 'hotel') {
    return {
      extractedData: { status: 'booked' },
      summary: 'Hotel booking saved',
    }
  }
  if (type === 'insurance') {
    return {
      extractedData: { status: 'active' },
      summary: 'Insurance document saved',
    }
  }
  return {
    extractedData: {},
    summary: `${type.charAt(0).toUpperCase() + type.slice(1)} document saved`,
  }
}

export async function POST(req: NextRequest) {
  const { title, type, fileBase64, mimeType } = await req.json()

  if (!title && !fileBase64) {
    return NextResponse.json({ error: 'No content provided' }, { status: 400 })
  }

  // No API key — use keyword fallback
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(quickParse(title ?? '', type ?? 'other'))
  }

  try {
    const content: Anthropic.MessageParam['content'] = []

    // If image/PDF was provided, add it
    if (fileBase64 && mimeType) {
      if (mimeType.startsWith('image/')) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: fileBase64,
          },
        })
      }
    }

    content.push({
      type: 'text',
      text: `Extract travel booking info from this ${type} document. Title: "${title}".
${fileBase64 ? 'The document image is attached.' : ''}

Return ONLY valid JSON with these fields (include only what you can extract):
{
  "summary": "one-line human summary of what this document is",
  "extractedData": {
    "flightNumber": "e.g. KL811",
    "airline": "e.g. KLM",
    "departureCity": "e.g. Amsterdam",
    "arrivalCity": "e.g. Bangkok",
    "departureDate": "ISO date string",
    "confirmationCode": "e.g. ABC123",
    "hotelName": "e.g. Khaosan Palace",
    "checkIn": "ISO date string",
    "checkOut": "ISO date string",
    "totalPrice": "e.g. 89.00",
    "currency": "e.g. EUR"
  }
}

Only include fields that are clearly present. Return minimal JSON if little info available.`,
    })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content }],
    })

    const txt = message.content[0].type === 'text' ? message.content[0].text : ''
    const json = JSON.parse(txt.match(/\{[\s\S]*\}/)?.[0] ?? '{}')

    return NextResponse.json({
      summary: json.summary ?? quickParse(title ?? '', type ?? 'other').summary,
      extractedData: json.extractedData ?? {},
    })
  } catch {
    return NextResponse.json(quickParse(title ?? '', type ?? 'other'))
  }
}
