import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SchoolOS — School Management System',
  description: 'Complete ERP for school administration',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
