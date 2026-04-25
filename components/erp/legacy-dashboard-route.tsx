'use client'

import { useRouter } from 'next/navigation'
import Dashboard from '@/components/modules/Dashboard'

const ROUTE_MAP: Record<string, string> = {
  dashboard: '/dashboard',
  students: '/students',
  fees: '/fees',
  academics: '/academics',
  documents: '/documents',
  finance: '/finance',
  staff: '/staff',
  admissions: '/admissions',
  transport: '/transport',
  library: '/library',
  health: '/health',
}

export function LegacyDashboardRoute() {
  const router = useRouter()

  return (
    <Dashboard
      onNavigate={(moduleKey: string) => {
        const href = ROUTE_MAP[moduleKey]
        if (href) router.push(href)
      }}
    />
  )
}
