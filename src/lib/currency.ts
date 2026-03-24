// Static FX rates — EUR as base (update periodically or swap for live API)
const EUR_RATES: Record<string, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.86,
  THB: 38.5,
  VND: 26800,
  IDR: 17200,
  MYR: 5.0,
  SGD: 1.45,
  PHP: 61.5,
  KHR: 4400,
  LAK: 22500,
  MMK: 2270,
  LKR: 325,
  NPR: 144,
  INR: 90,
  JPY: 163,
  KRW: 1445,
  TWD: 34.5,
  HKD: 8.4,
  CNY: 7.8,
  AUD: 1.66,
  NZD: 1.80,
  CAD: 1.48,
  CHF: 0.96,
  SEK: 11.3,
  NOK: 11.5,
  DKK: 7.46,
  PLN: 4.28,
  CZK: 25.2,
  HUF: 390,
  RON: 5.0,
  BGN: 1.96,
  HRK: 7.5,
  GEL: 2.9,
  TRY: 35,
  AED: 3.97,
  SAR: 4.05,
  MXN: 18.5,
  COP: 4300,
  PEN: 4.1,
  ARS: 960,
  BRL: 5.4,
  CLP: 990,
  MAD: 10.8,
  ZAR: 20.2,
  KES: 140,
  TZS: 2750,
  EGP: 33,
}

export function toEur(amount: number, currency: string): number {
  const rate = EUR_RATES[currency.toUpperCase()] ?? 1
  return Math.round((amount / rate) * 100) / 100
}

export function fromEur(amount: number, currency: string): number {
  const rate = EUR_RATES[currency.toUpperCase()] ?? 1
  return Math.round(amount * rate * 100) / 100
}

export function getSupportedCurrencies(): string[] {
  return Object.keys(EUR_RATES)
}

// Parse "80 baht" → { amount: 80, currency: "THB" }
export function parseCurrencyHint(input: string): { amount: number; currency: string } | null {
  const CURRENCY_ALIASES: Record<string, string> = {
    baht: 'THB', bath: 'THB', thb: 'THB',
    dong: 'VND', vnd: 'VND',
    rupiah: 'IDR', rp: 'IDR', idr: 'IDR',
    ringgit: 'MYR', myr: 'MYR',
    peso: 'PHP', php: 'PHP',
    riel: 'KHR', khr: 'KHR',
    kip: 'LAK', lak: 'LAK',
    rupee: 'INR', rs: 'INR', inr: 'INR',
    yen: 'JPY', jpy: 'JPY',
    won: 'KRW', krw: 'KRW',
    euro: 'EUR', eur: 'EUR',
    dollar: 'USD', usd: 'USD',
    pound: 'GBP', gbp: 'GBP',
    sgd: 'SGD', 's$': 'SGD',
    aud: 'AUD', 'a$': 'AUD',
    lira: 'TRY', try: 'TRY',
  }

  const lower = input.toLowerCase()
  for (const [alias, code] of Object.entries(CURRENCY_ALIASES)) {
    const numMatch = lower.replace(alias, '').match(/[\d,]+\.?\d*/)
    if (lower.includes(alias) && numMatch) {
      return { amount: parseFloat(numMatch[0].replace(',', '')), currency: code }
    }
  }
  return null
}
