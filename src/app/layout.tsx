import React from 'react'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="font-inter">
      <head>
        <title>Zinga Linga</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Mali:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body suppressHydrationWarning className="font-inter antialiased">
        {children}
      </body>
    </html>
  )
}