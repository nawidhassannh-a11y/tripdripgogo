import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TripDripGoGo — Your Solo Travel OS',
  description: 'Budget-first trip planning, expense tracking, and document management for solo travelers and backpackers.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TripDripGoGo',
  },
  openGraph: {
    title: 'TripDripGoGo',
    description: 'Solo Travel OS — budget-first, AI-powered, offline-capable.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#059467',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:ital,wght@1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-surface dark:bg-surface-dark text-gray-900 dark:text-white">
        {children}
      </body>
    </html>
  )
}
