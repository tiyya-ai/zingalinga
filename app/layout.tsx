import type { Metadata } from 'next'
import { Mali } from 'next/font/google'
import '../src/app/globals.css'

const mali = Mali({ 
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-mali'
})

export const metadata: Metadata = {
  title: 'Zinga Linga - African Alphabet Adventures with Kiki & Tano',
  description: 'Join Kiki and Tano on magical African alphabet adventures! Fun, educational, and culturally rich learning experiences for children ages 1-6.',
  keywords: 'children education, alphabet learning, African culture, kids videos, educational games, preschool learning',
  authors: [{ name: 'Zinga Linga Team' }],
  openGraph: {
    title: 'Zinga Linga - African Alphabet Adventures',
    description: 'Fun learning for children ages 1-6 with audio lessons, videos & interactive games.',
    images: ['/zinga linga logo.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zinga Linga - African Alphabet Adventures',
    description: 'Fun learning for children ages 1-6 with audio lessons, videos & interactive games.',
    images: ['/zinga linga logo.png'],
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={mali.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${mali.className} font-mali antialiased`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}