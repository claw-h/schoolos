import type { Metadata } from 'next'
import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"


export const metadata: Metadata = {
  title: 'SchoolOS — School Management System',
  description: 'Complete ERP for school administration',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
       <SpeedInsights />
    </html>
  )
}
