'use client'

import { useEffect, useRef } from 'react'
import type { Stop } from '@/types'

interface TripMapProps {
  stops: Stop[]
  className?: string
}

// Approximate lat/lng for popular cities
const CITY_COORDS: Record<string, [number, number]> = {
  'Bangkok': [13.75, 100.5],       'Chiang Mai': [18.79, 98.98],
  'Phuket': [7.88, 98.39],         'Koh Phangan': [9.74, 100.01],
  'Hanoi': [21.02, 105.84],        'Ho Chi Minh': [10.82, 106.63],
  'Hoi An': [15.88, 108.33],       'Da Nang': [16.05, 108.2],
  'Siem Reap': [13.36, 103.86],    'Phnom Penh': [11.56, 104.92],
  'Bali': [-8.34, 115.09],         'Lombok': [-8.65, 116.32],
  'Yogyakarta': [-7.79, 110.37],   'Kuala Lumpur': [3.14, 101.69],
  'Penang': [5.41, 100.33],        'Singapore': [1.35, 103.82],
  'Vang Vieng': [18.92, 102.45],   'Luang Prabang': [19.88, 102.14],
  'Manila': [14.6, 121.0],
  'Lisbon': [38.72, -9.14],        'Porto': [41.16, -8.63],
  'Barcelona': [41.39, 2.15],      'Madrid': [40.42, -3.7],
  'Amsterdam': [52.37, 4.9],       'Berlin': [52.52, 13.4],
  'Prague': [50.08, 14.43],        'Budapest': [47.5, 19.04],
  'Kraków': [50.06, 19.94],        'Athens': [37.98, 23.73],
  'Tbilisi': [41.69, 44.83],
  'Medellín': [6.25, -75.56],      'Cartagena': [10.39, -75.49],
  'Mexico City': [19.43, -99.13],  'Buenos Aires': [-34.6, -58.38],
  'Lima': [-12.04, -77.03],        'Cusco': [-13.52, -71.97],
  'Kathmandu': [27.7, 85.32],      'Goa': [15.3, 74.08],
  'Mumbai': [19.08, 72.88],        'Colombo': [6.93, 79.85],
  'Tokyo': [35.69, 139.69],        'Osaka': [34.69, 135.5],
  'Kyoto': [35.01, 135.77],        'Seoul': [37.57, 126.98],
  'Taipei': [25.05, 121.57],
}

export function TripMap({ stops, className = '' }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)

  useEffect(() => {
    if (!mapRef.current || stops.length === 0) return
    if (typeof window === 'undefined') return

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Destroy existing map
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }

      const stopsWithCoords = stops
        .map(s => ({ stop: s, coords: CITY_COORDS[s.city] }))
        .filter(s => s.coords)

      if (stopsWithCoords.length === 0) return

      const map = L.map(mapRef.current!, { zoomControl: false, attributionControl: false })
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
      }).addTo(map)

      // Draw route line
      const latlngs = stopsWithCoords.map(s => s.coords as L.LatLngExpression)
      if (latlngs.length > 1) {
        L.polyline(latlngs, { color: '#059467', weight: 2.5, dashArray: '6 4', opacity: 0.8 }).addTo(map)
      }

      // Custom marker
      stopsWithCoords.forEach(({ stop, coords }, i) => {
        const isActive = stop.isActive
        const icon = L.divIcon({
          html: `<div style="
            width: 28px; height: 28px;
            background: ${isActive ? '#059467' : '#fff'};
            border: 2.5px solid #059467;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 700;
            color: ${isActive ? '#fff' : '#059467'};
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          ">${i + 1}</div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })
        L.marker(coords as L.LatLngExpression, { icon })
          .addTo(map)
          .bindTooltip(`<b>${stop.city}</b><br/>${stop.days}d · €${stop.budgetPerDay}/day`, {
            permanent: false, direction: 'top',
          })
      })

      // Fit bounds
      const bounds = L.latLngBounds(latlngs)
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 10 })

      // Add zoom control bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map)
    })

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(mapInstanceRef.current as any).remove()
        mapInstanceRef.current = null
      }
    }
  }, [stops])

  if (stops.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 dark:bg-slate-800 rounded-xl ${className}`}>
        <p className="text-gray-400 text-sm">Add stops to see the map</p>
      </div>
    )
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} className={`rounded-xl overflow-hidden ${className}`} />
    </>
  )
}
