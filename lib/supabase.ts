import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Log presence of env vars (do NOT log actual keys)
if (typeof window === 'undefined') {
  // Server/build-time log
  // eslint-disable-next-line no-console
  console.log('SUPABASE_ENV: url_set=' + Boolean(supabaseUrl) + ', key_set=' + Boolean(supabaseKey) + ', NODE_ENV=' + process.env.NODE_ENV)
}

// Initialize with dummy values if env vars are missing - this prevents init errors
// The actual initialization happens lazily when used
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
)

// ─── Types ────────────────────────────────────────────────────────────────────

export type Student = {
  id: string
  student_id: string
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: 'Male' | 'Female' | 'Other' | null
  grade: number
  section: string
  roll_number: number | null
  enrollment_date: string
  status: 'active' | 'inactive' | 'transferred' | 'graduated'
  guardian_name: string | null
  guardian_phone: string | null
  guardian_email: string | null
  address: string | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export type FeeStructure = {
  id: string
  grade: number
  academic_year: string
  tuition_fee: number
  admission_fee: number
  exam_fee: number
  sports_fee: number
  transport_fee: number
  misc_fee: number
  total_annual: number
}

export type FeePayment = {
  id: string
  student_id: string
  academic_year: string
  month: string | null
  payment_type: string
  amount: number
  payment_date: string
  payment_mode: string
  receipt_number: string | null
  remarks: string | null
  recorded_by: string | null
  created_at: string
}

export type FeeDue = {
  id: string
  student_id: string
  academic_year: string
  total_billed: number
  total_paid: number
  outstanding: number
  last_payment_date: string | null
  updated_at: string
}

export type Subject = {
  id: string
  name: string
  code: string
  grade: number
  max_marks: number
  is_core: boolean
}

export type AcademicRecord = {
  id: string
  student_id: string
  subject_id: string
  academic_year: string
  exam_type: 'unit_test_1' | 'unit_test_2' | 'mid_term' | 'pre_board' | 'final' | 'quarterly'
  marks_obtained: number | null
  max_marks: number
  grade_letter: string | null
  remarks: string | null
  recorded_by: string | null
  exam_date: string | null
  subjects?: Subject
}

export type Document = {
  id: string
  student_id: string
  doc_type: string
  doc_name: string | null
  status: 'pending' | 'submitted' | 'verified' | 'rejected' | 'expired'
  submitted_date: string | null
  verified_date: string | null
  verified_by: string | null
  notes: string | null
  file_url: string | null
  created_at: string
  updated_at: string
}

export type StaffMember = {
  id: string
  full_name: string
  role: string
  department: string
  phone: string | null
  email: string | null
  salary: number | null
  status: 'active' | 'on_leave' | 'resigned'
  notes: string | null
  created_at: string
  updated_at: string
}

export type Admission = {
  id: string
  child_name: string
  grade_applied: number
  parent_name: string
  parent_phone: string | null
  parent_email: string | null
  source: string | null
  status: 'new' | 'contacted' | 'shortlisted' | 'enrolled' | 'declined'
  notes: string | null
  created_at: string
  updated_at: string
}

export type TransportRoute = {
  id: string
  route_name: string
  vehicle_number: string
  driver_name: string | null
  capacity: number
  stops: string | null
  status: 'active' | 'inactive' | 'maintenance'
  created_at: string
  updated_at: string
}

export type LibraryBook = {
  id: string
  title: string
  author: string | null
  isbn: string | null
  copies: number
  created_at: string
  updated_at: string
}

export type LibraryIssue = {
  id: string
  student_id: string
  book_id: string
  book_title: string | null
  issued_at: string
  due_date: string | null
  returned_at: string | null
  created_at: string
  updated_at: string
  students?: Student
}

export type HealthRecord = {
  id: string
  student_id: string
  condition: string | null
  notes: string
  recorded_at: string
  follow_up: string | null
  caregiver: string | null
  created_at: string
  updated_at: string
  students?: Student
}

export type StudentProfile = {
  id: string
  student_id: string
  learning_style: string | null
  strengths: string | null
  interests: string | null
  mentor: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'teacher' | 'staff'
  department: string | null
  created_at: string
  updated_at: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8]
export const CURRENT_YEAR = '2024-25'

export const EXAM_TYPES = [
  { value: 'unit_test_1', label: 'Unit Test I' },
  { value: 'unit_test_2', label: 'Unit Test II' },
  { value: 'mid_term', label: 'Mid Term' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'pre_board', label: 'Pre Board' },
  { value: 'final', label: 'Final' },
]

export const DOC_TYPES = [
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'aadhar_card', label: 'Aadhar Card' },
  { value: 'previous_marksheet', label: 'Previous Marksheet' },
  { value: 'transfer_certificate', label: 'Transfer Certificate' },
  { value: 'medical_certificate', label: 'Medical Certificate' },
  { value: 'caste_certificate', label: 'Caste Certificate' },
  { value: 'income_certificate', label: 'Income Certificate' },
  { value: 'passport_photo', label: 'Passport Photo' },
  { value: 'address_proof', label: 'Address Proof' },
  { value: 'guardian_id', label: 'Guardian ID' },
  { value: 'other', label: 'Other' },
]

export function gradeToLetter(percent: number): string {
  if (percent >= 91) return 'A+'
  if (percent >= 81) return 'A'
  if (percent >= 71) return 'B+'
  if (percent >= 61) return 'B'
  if (percent >= 51) return 'C'
  if (percent >= 41) return 'D'
  return 'F'
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
