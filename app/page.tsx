'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Users, IndianRupee, BookOpen,
  FileCheck, BarChart3, Settings, ChevronRight,
  Briefcase, BriefcaseMedical, Truck, BookOpenCheck, ClipboardList, LogOut
} from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import Dashboard from '@/components/modules/Dashboard'
import Students from '@/components/modules/Students'
import Fees from '@/components/modules/Fees'
import Academics from '@/components/modules/Academics'
import Documents from '@/components/modules/Documents'
import Finance from '@/components/modules/Finance'
import Staff from '@/components/modules/Staff'
import Admissions from '@/components/modules/Admissions'
import Transport from '@/components/modules/Transport'
import Library from '@/components/modules/Library'
import Health from '@/components/modules/Health'

type Module = 'dashboard' | 'students' | 'fees' | 'academics' | 'documents' | 'finance' | 'staff' | 'admissions' | 'transport' | 'library' | 'health'

const NAV = [
  { id: 'dashboard', label: 'Overview',  icon: LayoutDashboard, num: '00' },
  { id: 'students',  label: 'Students',  icon: Users,           num: '01' },
  { id: 'fees',      label: 'Fees',      icon: IndianRupee,     num: '02' },
  { id: 'academics', label: 'Academics', icon: BookOpen,        num: '03' },
  { id: 'documents', label: 'Documents', icon: FileCheck,       num: '04' },
  { id: 'finance',   label: 'Finance',   icon: BarChart3,       num: '05' },
  { id: 'staff',     label: 'Staff',     icon: Briefcase,       num: '06' },
  { id: 'admissions',label: 'Admissions',icon: ClipboardList,   num: '07' },
  { id: 'transport', label: 'Transport', icon: Truck,           num: '08' },
  { id: 'library',   label: 'Library',   icon: BookOpenCheck,  num: '09' },
  { id: 'health',    label: 'Health',    icon: BriefcaseMedical,num: '10' },
] as const

export default function HomePage() {
  const [active, setActive] = useState<Module>('dashboard')
  const { user } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const renderModule = () => {
    switch (active) {
      case 'dashboard': return <Dashboard onNavigate={(m: any) => setActive(m)} />
      case 'students':  return <Students />
      case 'fees':      return <Fees />
      case 'academics': return <Academics />
      case 'documents': return <Documents />
      case 'finance':   return <Finance />
      case 'staff':     return <Staff />
      case 'admissions':return <Admissions />
      case 'transport': return <Transport />
      case 'library':   return <Library />
      case 'health':    return <Health />
    }
  }

  const currentNav = NAV.find(n => n.id === active)!

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside style={{
        background: 'var(--bone)',
        borderRight: '1px solid var(--border-heavy)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
      }}>
        {/* Logo block */}
        <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid var(--border-heavy)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '15%', top: 0, bottom: 0, width: 1, background: 'rgba(196,80,28,0.2)', pointerEvents: 'none' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: '0.04em', color: 'var(--ink)', lineHeight: 1 }}>
            CITY JUNIOR
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: '0.02em', color: 'var(--ink)', lineHeight: 1 }}>
            <span style={{ color: 'var(--summit)' }}>HIGH SCHOOL</span>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--stone)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
            लेख — ERP
          </div>
          <div className="coord" style={{ marginTop: 6 }}>AY · 2026–27 · v01</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 8, letterSpacing: '0.14em', color: 'var(--ash)', textTransform: 'uppercase', padding: '6px 12px 8px' }}>
            Modules
          </div>
          {NAV.map(item => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button key={item.id} className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActive(item.id as Module)}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: isActive ? 'var(--summit)' : 'var(--ash)', minWidth: 18, letterSpacing: '0.05em' }}>{item.num}</span>
                <Icon size={12} strokeWidth={1.5} />
                {item.label}
                {isActive && <ChevronRight size={10} style={{ marginLeft: 'auto', color: 'var(--summit)' }} />}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-heavy)' }}>
          <button className="nav-item" style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}>
            <Settings size={12} strokeWidth={1.5} /> Settings
          </button>
          <div style={{ background: 'var(--ink)', color: 'var(--bone)', fontFamily: 'var(--font-body)', fontSize: 9, letterSpacing: '0.1em', padding: '7px 10px', display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span>ACADEMIC YEAR</span>
            <span style={{ color: 'var(--summit)' }}>2024–25</span>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ background: 'var(--bone)', minHeight: '100vh', overflow: 'auto' }}>
        {/* Topbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 32px', borderBottom: '1px solid var(--border-heavy)',
          background: 'var(--bone)', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--stone)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{currentNav.num} —</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink)' }}>{currentNav.label}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="coord">28°36'N · 77°12'E · SCHOOL ADMIN</span>
            <div style={{ width: 1, height: 16, background: 'var(--border-heavy)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--bone)', letterSpacing: '0.05em' }}>
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, letterSpacing: '0.04em' }}>
                  {user?.user_metadata?.full_name || 'User'}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 9, color: 'var(--stone)' }}>
                  {user?.user_metadata?.role || 'staff'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--stone)', padding: 4 }}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 32px' }} className="animate-in">
          {renderModule()}
        </div>
      </main>
    </div>
  )
}
