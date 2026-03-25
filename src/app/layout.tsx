import type { Metadata, Viewport } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const newsreader = Newsreader({ subsets: ['latin'], style: ['italic'], weight: ['400', '600', '700'], variable: '--font-newsreader', display: 'swap', adjustFontFallback: false })

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable}`}>
      <body className="font-sans antialiased bg-surface dark:bg-surface-dark text-gray-900 dark:text-white">
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()` }} />
        {children}
      </body>
    </html>
  )
}
