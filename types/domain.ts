export type ERPUserRole =
  | 'admin'
  | 'principal'
  | 'accounts'
  | 'admissions'
  | 'teacher'
  | 'librarian'
  | 'transport_manager'
  | 'nurse'
  | 'office_staff'

export type ModuleKey =
  | 'dashboard'
  | 'students'
  | 'admissions'
  | 'attendance'
  | 'fees'
  | 'academics'
  | 'documents'
  | 'finance'
  | 'staff'
  | 'transport'
  | 'library'
  | 'health'
  | 'settings'

export type SchoolSettings = {
  id: string
  school_name: string
  short_name: string | null
  board_name: string | null
  contact_email: string | null
  contact_phone: string | null
  address_line: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  timezone: string | null
  currency_code: string | null
  created_at?: string
  updated_at?: string
}

export type AcademicYear = {
  id: string
  label: string
  starts_on: string
  ends_on: string
  is_active: boolean
  created_at?: string
}

export type SchoolClass = {
  id: string
  grade_level: number
  label: string
  created_at?: string
}

export type Section = {
  id: string
  class_id: string
  section_name: string
  class_label?: string
  grade_level?: number
  created_at?: string
}

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

export type StudentGuardian = {
  id: string
  student_id: string
  full_name: string
  relationship: string
  phone: string | null
  email: string | null
  is_primary: boolean
  occupation: string | null
  created_at?: string
}

export type StudentContact = {
  id: string
  student_id: string
  address_line: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  created_at?: string
  updated_at?: string
}

export type StudentEnrollment = {
  id: string
  student_id: string
  academic_year_id: string
  class_id: string
  section_id: string | null
  roll_number: number | null
  status: string
  class_label?: string
  section_name?: string | null
  academic_year_label?: string
  created_at?: string
}

export type StudentRecord = {
  student: Student
  guardians: StudentGuardian[]
  contact: StudentContact | null
  current_enrollment: StudentEnrollment | null
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

export type FeeHead = {
  id: string
  code: string
  label: string
  category: string
  created_at?: string
}

export type FeeSchedule = {
  id: string
  academic_year_id: string
  class_id: string
  fee_head_id: string
  amount: number
  is_optional: boolean
  created_at?: string
}

export type FeeLedgerEntry = {
  id: string
  student_id: string
  academic_year_id: string | null
  fee_head_id: string | null
  entry_type: 'charge' | 'payment' | 'discount' | 'refund'
  amount: number
  entry_date: string
  source: string | null
  reference_code: string | null
  notes: string | null
  created_at?: string
}

export type PaymentReceipt = {
  id: string
  student_id: string
  receipt_number: string
  amount_received: number
  received_on: string
  payment_mode: string | null
  created_at?: string
}

export type FeeAccount = {
  student: Student
  billed: number
  paid: number
  balance: number
  receipts: PaymentReceipt[]
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

export type ExamTerm = {
  id: string
  academic_year_id: string
  label: string
  sequence_no: number
  starts_on: string | null
  ends_on: string | null
  created_at?: string
}

export type Assessment = {
  id: string
  exam_term_id: string
  class_id: string
  subject_id: string | null
  title: string
  max_marks: number
  assessment_date: string | null
  created_at?: string
}

export type ReportCard = {
  id: string
  student_id: string
  academic_year_id: string
  exam_term_id: string | null
  status: 'draft' | 'published'
  overall_percent: number | null
  overall_grade: string | null
  published_at: string | null
  created_at?: string
}

export type AssessmentRecord = {
  assessment: Assessment
  student: Student
  marks: number | null
  grade_letter: string | null
  report_card_status: ReportCard['status'] | null
}

export type AttendanceRecord = {
  id: string
  student_id: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  remarks: string | null
  created_at: string
}

export type AttendanceSession = {
  id: string
  academic_year_id: string
  class_id: string
  section_id: string | null
  attendance_date: string
  recorded_by: string | null
  created_at?: string
}

export type AttendanceSummary = {
  session_date: string
  class_label: string
  section_name: string | null
  totals: {
    present: number
    absent: number
    late: number
    excused: number
  }
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

export type StaffProfile = {
  id: string
  user_id: string | null
  full_name: string
  designation: string
  department: string
  phone: string | null
  email: string | null
  joining_date: string | null
  status: 'active' | 'on_leave' | 'resigned'
  created_at?: string
  updated_at?: string
}

export type StaffRecord = {
  profile: StaffProfile
  roles: ERPUserRole[]
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

export type AdmissionRecord = Admission & {
  converted_student_id?: string | null
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

export type AuthUserContext = {
  userId: string
  email: string
  fullName: string
  primaryRole: ERPUserRole
  roles: ERPUserRole[]
  activeAcademicYear: AcademicYear | null
  permittedModules: ModuleKey[]
  staffProfile: StaffProfile | null
}

export type AuditLog = {
  id: string
  actor_user_id: string | null
  actor_role: string | null
  entity_type: string
  entity_id: string | null
  action: string
  payload: Record<string, unknown> | null
  created_at?: string
}

export type NotificationEvent = {
  id: string
  event_type: string
  audience_type: string
  channel: string
  delivery_state: string
  payload: Record<string, unknown> | null
  created_at?: string
}

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
