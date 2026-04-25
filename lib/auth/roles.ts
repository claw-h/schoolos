import type { ERPUserRole, ModuleKey } from '@/types/domain'

export const ROLE_MODULES: Record<ERPUserRole, ModuleKey[]> = {
  admin: ['dashboard', 'students', 'admissions', 'attendance', 'fees', 'academics', 'documents', 'finance', 'staff', 'transport', 'library', 'health', 'settings'],
  principal: ['dashboard', 'students', 'attendance', 'fees', 'academics', 'documents', 'finance', 'staff', 'health', 'settings'],
  accounts: ['dashboard', 'students', 'fees', 'finance', 'settings'],
  admissions: ['dashboard', 'students', 'admissions', 'documents', 'settings'],
  teacher: ['dashboard', 'students', 'attendance', 'academics', 'documents'],
  librarian: ['dashboard', 'students', 'library'],
  transport_manager: ['dashboard', 'students', 'transport'],
  nurse: ['dashboard', 'students', 'attendance', 'health'],
  office_staff: ['dashboard', 'students', 'admissions', 'attendance', 'fees', 'documents'],
}

export function normalizeERPUserRole(input: string | null | undefined): ERPUserRole {
  const value = (input || '').trim().toLowerCase()
  if (value === 'principal') return 'principal'
  if (value === 'accounts') return 'accounts'
  if (value === 'admissions') return 'admissions'
  if (value === 'teacher') return 'teacher'
  if (value === 'librarian') return 'librarian'
  if (value === 'transport_manager') return 'transport_manager'
  if (value === 'nurse') return 'nurse'
  if (value === 'office_staff') return 'office_staff'
  return 'admin'
}

export function modulesForRoles(roles: ERPUserRole[]): ModuleKey[] {
  const modules = new Set<ModuleKey>()
  roles.forEach((role) => {
    ROLE_MODULES[role].forEach((moduleKey) => modules.add(moduleKey))
  })
  return Array.from(modules)
}

export function canAccessModule(roles: ERPUserRole[], moduleKey: ModuleKey): boolean {
  return modulesForRoles(roles).includes(moduleKey)
}
