create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.school_settings (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  short_name text,
  board_name text,
  contact_email text,
  contact_phone text,
  address_line text,
  city text,
  state text,
  postal_code text,
  country text default 'India',
  timezone text default 'Asia/Kolkata',
  currency_code text default 'INR',
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  label text unique not null,
  starts_on date not null,
  ends_on date not null,
  is_active boolean not null default false,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  grade_level integer not null check (grade_level between 1 and 8),
  label text not null,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (grade_level)
);

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  section_name text not null,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, section_name)
);

create table if not exists public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  designation text not null,
  department text not null,
  phone text,
  email text,
  joining_date date,
  status text not null default 'active' check (status in ('active', 'on_leave', 'resigned')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'principal', 'accounts', 'admissions', 'teacher', 'librarian', 'transport_manager', 'nurse', 'office_staff')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.student_guardians (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  full_name text not null,
  relationship text not null,
  phone text,
  email text,
  occupation text,
  is_primary boolean not null default false,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_contacts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null unique references public.students(id) on delete cascade,
  address_line text,
  city text,
  state text,
  postal_code text,
  emergency_contact_name text,
  emergency_contact_phone text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete restrict,
  section_id uuid references public.sections(id) on delete set null,
  roll_number integer,
  status text not null default 'active' check (status in ('active', 'inactive', 'transferred', 'graduated')),
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  attendance_date date not null,
  recorded_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (class_id, section_id, attendance_date)
);

create table if not exists public.exam_terms (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  label text not null,
  sequence_no integer not null,
  starts_on date,
  ends_on date,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (academic_year_id, label)
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  exam_term_id uuid not null references public.exam_terms(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  max_marks integer not null default 100,
  assessment_date date,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_cards (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  exam_term_id uuid references public.exam_terms(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  overall_percent numeric(5,2),
  overall_grade text,
  published_at timestamptz,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, academic_year_id, exam_term_id)
);

create table if not exists public.fee_heads (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  category text not null,
  is_optional boolean not null default false,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fee_schedules (
  id uuid primary key default gen_random_uuid(),
  academic_year_id uuid not null references public.academic_years(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  fee_head_id uuid not null references public.fee_heads(id) on delete cascade,
  amount numeric(10,2) not null default 0,
  due_month integer,
  is_optional boolean not null default false,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (academic_year_id, class_id, fee_head_id, due_month)
);

create table if not exists public.fee_ledger (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  academic_year_id uuid references public.academic_years(id) on delete set null,
  fee_head_id uuid references public.fee_heads(id) on delete set null,
  entry_type text not null check (entry_type in ('charge', 'payment', 'discount', 'refund')),
  amount numeric(10,2) not null,
  entry_date date not null default current_date,
  source text,
  reference_code text,
  notes text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  receipt_number text not null unique,
  amount_received numeric(10,2) not null,
  received_on date not null default current_date,
  payment_mode text,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  audience_type text not null,
  channel text not null,
  delivery_state text not null default 'queued',
  payload jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text,
  entity_type text not null,
  entity_id text,
  action text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_student_enrollments_student on public.student_enrollments(student_id);
create index if not exists idx_student_enrollments_year on public.student_enrollments(academic_year_id);
create index if not exists idx_fee_ledger_student on public.fee_ledger(student_id);
create index if not exists idx_payment_receipts_student on public.payment_receipts(student_id);
create index if not exists idx_attendance_sessions_date on public.attendance_sessions(attendance_date);
create index if not exists idx_user_roles_user on public.user_roles(user_id);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_user_id);

drop trigger if exists trg_school_settings_updated_at on public.school_settings;
create trigger trg_school_settings_updated_at before update on public.school_settings for each row execute function public.set_updated_at();
drop trigger if exists trg_academic_years_updated_at on public.academic_years;
create trigger trg_academic_years_updated_at before update on public.academic_years for each row execute function public.set_updated_at();
drop trigger if exists trg_classes_updated_at on public.classes;
create trigger trg_classes_updated_at before update on public.classes for each row execute function public.set_updated_at();
drop trigger if exists trg_sections_updated_at on public.sections;
create trigger trg_sections_updated_at before update on public.sections for each row execute function public.set_updated_at();
drop trigger if exists trg_staff_profiles_updated_at on public.staff_profiles;
create trigger trg_staff_profiles_updated_at before update on public.staff_profiles for each row execute function public.set_updated_at();
drop trigger if exists trg_student_guardians_updated_at on public.student_guardians;
create trigger trg_student_guardians_updated_at before update on public.student_guardians for each row execute function public.set_updated_at();
drop trigger if exists trg_student_contacts_updated_at on public.student_contacts;
create trigger trg_student_contacts_updated_at before update on public.student_contacts for each row execute function public.set_updated_at();
drop trigger if exists trg_student_enrollments_updated_at on public.student_enrollments;
create trigger trg_student_enrollments_updated_at before update on public.student_enrollments for each row execute function public.set_updated_at();
drop trigger if exists trg_exam_terms_updated_at on public.exam_terms;
create trigger trg_exam_terms_updated_at before update on public.exam_terms for each row execute function public.set_updated_at();
drop trigger if exists trg_assessments_updated_at on public.assessments;
create trigger trg_assessments_updated_at before update on public.assessments for each row execute function public.set_updated_at();
drop trigger if exists trg_report_cards_updated_at on public.report_cards;
create trigger trg_report_cards_updated_at before update on public.report_cards for each row execute function public.set_updated_at();
drop trigger if exists trg_fee_heads_updated_at on public.fee_heads;
create trigger trg_fee_heads_updated_at before update on public.fee_heads for each row execute function public.set_updated_at();
drop trigger if exists trg_fee_schedules_updated_at on public.fee_schedules;
create trigger trg_fee_schedules_updated_at before update on public.fee_schedules for each row execute function public.set_updated_at();
drop trigger if exists trg_fee_ledger_updated_at on public.fee_ledger;
create trigger trg_fee_ledger_updated_at before update on public.fee_ledger for each row execute function public.set_updated_at();

alter table public.school_settings enable row level security;
alter table public.academic_years enable row level security;
alter table public.classes enable row level security;
alter table public.sections enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.student_guardians enable row level security;
alter table public.student_contacts enable row level security;
alter table public.student_enrollments enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.exam_terms enable row level security;
alter table public.assessments enable row level security;
alter table public.report_cards enable row level security;
alter table public.fee_heads enable row level security;
alter table public.fee_schedules enable row level security;
alter table public.fee_ledger enable row level security;
alter table public.payment_receipts enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "authenticated can read school settings" on public.school_settings;
create policy "authenticated can read school settings" on public.school_settings
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated can read academic years" on public.academic_years;
create policy "authenticated can read academic years" on public.academic_years
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated can read classes" on public.classes;
create policy "authenticated can read classes" on public.classes
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated can read sections" on public.sections;
create policy "authenticated can read sections" on public.sections
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated can read fee heads" on public.fee_heads;
create policy "authenticated can read fee heads" on public.fee_heads
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated can read exam terms" on public.exam_terms;
create policy "authenticated can read exam terms" on public.exam_terms
for select using (auth.role() = 'authenticated');

drop policy if exists "authenticated can read assessments" on public.assessments;
create policy "authenticated can read assessments" on public.assessments
for select using (auth.role() = 'authenticated');

insert into public.school_settings (school_name, short_name, board_name)
select 'City Junior High School', 'SchoolOS', 'State Board'
where not exists (select 1 from public.school_settings);

insert into public.academic_years (label, starts_on, ends_on, is_active)
values ('2024-25', '2024-04-01', '2025-03-31', true)
on conflict (label) do nothing;

insert into public.classes (grade_level, label)
select grade, 'Grade ' || grade
from generate_series(1, 8) as grade
on conflict (grade_level) do nothing;

insert into public.sections (class_id, section_name)
select distinct c.id, s.section
from public.students s
join public.classes c on c.grade_level = s.grade
where s.section is not null
on conflict (class_id, section_name) do nothing;

insert into public.staff_profiles (full_name, designation, department, phone, email, status)
select s.full_name, s.role, s.department, s.phone, s.email, s.status
from public.staff s
where not exists (
  select 1
  from public.staff_profiles sp
  where sp.full_name = s.full_name
    and coalesce(sp.email, '') = coalesce(s.email, '')
);

insert into public.student_guardians (student_id, full_name, relationship, phone, email, is_primary)
select s.id, s.guardian_name, 'Guardian', s.guardian_phone, s.guardian_email, true
from public.students s
where s.guardian_name is not null
and not exists (
  select 1 from public.student_guardians g
  where g.student_id = s.id
    and g.full_name = s.guardian_name
);

insert into public.student_contacts (student_id, address_line, emergency_contact_name, emergency_contact_phone)
select s.id, s.address, s.guardian_name, s.guardian_phone
from public.students s
where not exists (
  select 1 from public.student_contacts sc where sc.student_id = s.id
);

insert into public.student_enrollments (student_id, academic_year_id, class_id, section_id, roll_number, status)
select
  s.id,
  ay.id,
  c.id,
  sec.id,
  s.roll_number,
  s.status
from public.students s
join public.academic_years ay on ay.label = '2024-25'
join public.classes c on c.grade_level = s.grade
left join public.sections sec on sec.class_id = c.id and sec.section_name = s.section
where not exists (
  select 1 from public.student_enrollments se
  where se.student_id = s.id and se.academic_year_id = ay.id
);

insert into public.fee_heads (code, label, category)
values
  ('TUITION', 'Tuition Fee', 'recurring'),
  ('ADMISSION', 'Admission Fee', 'one_time'),
  ('EXAM', 'Exam Fee', 'periodic'),
  ('SPORTS', 'Sports Fee', 'periodic'),
  ('TRANSPORT', 'Transport Fee', 'optional'),
  ('MISC', 'Miscellaneous Fee', 'misc')
on conflict (code) do nothing;

insert into public.payment_receipts (student_id, receipt_number, amount_received, received_on, payment_mode)
select
  fp.student_id,
  coalesce(fp.receipt_number, 'LEGACY-' || substr(fp.id::text, 1, 8)),
  fp.amount,
  fp.payment_date,
  fp.payment_mode
from public.fee_payments fp
where not exists (
  select 1 from public.payment_receipts pr
  where pr.receipt_number = coalesce(fp.receipt_number, 'LEGACY-' || substr(fp.id::text, 1, 8))
);

insert into public.exam_terms (academic_year_id, label, sequence_no)
select ay.id, term.label, term.sequence_no
from public.academic_years ay
cross join (
  values
    ('Unit Test I', 1),
    ('Unit Test II', 2),
    ('Quarterly', 3),
    ('Mid Term', 4),
    ('Pre Board', 5),
    ('Final', 6)
) as term(label, sequence_no)
where ay.label = '2024-25'
on conflict (academic_year_id, label) do nothing;
