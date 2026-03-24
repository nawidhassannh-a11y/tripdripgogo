import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface RescueRequest {
  totalBudget: number
  spent: number
  daysRemaining: number
  topCategories: { category: string; total: number }[]
  currentCity: string
  travelerType: string
}

export async function POST(req: NextRequest) {
  const body: RescueRequest = await req.json()
  const { totalBudget, spent, daysRemaining, topCategories, currentCity, travelerType } = body

  const remaining = totalBudget - spent
  const dailyLeft = daysRemaining > 0 ? remaining / daysRemaining : 0

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      tips: [
        `You have €${remaining.toFixed(0)} left for ${daysRemaining} days — that's €${dailyLeft.toFixed(0)}/day.`,
        topCategories[0] ? `Your biggest spend is ${topCategories[0].category} at €${topCategories[0].total.toFixed(0)}. Try cooking one meal a day to cut costs.` : 'Track every expense to spot savings.',
        `In ${currentCity}, look for local markets and hostels. Avoid tourist restaurants near attractions.`,
      ],
    })
  }

  const prompt = `You are a solo travel budget advisor. Give 3 specific, actionable tips.

Traveler: ${travelerType} in ${currentCity}
Budget: €${totalBudget} total, €${spent.toFixed(0)} spent, €${remaining.toFixed(0)} left
${daysRemaining} days remaining = €${dailyLeft.toFixed(0)}/day budget
Top spending: ${topCategories.map(c => `${c.category} €${c.total.toFixed(0)}`).join(', ')}

Return ONLY a JSON array of 3 tip strings, each max 100 chars, practical and city-specific. No markdown.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const txt = message.content[0].type === 'text' ? message.content[0].text : ''
    const tips = JSON.parse(txt.match(/\[[\s\S]*\]/)?.[0] ?? '[]')
    return NextResponse.json({ tips: Array.isArray(tips) ? tips.slice(0, 3) : [] })
  } catch {
    return NextResponse.json({
      tips: [
        `€${dailyLeft.toFixed(0)}/day remaining for ${daysRemaining} days. Track every expense.`,
        `Cut ${topCategories[0]?.category ?? 'spending'} to save the most — it is your top category.`,
        `Look for local guesthouses and street food in ${currentCity} to stretch your budget.`,
      ],
    })
  }
}
