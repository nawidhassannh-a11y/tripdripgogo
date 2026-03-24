// Popular destinations per region with realistic budget benchmarks (€/day incl. accommodation)

export interface Destination {
  city: string
  country: string
  countryCode: string
  region: string
  budgetPerDay: { backpacker: number; budget: number; comfort: number; flashpacker: number }
  character: string[]  // chill | party | culture | nature | city | beach | mountains
  emoji: string
}

export const DESTINATIONS: Destination[] = [
  // ── Southeast Asia ──────────────────────────────────────────────────────────
  { city: 'Bangkok',       country: 'Thailand',     countryCode: 'TH', region: 'SEA', budgetPerDay: { backpacker: 25, budget: 38, comfort: 60, flashpacker: 85 },  character: ['city', 'culture', 'food'],    emoji: '🏙️' },
  { city: 'Chiang Mai',    country: 'Thailand',     countryCode: 'TH', region: 'SEA', budgetPerDay: { backpacker: 20, budget: 30, comfort: 50, flashpacker: 70 },  character: ['culture', 'nature', 'chill'], emoji: '🌿' },
  { city: 'Phuket',        country: 'Thailand',     countryCode: 'TH', region: 'SEA', budgetPerDay: { backpacker: 30, budget: 45, comfort: 80, flashpacker: 120 }, character: ['beach', 'party', 'chill'],   emoji: '🏖️' },
  { city: 'Koh Phangan',   country: 'Thailand',     countryCode: 'TH', region: 'SEA', budgetPerDay: { backpacker: 25, budget: 38, comfort: 65, flashpacker: 95 },  character: ['beach', 'party', 'chill'],   emoji: '🌴' },
  { city: 'Hanoi',         country: 'Vietnam',      countryCode: 'VN', region: 'SEA', budgetPerDay: { backpacker: 18, budget: 28, comfort: 45, flashpacker: 65 },  character: ['culture', 'city', 'food'],   emoji: '🏛️' },
  { city: 'Ho Chi Minh',   country: 'Vietnam',      countryCode: 'VN', region: 'SEA', budgetPerDay: { backpacker: 20, budget: 30, comfort: 50, flashpacker: 75 },  character: ['city', 'food', 'culture'],   emoji: '🌆' },
  { city: 'Hoi An',        country: 'Vietnam',      countryCode: 'VN', region: 'SEA', budgetPerDay: { backpacker: 22, budget: 32, comfort: 52, flashpacker: 72 },  character: ['culture', 'chill', 'beach'], emoji: '🏮' },
  { city: 'Da Nang',       country: 'Vietnam',      countryCode: 'VN', region: 'SEA', budgetPerDay: { backpacker: 20, budget: 30, comfort: 50, flashpacker: 70 },  character: ['beach', 'city', 'culture'],  emoji: '🌊' },
  { city: 'Siem Reap',     country: 'Cambodia',     countryCode: 'KH', region: 'SEA', budgetPerDay: { backpacker: 20, budget: 30, comfort: 48, flashpacker: 70 },  character: ['culture', 'nature'],          emoji: '🏯' },
  { city: 'Phnom Penh',    country: 'Cambodia',     countryCode: 'KH', region: 'SEA', budgetPerDay: { backpacker: 18, budget: 28, comfort: 45, flashpacker: 65 },  character: ['culture', 'city'],            emoji: '🌁' },
  { city: 'Bali',          country: 'Indonesia',    countryCode: 'ID', region: 'SEA', budgetPerDay: { backpacker: 28, budget: 42, comfort: 70, flashpacker: 110 }, character: ['beach', 'culture', 'chill'], emoji: '🌺' },
  { city: 'Lombok',        country: 'Indonesia',    countryCode: 'ID', region: 'SEA', budgetPerDay: { backpacker: 22, budget: 33, comfort: 55, flashpacker: 80 },  character: ['beach', 'nature', 'chill'],  emoji: '🏄' },
  { city: 'Yogyakarta',    country: 'Indonesia',    countryCode: 'ID', region: 'SEA', budgetPerDay: { backpacker: 18, budget: 27, comfort: 45, flashpacker: 65 },  character: ['culture', 'nature'],          emoji: '🏔️' },
  { city: 'Kuala Lumpur',  country: 'Malaysia',     countryCode: 'MY', region: 'SEA', budgetPerDay: { backpacker: 28, budget: 40, comfort: 65, flashpacker: 95 },  character: ['city', 'food', 'culture'],   emoji: '🌃' },
  { city: 'Penang',        country: 'Malaysia',     countryCode: 'MY', region: 'SEA', budgetPerDay: { backpacker: 22, budget: 33, comfort: 55, flashpacker: 75 },  character: ['food', 'culture', 'city'],   emoji: '🍜' },
  { city: 'Singapore',     country: 'Singapore',    countryCode: 'SG', region: 'SEA', budgetPerDay: { backpacker: 55, budget: 80, comfort: 130, flashpacker: 200 },character: ['city', 'food', 'culture'],   emoji: '🦁' },
  { city: 'Manila',        country: 'Philippines',  countryCode: 'PH', region: 'SEA', budgetPerDay: { backpacker: 22, budget: 33, comfort: 55, flashpacker: 80 },  character: ['city', 'culture'],            emoji: '🌴' },
  { city: 'Vang Vieng',    country: 'Laos',         countryCode: 'LA', region: 'SEA', budgetPerDay: { backpacker: 18, budget: 28, comfort: 45, flashpacker: 65 },  character: ['party', 'nature', 'chill'],  emoji: '🛶' },
  { city: 'Luang Prabang', country: 'Laos',         countryCode: 'LA', region: 'SEA', budgetPerDay: { backpacker: 22, budget: 32, comfort: 52, flashpacker: 75 },  character: ['culture', 'chill', 'nature'],emoji: '🕌' },

  // ── Europe ───────────────────────────────────────────────────────────────────
  { city: 'Lisbon',        country: 'Portugal',     countryCode: 'PT', region: 'EUROPE', budgetPerDay: { backpacker: 45, budget: 65, comfort: 100, flashpacker: 150 }, character: ['city', 'culture', 'beach'],  emoji: '🏰' },
  { city: 'Porto',         country: 'Portugal',     countryCode: 'PT', region: 'EUROPE', budgetPerDay: { backpacker: 40, budget: 58, comfort: 90, flashpacker: 130 },  character: ['city', 'culture', 'chill'],  emoji: '🍷' },
  { city: 'Barcelona',     country: 'Spain',        countryCode: 'ES', region: 'EUROPE', budgetPerDay: { backpacker: 55, budget: 80, comfort: 130, flashpacker: 200 }, character: ['city', 'beach', 'party'],    emoji: '🎨' },
  { city: 'Madrid',        country: 'Spain',        countryCode: 'ES', region: 'EUROPE', budgetPerDay: { backpacker: 50, budget: 75, comfort: 120, flashpacker: 180 }, character: ['city', 'culture', 'food'],   emoji: '💃' },
  { city: 'Amsterdam',     country: 'Netherlands',  countryCode: 'NL', region: 'EUROPE', budgetPerDay: { backpacker: 70, budget: 100, comfort: 160, flashpacker: 240 },character: ['city', 'culture', 'party'],  emoji: '🚲' },
  { city: 'Berlin',        country: 'Germany',      countryCode: 'DE', region: 'EUROPE', budgetPerDay: { backpacker: 55, budget: 80, comfort: 130, flashpacker: 190 }, character: ['city', 'party', 'culture'],  emoji: '🎵' },
  { city: 'Prague',        country: 'Czech Republic',countryCode:'CZ', region: 'EUROPE', budgetPerDay: { backpacker: 40, budget: 58, comfort: 95, flashpacker: 140 },  character: ['city', 'culture', 'party'],  emoji: '🏯' },
  { city: 'Budapest',      country: 'Hungary',      countryCode: 'HU', region: 'EUROPE', budgetPerDay: { backpacker: 38, budget: 55, comfort: 90, flashpacker: 135 },  character: ['city', 'culture', 'chill'],  emoji: '♨️' },
  { city: 'Kraków',        country: 'Poland',       countryCode: 'PL', region: 'EUROPE', budgetPerDay: { backpacker: 35, budget: 50, comfort: 80, flashpacker: 120 },  character: ['city', 'culture'],            emoji: '🏰' },
  { city: 'Athens',        country: 'Greece',       countryCode: 'GR', region: 'EUROPE', budgetPerDay: { backpacker: 45, budget: 65, comfort: 105, flashpacker: 155 }, character: ['city', 'culture', 'beach'],  emoji: '🏛️' },
  { city: 'Tbilisi',       country: 'Georgia',      countryCode: 'GE', region: 'EUROPE', budgetPerDay: { backpacker: 28, budget: 42, comfort: 70, flashpacker: 105 },  character: ['city', 'culture', 'food'],   emoji: '🍷' },

  // ── Latin America ─────────────────────────────────────────────────────────────
  { city: 'Medellín',      country: 'Colombia',     countryCode: 'CO', region: 'LATAM', budgetPerDay: { backpacker: 28, budget: 42, comfort: 70, flashpacker: 105 },  character: ['city', 'culture', 'party'],  emoji: '🌸' },
  { city: 'Cartagena',     country: 'Colombia',     countryCode: 'CO', region: 'LATAM', budgetPerDay: { backpacker: 32, budget: 48, comfort: 78, flashpacker: 115 },  character: ['beach', 'culture', 'city'],  emoji: '🏖️' },
  { city: 'Mexico City',   country: 'Mexico',       countryCode: 'MX', region: 'LATAM', budgetPerDay: { backpacker: 30, budget: 45, comfort: 75, flashpacker: 110 },  character: ['city', 'culture', 'food'],   emoji: '🌮' },
  { city: 'Buenos Aires',  country: 'Argentina',    countryCode: 'AR', region: 'LATAM', budgetPerDay: { backpacker: 25, budget: 38, comfort: 65, flashpacker: 98 },   character: ['city', 'culture', 'food'],   emoji: '🥩' },
  { city: 'Lima',          country: 'Peru',         countryCode: 'PE', region: 'LATAM', budgetPerDay: { backpacker: 28, budget: 42, comfort: 70, flashpacker: 105 },  character: ['city', 'food', 'culture'],   emoji: '🍽️' },
  { city: 'Cusco',         country: 'Peru',         countryCode: 'PE', region: 'LATAM', budgetPerDay: { backpacker: 25, budget: 38, comfort: 62, flashpacker: 92 },   character: ['culture', 'mountains', 'nature'], emoji: '🏔️' },

  // ── South Asia ─────────────────────────────────────────────────────────────────
  { city: 'Kathmandu',     country: 'Nepal',        countryCode: 'NP', region: 'SOUTH_ASIA', budgetPerDay: { backpacker: 18, budget: 28, comfort: 48, flashpacker: 72 },  character: ['culture', 'mountains', 'nature'], emoji: '🏔️' },
  { city: 'Goa',           country: 'India',        countryCode: 'IN', region: 'SOUTH_ASIA', budgetPerDay: { backpacker: 20, budget: 30, comfort: 50, flashpacker: 75 },  character: ['beach', 'party', 'chill'],        emoji: '🏖️' },
  { city: 'Mumbai',        country: 'India',        countryCode: 'IN', region: 'SOUTH_ASIA', budgetPerDay: { backpacker: 22, budget: 33, comfort: 55, flashpacker: 82 },  character: ['city', 'culture', 'food'],        emoji: '🌆' },
  { city: 'Colombo',       country: 'Sri Lanka',    countryCode: 'LK', region: 'SOUTH_ASIA', budgetPerDay: { backpacker: 22, budget: 33, comfort: 55, flashpacker: 80 },  character: ['city', 'culture'],                emoji: '🦁' },

  // ── East Asia ──────────────────────────────────────────────────────────────────
  { city: 'Tokyo',         country: 'Japan',        countryCode: 'JP', region: 'EAST_ASIA', budgetPerDay: { backpacker: 55, budget: 80, comfort: 130, flashpacker: 200 }, character: ['city', 'culture', 'food'],   emoji: '🗼' },
  { city: 'Osaka',         country: 'Japan',        countryCode: 'JP', region: 'EAST_ASIA', budgetPerDay: { backpacker: 48, budget: 70, comfort: 115, flashpacker: 170 }, character: ['city', 'food', 'culture'],   emoji: '🦌' },
  { city: 'Kyoto',         country: 'Japan',        countryCode: 'JP', region: 'EAST_ASIA', budgetPerDay: { backpacker: 50, budget: 72, comfort: 118, flashpacker: 175 }, character: ['culture', 'nature', 'city'], emoji: '⛩️' },
  { city: 'Seoul',         country: 'South Korea',  countryCode: 'KR', region: 'EAST_ASIA', budgetPerDay: { backpacker: 45, budget: 65, comfort: 108, flashpacker: 160 }, character: ['city', 'food', 'culture'],   emoji: '🏙️' },
  { city: 'Taipei',        country: 'Taiwan',       countryCode: 'TW', region: 'EAST_ASIA', budgetPerDay: { backpacker: 40, budget: 58, comfort: 95, flashpacker: 142 },  character: ['city', 'food', 'culture'],   emoji: '🧋' },
]

export function getDestinationsByRegion(region: string): Destination[] {
  return DESTINATIONS.filter(d => d.region === region)
}

export function getBudgetForDestination(
  dest: Destination,
  travelerType: 'backpacker' | 'budget' | 'comfort' | 'flashpacker'
): number {
  return dest.budgetPerDay[travelerType]
}
