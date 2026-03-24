import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { region, budget, durationWeeks, travelerType, vibe } = await req.json()

  if (!region || !budget || !durationWeeks) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // Return mock data for dev without API key
    return NextResponse.json({ stops: MOCK_ROUTES[region as keyof typeof MOCK_ROUTES] ?? MOCK_ROUTES.SEA })
  }

  const perDay = Math.round(budget / (durationWeeks * 7))

  const prompt = `You are a solo travel route expert. Generate an optimized travel route.

Input:
- Region: ${region}
- Total budget: €${budget}
- Duration: ${durationWeeks} weeks (${durationWeeks * 7} days)
- Daily budget: ~€${perDay}/day
- Traveler type: ${travelerType} (backpacker = cheapest, flashpacker = budget but wants comfort)
- Vibe preference: ${vibe || 'mix of culture, beach, and local experiences'}

Return ONLY a valid JSON array of stops. No explanation, no markdown, just raw JSON.

Format:
[
  {
    "city": "City Name",
    "country": "Country Name",
    "countryCode": "XX",
    "days": 5,
    "budgetPerDay": 30,
    "character": "beach",
    "note": "Why this stop is great"
  }
]

Rules:
- 4-8 stops total
- Days per stop: 2-10 (total days must equal ${durationWeeks * 7})
- budgetPerDay must be realistic for the traveler type
- character must be one of: beach | culture | city | nature | party | chill | mountains | food
- Include logical travel order (minimize backtracking)
- Prioritize lesser-known gems over tourist traps when budget allows`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array in response')

    const stops = JSON.parse(jsonMatch[0])
    return NextResponse.json({ stops })
  } catch (err) {
    console.error('[route-suggest]', err)
    return NextResponse.json({ error: 'Route generation failed' }, { status: 500 })
  }
}

const MOCK_ROUTES = {
  SEA: [
    { city: 'Bangkok',     country: 'Thailand',  countryCode: 'TH', days: 4, budgetPerDay: 28, character: 'city',    note: 'Gateway to SEA — street food heaven' },
    { city: 'Chiang Mai',  country: 'Thailand',  countryCode: 'TH', days: 5, budgetPerDay: 22, character: 'culture', note: 'Night markets, temples, cooking classes' },
    { city: 'Luang Prabang',country:'Laos',      countryCode: 'LA', days: 4, budgetPerDay: 24, character: 'chill',   note: 'Monks at sunrise, waterfalls, the vibe' },
    { city: 'Hanoi',       country: 'Vietnam',   countryCode: 'VN', days: 3, budgetPerDay: 20, character: 'food',    note: 'Pho, egg coffee, old quarter chaos' },
    { city: 'Hoi An',      country: 'Vietnam',   countryCode: 'VN', days: 5, budgetPerDay: 24, character: 'culture', note: 'Lanterns, tailors, beach 10min away' },
    { city: 'Bali',        country: 'Indonesia', countryCode: 'ID', days: 7, budgetPerDay: 30, character: 'chill',   note: 'Rice terraces, surf, spiritual vibes' },
  ],
  EUROPE: [
    { city: 'Lisbon',      country: 'Portugal',  countryCode: 'PT', days: 4, budgetPerDay: 50, character: 'city',    note: 'Most affordable Western European capital' },
    { city: 'Porto',       country: 'Portugal',  countryCode: 'PT', days: 3, budgetPerDay: 45, character: 'chill',   note: 'Wine caves, bridges, pastéis de nata' },
    { city: 'Madrid',      country: 'Spain',     countryCode: 'ES', days: 3, budgetPerDay: 55, character: 'culture', note: 'Prado, tapas, late-night energy' },
    { city: 'Barcelona',   country: 'Spain',     countryCode: 'ES', days: 4, budgetPerDay: 62, character: 'beach',   note: 'Gaudí + beach + world-class food scene' },
    { city: 'Budapest',    country: 'Hungary',   countryCode: 'HU', days: 3, budgetPerDay: 42, character: 'party',   note: 'Ruin bars, thermal baths, Central European gem' },
    { city: 'Prague',      country: 'Czech Republic', countryCode: 'CZ', days: 3, budgetPerDay: 45, character: 'city', note: 'Fairy-tale old town, cheap beer, walkable' },
  ],
  LATAM: [
    { city: 'Medellín',    country: 'Colombia',  countryCode: 'CO', days: 5, budgetPerDay: 32, character: 'city',    note: 'Eternal spring, digital nomad scene, transformation story' },
    { city: 'Cartagena',   country: 'Colombia',  countryCode: 'CO', days: 3, budgetPerDay: 38, character: 'beach',   note: 'Colonial walls, Caribbean islands nearby' },
    { city: 'Lima',        country: 'Peru',      countryCode: 'PE', days: 3, budgetPerDay: 35, character: 'food',    note: 'World\'s best restaurant scene, ceviche capital' },
    { city: 'Cusco',       country: 'Peru',      countryCode: 'PE', days: 5, budgetPerDay: 30, character: 'mountains', note: 'Machu Picchu base, Inca culture, acclimatize first' },
  ],
  SOUTH_ASIA: [
    { city: 'Kathmandu',   country: 'Nepal',     countryCode: 'NP', days: 4, budgetPerDay: 22, character: 'culture', note: 'Temple overload, trekking gateway, chaotic charm' },
    { city: 'Goa',         country: 'India',     countryCode: 'IN', days: 6, budgetPerDay: 25, character: 'beach',   note: 'Portuguese vibes, beach shacks, yoga retreats' },
    { city: 'Mumbai',      country: 'India',     countryCode: 'IN', days: 3, budgetPerDay: 28, character: 'city',    note: 'Maximum city, Bollywood, street food of the gods' },
  ],
  EAST_ASIA: [
    { city: 'Tokyo',       country: 'Japan',     countryCode: 'JP', days: 5, budgetPerDay: 65, character: 'city',    note: 'Future + tradition in one city, convini heaven' },
    { city: 'Kyoto',       country: 'Japan',     countryCode: 'JP', days: 4, budgetPerDay: 60, character: 'culture', note: 'Geisha districts, bamboo forests, temple walks' },
    { city: 'Osaka',       country: 'Japan',     countryCode: 'JP', days: 3, budgetPerDay: 58, character: 'food',    note: 'Eating city, Dotonbori neon, takoyaki every 10m' },
    { city: 'Seoul',       country: 'South Korea', countryCode: 'KR', days: 4, budgetPerDay: 55, character: 'city', note: 'K-culture, fried chicken + beer, Han River sunsets' },
  ],
}
