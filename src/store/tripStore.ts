import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Trip, Expense, UserProfile, TripDocument, AppEvent, AppEventName } from '@/types'

// ── Demo data (fresh dates always) ────────────────────────────────────────────
function makeDemoTrip(): { trip: Trip; expenses: Expense[] } {
  const now = new Date().toISOString()
  const trip: Trip = {
    id: 'demo-1',
    name: 'SEA 2025',
    emoji: '🌏',
    totalBudget: 3000,
    startDate: now,
    createdAt: now,
    region: 'Southeast Asia',
    durationWeeks: 6,
    stops: [
      { id: 's1', city: 'Bangkok',   country: 'Thailand',  countryCode: 'TH', days: 7,  budgetPerDay: 42, neighborhood: 'Silom',   character: 'Vibrant city, street food, temples',  isActive: false, isCompleted: true  },
      { id: 's2', city: 'Phuket',    country: 'Thailand',  countryCode: 'TH', days: 10, budgetPerDay: 48, neighborhood: 'Bangtao', character: 'Beaches, nightlife, water sports',    isActive: true,  isCompleted: false },
      { id: 's3', city: 'Bali',      country: 'Indonesia', countryCode: 'ID', days: 14, budgetPerDay: 35, neighborhood: 'Uluwatu', character: 'Culture, surf, rice terraces',        isActive: false, isCompleted: false },
      { id: 's4', city: 'Hanoi',     country: 'Vietnam',   countryCode: 'VN', days: 9,  budgetPerDay: 28, neighborhood: 'Old Qtr', character: 'History, food, chaos',               isActive: false, isCompleted: false },
    ],
    flights: [
      { id: 'f1', fromStopId: 'home', toStopId: 's1', airline: 'KLM', flightNumber: 'KL811', status: 'booked', price: 420 },
      { id: 'f2', fromStopId: 's2',   toStopId: 's3', status: 'to-book' },
      { id: 'f3', fromStopId: 's3',   toStopId: 's4', status: 'to-book' },
    ],
  }
  const expenses: Expense[] = [
    { id: 'e1', raw: 'pad thai 80 baht',    amount: 80,  currency: 'THB', amountEur: 2.16,  category: 'food',      label: 'Pad Thai',   date: now, stopId: 's2' },
    { id: 'e2', raw: 'taxi 150 baht',       amount: 150, currency: 'THB', amountEur: 4.05,  category: 'transport', label: 'Taxi',       date: now, stopId: 's2' },
    { id: 'e3', raw: 'hostel 500 baht',     amount: 500, currency: 'THB', amountEur: 13.50, category: 'stay',      label: 'Hostel',     date: now, stopId: 's2' },
  ]
  return { trip, expenses }
}

// ── Store ─────────────────────────────────────────────────────────────────────
interface TripStore {
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void

  trips: Trip[]
  activeTripId: string | null
  expenses: Expense[]
  documents: TripDocument[]
  profile: UserProfile | null
  onboardingDone: boolean
  events: AppEvent[]
  shownTooltips: string[]

  // Actions
  setProfile: (p: UserProfile) => void
  setOnboardingDone: (v: boolean) => void
  addTrip: (trip: Trip) => void
  setActiveTrip: (tripId: string) => void
  addStop: (tripId: string, stop: Trip['stops'][0]) => void
  updateStop: (tripId: string, stopId: string, data: Partial<Trip['stops'][0]>) => void
  addExpense: (e: Expense) => void
  removeExpense: (id: string) => void
  updateExpense: (id: string, data: Partial<Expense>) => void
  addDocument: (doc: TripDocument) => void
  markTooltipSeen: (id: string) => void
  trackEvent: (name: AppEventName, meta?: AppEvent['meta']) => void
  loadDemoTrip: () => void

  // Derived (selectors)
  activeTrip: () => Trip | null
  activeTripExpenses: () => Expense[]
  activeTripDocuments: () => TripDocument[]
  totalSpent: () => number
}

export const useTripStore = create<TripStore>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      trips: [],
      activeTripId: null,
      expenses: [],
      documents: [],
      profile: null,
      onboardingDone: false,
      events: [],
      shownTooltips: [],

      setProfile: (p) => set({ profile: p }),
      setOnboardingDone: (v) => set({ onboardingDone: v }),

      addTrip: (trip) => set((s) => ({
        trips: [...s.trips, trip],
        activeTripId: trip.id,
      })),

      setActiveTrip: (tripId) => set({ activeTripId: tripId }),

      addStop: (tripId, stop) => set((s) => ({
        trips: s.trips.map((t) =>
          t.id === tripId ? { ...t, stops: [...t.stops, stop] } : t
        ),
      })),

      updateStop: (tripId, stopId, data) => set((s) => ({
        trips: s.trips.map((t) =>
          t.id === tripId
            ? { ...t, stops: t.stops.map((st) => st.id === stopId ? { ...st, ...data } : st) }
            : t
        ),
      })),

      addExpense: (e) => set((s) => ({ expenses: [e, ...s.expenses] })),

      removeExpense: (id) => set((s) => ({
        expenses: s.expenses.filter((e) => e.id !== id),
      })),

      updateExpense: (id, data) => set((s) => ({
        expenses: s.expenses.map((e) => e.id === id ? { ...e, ...data } : e),
      })),

      addDocument: (doc) => set((s) => ({ documents: [...s.documents, doc] })),

      markTooltipSeen: (id) => set((s) => ({
        shownTooltips: [...s.shownTooltips, id],
      })),

      trackEvent: (name, meta) => set((s) => ({
        events: [{ name, ts: new Date().toISOString(), meta }, ...s.events.slice(0, 99)],
      })),

      loadDemoTrip: () => {
        const { trip, expenses } = makeDemoTrip()
        set({ trips: [trip], activeTripId: trip.id, expenses, onboardingDone: true })
      },

      // Selectors
      activeTrip: () => {
        const s = get()
        return s.trips.find((t) => t.id === s.activeTripId) ?? null
      },
      activeTripExpenses: () => {
        const s = get()
        const trip = s.activeTrip()
        if (!trip) return []
        const stopIds = new Set(trip.stops.map(st => st.id))
        // Include expenses belonging to any stop in this trip, OR expenses with no stopId (added while no stops exist)
        return s.expenses.filter((e) => !e.stopId || stopIds.has(e.stopId))
      },
      activeTripDocuments: () => {
        const s = get()
        return s.documents.filter((d) => d.tripId === s.activeTripId)
      },
      totalSpent: () => {
        const s = get()
        return s.activeTripExpenses().reduce((sum, e) => sum + e.amountEur, 0)
      },
    }),
    {
      name: 'tripdripgogo-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
