// ─── Expense ─────────────────────────────────────────────────────────────────
export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'stay'
  | 'activities'
  | 'drinks'
  | 'shopping'
  | 'health'
  | 'loan'
  | 'other';

export interface Expense {
  id: string;
  raw: string;           // original user input e.g. "pad thai 80 baht"
  amount: number;
  currency: string;
  amountEur: number;
  category: ExpenseCategory;
  label: string;
  note?: string;
  date: string;          // ISO
  stopId: string;
}

// ─── Stop ─────────────────────────────────────────────────────────────────────
export interface Stop {
  id: string;
  city: string;
  country: string;
  countryCode: string;   // ISO-2 e.g. 'TH'
  days: number;
  budgetPerDay: number;  // EUR — location-aware (Vietnam ~28, Thailand ~42)
  neighborhood?: string;
  character?: string;
  arrivalDate?: string;  // ISO, optional
  isActive: boolean;
  isCompleted: boolean;
}

// ─── Flight ───────────────────────────────────────────────────────────────────
export interface Flight {
  id: string;
  fromStopId: string;
  toStopId: string;
  airline?: string;
  flightNumber?: string;
  status: 'booked' | 'to-book';
  price?: number;        // EUR
}

// ─── Trip ─────────────────────────────────────────────────────────────────────
export interface Trip {
  id: string;
  name: string;
  emoji: string;
  totalBudget: number;   // EUR
  startDate?: string;    // ISO
  endDate?: string;      // ISO
  createdAt: string;     // ISO
  stops: Stop[];
  flights: Flight[];
  region?: string;       // e.g. "Southeast Asia"
  durationWeeks?: number;
}

// ─── User Profile ────────────────────────────────────────────────────────────
export interface UserProfile {
  name: string;
  homeCountry: string;
  currency: string;
  travelerType?: 'backpacker' | 'budget' | 'comfort' | 'flashpacker';
}

// ─── Health Score ─────────────────────────────────────────────────────────────
export interface HealthScore {
  total: number;         // 0–100
  budgetAdherence: number;   // 0–100 (40% weight)
  stopsPlanned: number;      // 0–100 (30% weight)
  docsComplete: number;      // 0–100 (20% weight)
  daysRemaining: number;     // 0–100 (10% weight)
}

// ─── Document (Docs tab) ─────────────────────────────────────────────────────
export type DocType = 'flight' | 'hotel' | 'accommodation' | 'esim' | 'insurance' | 'visa' | 'activity' | 'transport' | 'other';

export interface TripDocument {
  id: string;
  tripId: string;
  stopId?: string;
  type: DocType;
  title: string;
  extractedData?: Record<string, string>;
  fileUrl?: string;
  parsedAt?: string;     // ISO
  createdAt: string;     // ISO
}

// ─── Analytics Events ─────────────────────────────────────────────────────────
export type AppEventName =
  | 'onboarding_complete'
  | 'trip_created'
  | 'expense_added'
  | 'expense_edited'
  | 'check_in'
  | 'affiliate_click'
  | 'doc_uploaded'
  | 'budget_alert_shown';

export interface AppEvent {
  name: AppEventName;
  ts: string;
  meta?: Record<string, string | number | boolean>;
}
