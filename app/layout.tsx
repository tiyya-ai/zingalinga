import '../src/app/globals.css'

export const metadata = {
  title: 'Zinga Linga - Educational Learning Platform',
  description: 'Interactive learning platform for children with engaging educational content',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
