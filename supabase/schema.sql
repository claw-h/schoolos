-- SchoolOS Database Schema
-- Run this in Supabase SQL Editor

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL, -- e.g. "SCH-2024-001"
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 8),
  section TEXT DEFAULT 'A',
  roll_number INTEGER,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'graduated')),
  guardian_name TEXT,
  guardian_phone TEXT,
  guardian_email TEXT,
  address TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FEE STRUCTURE
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_structure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 8),
  academic_year TEXT NOT NULL, -- e.g. "2024-25"
  tuition_fee NUMERIC(10,2) DEFAULT 0,
  admission_fee NUMERIC(10,2) DEFAULT 0,
  exam_fee NUMERIC(10,2) DEFAULT 0,
  sports_fee NUMERIC(10,2) DEFAULT 0,
  transport_fee NUMERIC(10,2) DEFAULT 0,
  misc_fee NUMERIC(10,2) DEFAULT 0,
  total_annual NUMERIC(10,2) GENERATED ALWAYS AS (
    tuition_fee + admission_fee + exam_fee + sports_fee + transport_fee + misc_fee
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grade, academic_year)
);

-- ============================================================
-- FEE PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  month TEXT, -- e.g. "April", or NULL for annual
  payment_type TEXT NOT NULL CHECK (payment_type IN ('tuition', 'admission', 'exam', 'sports', 'transport', 'misc', 'full')),
  amount NUMERIC(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_mode TEXT DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'online', 'cheque', 'upi', 'bank_transfer')),
  receipt_number TEXT UNIQUE,
  remarks TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FEE DUES (running balance)
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_dues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  total_billed NUMERIC(10,2) DEFAULT 0,
  total_paid NUMERIC(10,2) DEFAULT 0,
  outstanding NUMERIC(10,2) GENERATED ALWAYS AS (total_billed - total_paid) STORED,
  last_payment_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, academic_year)
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  grade INTEGER NOT NULL,
  max_marks INTEGER DEFAULT 100,
  is_core BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ACADEMIC RECORDS (marks per exam)
-- ============================================================
CREATE TABLE IF NOT EXISTS academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('unit_test_1', 'unit_test_2', 'mid_term', 'pre_board', 'final', 'quarterly')),
  marks_obtained NUMERIC(5,2),
  max_marks INTEGER DEFAULT 100,
  grade_letter TEXT,
  remarks TEXT,
  recorded_by TEXT,
  exam_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id, academic_year, exam_type)
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN (
    'birth_certificate',
    'aadhar_card',
    'previous_marksheet',
    'transfer_certificate',
    'medical_certificate',
    'caste_certificate',
    'income_certificate',
    'passport_photo',
    'address_proof',
    'guardian_id',
    'other'
  )),
  doc_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'verified', 'rejected', 'expired')),
  submitted_date DATE,
  verified_date DATE,
  verified_by TEXT,
  notes TEXT,
  file_url TEXT, -- optional: if you want file uploads later
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANNOUNCEMENTS / NOTICES
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  target_grades INTEGER[], -- NULL means all grades
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'exam', 'fee', 'event', 'holiday')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ============================================================
-- STAFF MANAGEMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  salary NUMERIC(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','on_leave','resigned')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADMISSIONS PIPELINE
-- ============================================================
CREATE TABLE IF NOT EXISTS admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name TEXT NOT NULL,
  grade_applied INTEGER NOT NULL CHECK (grade_applied BETWEEN 1 AND 8),
  parent_name TEXT NOT NULL,
  parent_phone TEXT,
  parent_email TEXT,
  source TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','shortlisted','enrolled','declined')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRANSPORT MANAGEMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  driver_name TEXT,
  capacity INTEGER DEFAULT 0,
  stops TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LIBRARY MANAGEMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  copies INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS library_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  book_id UUID REFERENCES library_books(id) ON DELETE CASCADE,
  book_title TEXT,
  issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  returned_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HEALTH & WELLNESS
-- ============================================================
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  condition TEXT,
  notes TEXT NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  follow_up TEXT,
  caregiver TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- STUDENT PERSONALIZATION
-- ============================================================
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  learning_style TEXT,
  strengths TEXT,
  interests TEXT,
  mentor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id)
);

-- ============================================================
-- USER PROFILES (for authentication)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'teacher', 'staff')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_year ON fee_payments(academic_year);
CREATE INDEX IF NOT EXISTS idx_academic_records_student ON academic_records(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_records_year ON academic_records(academic_year);
CREATE INDEX IF NOT EXISTS idx_documents_student ON documents(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);

-- ============================================================
-- SEED: Default subjects for all grades
-- ============================================================
INSERT INTO subjects (name, code, grade, max_marks, is_core) VALUES
  ('Mathematics', 'MATH-1', 1, 100, TRUE), ('English', 'ENG-1', 1, 100, TRUE), ('Hindi', 'HIN-1', 1, 100, TRUE), ('EVS', 'EVS-1', 1, 100, TRUE),
  ('Mathematics', 'MATH-2', 2, 100, TRUE), ('English', 'ENG-2', 2, 100, TRUE), ('Hindi', 'HIN-2', 2, 100, TRUE), ('EVS', 'EVS-2', 2, 100, TRUE),
  ('Mathematics', 'MATH-3', 3, 100, TRUE), ('English', 'ENG-3', 3, 100, TRUE), ('Hindi', 'HIN-3', 3, 100, TRUE), ('Science', 'SCI-3', 3, 100, TRUE), ('Social Studies', 'SST-3', 3, 100, TRUE),
  ('Mathematics', 'MATH-4', 4, 100, TRUE), ('English', 'ENG-4', 4, 100, TRUE), ('Hindi', 'HIN-4', 4, 100, TRUE), ('Science', 'SCI-4', 4, 100, TRUE), ('Social Studies', 'SST-4', 4, 100, TRUE),
  ('Mathematics', 'MATH-5', 5, 100, TRUE), ('English', 'ENG-5', 5, 100, TRUE), ('Hindi', 'HIN-5', 5, 100, TRUE), ('Science', 'SCI-5', 5, 100, TRUE), ('Social Studies', 'SST-5', 5, 100, TRUE),
  ('Mathematics', 'MATH-6', 6, 100, TRUE), ('English', 'ENG-6', 6, 100, TRUE), ('Hindi', 'HIN-6', 6, 100, TRUE), ('Science', 'SCI-6', 6, 100, TRUE), ('Social Studies', 'SST-6', 6, 100, TRUE), ('Sanskrit', 'SAN-6', 6, 100, FALSE),
  ('Mathematics', 'MATH-7', 7, 100, TRUE), ('English', 'ENG-7', 7, 100, TRUE), ('Hindi', 'HIN-7', 7, 100, TRUE), ('Science', 'SCI-7', 7, 100, TRUE), ('Social Studies', 'SST-7', 7, 100, TRUE), ('Sanskrit', 'SAN-7', 7, 100, FALSE),
  ('Mathematics', 'MATH-8', 8, 100, TRUE), ('English', 'ENG-8', 8, 100, TRUE), ('Hindi', 'HIN-8', 8, 100, TRUE), ('Science', 'SCI-8', 8, 100, TRUE), ('Social Studies', 'SST-8', 8, 100, TRUE), ('Sanskrit', 'SAN-8', 8, 100, FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: Fee structure for 2024-25
-- ============================================================
INSERT INTO fee_structure (grade, academic_year, tuition_fee, admission_fee, exam_fee, sports_fee) VALUES
  (1, '2024-25', 18000, 2000, 1000, 500),
  (2, '2024-25', 18000, 2000, 1000, 500),
  (3, '2024-25', 20000, 2000, 1500, 500),
  (4, '2024-25', 20000, 2000, 1500, 500),
  (5, '2024-25', 22000, 2000, 1500, 500),
  (6, '2024-25', 24000, 2000, 2000, 500),
  (7, '2024-25', 24000, 2000, 2000, 500),
  (8, '2024-25', 26000, 2000, 2000, 500)
ON CONFLICT DO NOTHING;
