'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ComponentType, ReactNode } from 'react'
import {
  BarChart3,
  BookOpen,
  BookOpenCheck,
  CalendarCheck2,
  ClipboardList,
  FileCheck,
  IndianRupee,
  LayoutDashboard,
  Settings,
  BriefcaseMedical,
  Truck,
  Users,
  UserSquare2,
} from 'lucide-react'
import type { AuthUserContext, ModuleKey } from '@/types/domain'

type AppShellProps = {
  user: AuthUserContext
  schoolName: string
  onSignOut: (formData: FormData) => void
  children: ReactNode
}

const NAV: Array<{
  href: string
  label: string
  module: ModuleKey
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
}> = [
  { href: '/dashboard', label: 'Overview', module: 'dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', module: 'students', icon: Users },
  { href: '/admissions', label: 'Admissions', module: 'admissions', icon: ClipboardList },
  { href: '/attendance', label: 'Attendance', module: 'attendance', icon: CalendarCheck2 },
  { href: '/fees', label: 'Fees', module: 'fees', icon: IndianRupee },
  { href: '/academics', label: 'Academics', module: 'academics', icon: BookOpen },
  { href: '/documents', label: 'Documents', module: 'documents', icon: FileCheck },
  { href: '/finance', label: 'Finance', module: 'finance', icon: BarChart3 },
  { href: '/staff', label: 'Staff', module: 'staff', icon: UserSquare2 },
  { href: '/transport', label: 'Transport', module: 'transport', icon: Truck },
  { href: '/library', label: 'Library', module: 'library', icon: BookOpenCheck },
  { href: '/health', label: 'Health', module: 'health', icon: BriefcaseMedical },
  { href: '/settings', label: 'Settings', module: 'settings', icon: Settings },
]

function titleForPath(pathname: string) {
  return NAV.find((item) => pathname.startsWith(item.href))?.label || 'Dashboard'
}

export function AppShell({ user, schoolName, onSignOut, children }: AppShellProps) {
  const pathname = usePathname()
  const allowed = new Set(user.permittedModules)

  return (
    <div className="app-shell">
      <aside
        style={{
          background: 'var(--bone)',
          borderRight: '1px solid var(--border-heavy)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid var(--border-heavy)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '15%', top: 0, bottom: 0, width: 1, background: 'rgba(196,80,28,0.2)', pointerEvents: 'none' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: '0.04em', color: 'var(--ink)', lineHeight: 1 }}>
            {schoolName.split(' ').slice(0, 2).join(' ') || 'SCHOOL'}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, letterSpacing: '0.02em', color: 'var(--ink)', lineHeight: 1 }}>
            <span style={{ color: 'var(--summit)' }}>{schoolName.split(' ').slice(2).join(' ') || 'ERP'}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--stone)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
            लेख
          </div>
          <div className="coord" style={{ marginTop: 6 }}>
            AY · {user.activeAcademicYear?.label || '2026-27'} · Phase 1
          </div>
        </div>

        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, letterSpacing: '0.14em', color: 'var(--ash)', textTransform: 'uppercase', padding: '6px 12px 8px' }}>
            Modules
          </div>
          {NAV.filter((item) => allowed.has(item.module)).map((item, index) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: isActive ? 'var(--summit)' : 'var(--ash)', minWidth: 18, letterSpacing: '0.05em' }}>
                  {String(index).padStart(2, '0')}
                </span>
                <Icon size={12} strokeWidth={1.5} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-heavy)' }}>
          <div style={{ background: 'var(--ink)', color: 'var(--bone)', fontFamily: 'var(--font-body)', fontSize: 9, letterSpacing: '0.1em', padding: '7px 10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>ROLE</span>
            <span style={{ color: 'var(--summit)' }}>{user.primaryRole.replace('_', ' ').toUpperCase()}</span>
          </div>
          <form action={onSignOut} style={{ marginTop: 8 }}>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} type="submit">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main style={{ background: 'var(--bone)', minHeight: '100vh', overflow: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 32px',
            borderBottom: '1px solid var(--border-heavy)',
            background: 'var(--bone)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--stone)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              ERP
            </span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)' }}>
              {titleForPath(pathname)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="coord">{schoolName.toUpperCase()} · INTERNAL OPERATIONS</span>
            <div style={{ width: 1, height: 16, background: 'var(--border-heavy)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  background: 'var(--ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  color: 'var(--bone)',
                  letterSpacing: '0.05em',
                }}
              >
                {user.fullName[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.04em' }}>{user.fullName}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--stone)' }}>{user.primaryRole.replace('_', ' ')}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '28px 32px' }} className="animate-in">
          {children}
        </div>
      </main>
    </div>
  )
}
