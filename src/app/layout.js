import './globals.css'

export const metadata = {
  title: '🍼 Battesimo Mathi',
  description: 'Gestione invitati – 18 Luglio 2025',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
