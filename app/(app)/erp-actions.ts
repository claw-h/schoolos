'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServiceClient } from '@/lib/supabase-service'
import { canAccessModule } from '@/lib/auth/roles'
import { logAuditEvent } from '@/lib/services/audit'
import { requireAuthUserContext } from '@/lib/services/auth-context'

async function requireModuleAccess(moduleKey: Parameters<typeof canAccessModule>[1]) {
  const auth = await requireAuthUserContext()
  if (!canAccessModule(auth.roles, moduleKey)) {
    throw new Error(`Missing permission for ${moduleKey}`)
  }
  return auth
}

export async function upsertSchoolSettingsAction(formData: FormData) {
  const auth = await requireModuleAccess('settings')
  const admin = createSupabaseServiceClient()

  const payload = {
    school_name: String(formData.get('school_name') || '').trim(),
    short_name: String(formData.get('short_name') || '').trim() || null,
    board_name: String(formData.get('board_name') || '').trim() || null,
    contact_email: String(formData.get('contact_email') || '').trim() || null,
    contact_phone: String(formData.get('contact_phone') || '').trim() || null,
    address_line: String(formData.get('address_line') || '').trim() || null,
    city: String(formData.get('city') || '').trim() || null,
    state: String(formData.get('state') || '').trim() || null,
    postal_code: String(formData.get('postal_code') || '').trim() || null,
    country: 'India',
    timezone: 'Asia/Kolkata',
    currency_code: 'INR',
  }

  const { data: existingRow } = await admin.from('school_settings').select('id').limit(1).maybeSingle()
  const existing = (existingRow || null) as { id: string } | null
  if (existing?.id) {
    await admin.from('school_settings').update(payload).eq('id', existing.id)
  } else {
    await admin.from('school_settings').insert(payload)
  }

  await logAuditEvent({
    actorUserId: auth.userId,
    actorRole: auth.primaryRole,
    entityType: 'school_settings',
    entityId: existing?.id || null,
    action: existing?.id ? 'update' : 'create',
    payload,
  })

  revalidatePath('/settings')
  revalidatePath('/', 'layout')
}

export async function createAcademicYearAction(formData: FormData) {
  const auth = await requireModuleAccess('settings')
  const admin = createSupabaseServiceClient()
  const payload = {
    label: String(formData.get('label') || '').trim(),
    starts_on: String(formData.get('starts_on') || ''),
    ends_on: String(formData.get('ends_on') || ''),
    is_active: String(formData.get('is_active') || '') === 'on',
  }
  await admin.from('academic_years').insert(payload)
  await logAuditEvent({ actorUserId: auth.userId, actorRole: auth.primaryRole, entityType: 'academic_years', action: 'create', payload })
  revalidatePath('/settings')
}

export async function createClassSectionAction(formData: FormData) {
  const auth = await requireModuleAccess('settings')
  const admin = createSupabaseServiceClient()
  const gradeLevel = Number(formData.get('grade_level') || 1)
  const sectionName = String(formData.get('section_name') || 'A').trim()
  const label = `Grade ${gradeLevel}`

  let classId: string | null = null
  const { data: existingClassRow } = await admin.from('classes').select('id').eq('grade_level', gradeLevel).maybeSingle()
  const existingClass = (existingClassRow || null) as { id: string } | null
  if (existingClass?.id) {
    classId = existingClass.id
  } else {
    const { data } = await admin.from('classes').insert({ grade_level: gradeLevel, label }).select('id').single()
    const classRow = data as { id: string }
    classId = classRow.id
  }

  await admin.from('sections').insert({ class_id: classId, section_name: sectionName })
  await logAuditEvent({
    actorUserId: auth.userId,
    actorRole: auth.primaryRole,
    entityType: 'sections',
    action: 'create',
    payload: { class_id: classId, section_name: sectionName, grade_level: gradeLevel },
  })
  revalidatePath('/settings')
}

export async function createStudentAction(formData: FormData) {
  const auth = await requireModuleAccess('students')
  const admin = createSupabaseServiceClient()

  const studentPayload = {
    student_id: String(formData.get('student_id') || '').trim(),
    first_name: String(formData.get('first_name') || '').trim(),
    last_name: String(formData.get('last_name') || '').trim(),
    date_of_birth: String(formData.get('date_of_birth') || '').trim() || null,
    gender: String(formData.get('gender') || 'Male'),
    grade: Number(formData.get('grade') || 1),
    section: String(formData.get('section') || 'A'),
    roll_number: Number(formData.get('roll_number') || 0) || null,
    enrollment_date: String(formData.get('enrollment_date') || new Date().toISOString().slice(0, 10)),
    status: String(formData.get('status') || 'active'),
    guardian_name: String(formData.get('guardian_name') || '').trim() || null,
    guardian_phone: String(formData.get('guardian_phone') || '').trim() || null,
    guardian_email: String(formData.get('guardian_email') || '').trim() || null,
    address: String(formData.get('address_line') || '').trim() || null,
  }

  const { data: studentRow } = await admin.from('students').insert(studentPayload).select('*').single()
  const student = studentRow as any

  try {
    const { data: activeYearRow } = await admin.from('academic_years').select('id,label').eq('is_active', true).maybeSingle()
    const { data: schoolClassRow } = await admin.from('classes').select('id').eq('grade_level', studentPayload.grade).maybeSingle()
    const activeYear = (activeYearRow || null) as { id: string; label?: string } | null
    const schoolClass = (schoolClassRow || null) as { id: string } | null
    const { data: sectionRow } = schoolClass?.id
      ? await admin.from('sections').select('id').eq('class_id', schoolClass.id).eq('section_name', studentPayload.section).maybeSingle()
      : { data: null as any }
    const section = (sectionRow || null) as { id: string } | null

    if (studentPayload.guardian_name) {
      await admin.from('student_guardians').insert({
        student_id: student.id,
        full_name: studentPayload.guardian_name,
        relationship: 'Guardian',
        phone: studentPayload.guardian_phone,
        email: studentPayload.guardian_email,
        is_primary: true,
      })
    }

    await admin.from('student_contacts').insert({
      student_id: student.id,
      address_line: studentPayload.address,
      emergency_contact_name: studentPayload.guardian_name,
      emergency_contact_phone: studentPayload.guardian_phone,
    })

    if (activeYear?.id && schoolClass?.id) {
      await admin.from('student_enrollments').insert({
        student_id: student.id,
        academic_year_id: activeYear.id,
        class_id: schoolClass.id,
        section_id: section?.id || null,
        roll_number: studentPayload.roll_number,
        status: studentPayload.status,
      })
    }
  } catch {
    // Legacy schema can still accept the primary student insert.
  }

  await logAuditEvent({
    actorUserId: auth.userId,
    actorRole: auth.primaryRole,
    entityType: 'students',
    entityId: student.id,
    action: 'create',
    payload: { student_id: student.student_id, grade: student.grade, section: student.section },
  })

  revalidatePath('/students')
  revalidatePath('/dashboard')
}

export async function createAdmissionAction(formData: FormData) {
  const auth = await requireModuleAccess('admissions')
  const admin = createSupabaseServiceClient()
  const payload = {
    child_name: String(formData.get('child_name') || '').trim(),
    grade_applied: Number(formData.get('grade_applied') || 1),
    parent_name: String(formData.get('parent_name') || '').trim(),
    parent_phone: String(formData.get('parent_phone') || '').trim() || null,
    parent_email: String(formData.get('parent_email') || '').trim() || null,
    source: String(formData.get('source') || '').trim() || null,
    status: String(formData.get('status') || 'new'),
    notes: String(formData.get('notes') || '').trim() || null,
  }
  await admin.from('admissions').insert(payload)
  await logAuditEvent({ actorUserId: auth.userId, actorRole: auth.primaryRole, entityType: 'admissions', action: 'create', payload })
  revalidatePath('/admissions')
  revalidatePath('/dashboard')
}

export async function convertAdmissionAction(formData: FormData) {
  const auth = await requireModuleAccess('admissions')
  const admin = createSupabaseServiceClient()
  const admissionId = String(formData.get('admission_id') || '')

  const { data: admissionRow } = await admin.from('admissions').select('*').eq('id', admissionId).single()
  const admission = admissionRow as any
  const studentId = `ADM-${Date.now().toString().slice(-6)}`

  const { data: studentRow } = await admin
    .from('students')
    .insert({
      student_id: studentId,
      first_name: admission.child_name.split(' ')[0] || admission.child_name,
      last_name: admission.child_name.split(' ').slice(1).join(' ') || 'Student',
      grade: admission.grade_applied,
      section: 'A',
      status: 'active',
      enrollment_date: new Date().toISOString().slice(0, 10),
      guardian_name: admission.parent_name,
      guardian_phone: admission.parent_phone,
      guardian_email: admission.parent_email,
    })
    .select('*')
    .single()
  const student = studentRow as any

  await admin.from('admissions').update({ status: 'enrolled', notes: admission.notes }).eq('id', admissionId)

  await logAuditEvent({
    actorUserId: auth.userId,
    actorRole: auth.primaryRole,
    entityType: 'admissions',
    entityId: admissionId,
    action: 'convert',
    payload: { student_id: student.id, generated_student_code: studentId },
  })

  revalidatePath('/admissions')
  revalidatePath('/students')
  revalidatePath('/dashboard')
}

export async function recordAttendanceAction(formData: FormData) {
  const auth = await requireModuleAccess('attendance')
  const admin = createSupabaseServiceClient()
  const attendanceDate = String(formData.get('attendance_date') || new Date().toISOString().slice(0, 10))
  const studentIds = formData.getAll('student_id').map(String)

  for (const studentId of studentIds) {
    const status = String(formData.get(`status_${studentId}`) || 'present')
    const remarks = String(formData.get(`remarks_${studentId}`) || '').trim() || null

    const { data: existingRow } = await admin.from('attendance').select('id').eq('student_id', studentId).eq('date', attendanceDate).maybeSingle()
    const existing = (existingRow || null) as { id: string } | null
    if (existing?.id) {
      await admin.from('attendance').update({ status, remarks }).eq('id', existing.id)
    } else {
      await admin.from('attendance').insert({ student_id: studentId, date: attendanceDate, status, remarks })
    }
  }

  await logAuditEvent({
    actorUserId: auth.userId,
    actorRole: auth.primaryRole,
    entityType: 'attendance',
    action: 'record',
    payload: { attendance_date: attendanceDate, students: studentIds.length },
  })

  revalidatePath('/attendance')
  revalidatePath('/dashboard')
}

export async function recordFeePaymentAction(formData: FormData) {
  const auth = await requireModuleAccess('fees')
  const admin = createSupabaseServiceClient()
  const studentId = String(formData.get('student_id') || '')
  const amount = Number(formData.get('amount') || 0)
  const paymentDate = String(formData.get('payment_date') || new Date().toISOString().slice(0, 10))
  const paymentMode = String(formData.get('payment_mode') || 'cash')
  const paymentType = String(formData.get('payment_type') || 'tuition')

  const receiptNumber = `RCPT-${Date.now().toString().slice(-8)}`

  await admin.from('fee_payments').insert({
    student_id: studentId,
    academic_year: '2024-25',
    payment_type: paymentType,
    amount,
    payment_date: paymentDate,
    payment_mode: paymentMode,
    receipt_number: receiptNumber,
    recorded_by: auth.fullName,
  })

  const { data: dueRow } = await admin.from('fee_dues').select('*').eq('student_id', studentId).eq('academic_year', '2024-25').maybeSingle()
  const due = dueRow as any
  if (due?.id) {
    await admin
      .from('fee_dues')
      .update({ total_paid: Number(due.total_paid || 0) + amount, last_payment_date: paymentDate, updated_at: new Date().toISOString() })
      .eq('id', due.id)
  } else {
    await admin.from('fee_dues').insert({ student_id: studentId, academic_year: '2024-25', total_billed: 0, total_paid: amount, last_payment_date: paymentDate })
  }

  try {
    await admin.from('payment_receipts').insert({
      student_id: studentId,
      receipt_number: receiptNumber,
      amount_received: amount,
      received_on: paymentDate,
      payment_mode: paymentMode,
    })
  } catch {
    // Receipt table requires migration; payment is still recorded in the legacy ledger.
  }

  await logAuditEvent({
    actorUserId: auth.userId,
    actorRole: auth.primaryRole,
    entityType: 'fee_payments',
    entityId: receiptNumber,
    action: 'record',
    payload: { student_id: studentId, amount, payment_mode: paymentMode },
  })

  revalidatePath('/fees')
  revalidatePath('/dashboard')
}

export async function createStaffProfileAction(formData: FormData) {
  const auth = await requireModuleAccess('staff')
  const admin = createSupabaseServiceClient()
  const fullName = String(formData.get('full_name') || '').trim()
  const email = String(formData.get('email') || '').trim() || null
  const designation = String(formData.get('designation') || '').trim()
  const department = String(formData.get('department') || '').trim()
  const role = String(formData.get('role') || 'office_staff')

  try {
    const { data: profileRow } = await admin
      .from('staff_profiles')
      .insert({
        full_name: fullName,
        email,
        designation,
        department,
        phone: String(formData.get('phone') || '').trim() || null,
        joining_date: String(formData.get('joining_date') || '').trim() || null,
        status: String(formData.get('status') || 'active'),
      })
      .select('*')
      .single()
    const profile = profileRow as any

    if (profile.user_id) {
      await admin.from('user_roles').insert({ user_id: profile.user_id, role })
    }
  } catch {
    await admin.from('staff').insert({
      full_name: fullName,
      email,
      role: designation,
      department,
      phone: String(formData.get('phone') || '').trim() || null,
      status: String(formData.get('status') || 'active'),
    })
  }

  await logAuditEvent({
    actorUserId: auth.userId,
    actorRole: auth.primaryRole,
    entityType: 'staff_profiles',
    action: 'create',
    payload: { full_name: fullName, designation, department, role },
  })

  revalidatePath('/staff')
  revalidatePath('/dashboard')
}

export async function assignUserRoleAction(formData: FormData) {
  const auth = await requireModuleAccess('settings')
  const admin = createSupabaseServiceClient()
  const userId = String(formData.get('user_id') || '')
  const role = String(formData.get('role') || '')

  if (!userId || !role) return

  const { data: existingRow } = await admin.from('user_roles').select('id').eq('user_id', userId).eq('role', role).maybeSingle()
  const existing = (existingRow || null) as { id: string } | null

  if (!existing?.id) {
    await admin.from('user_roles').insert({ user_id: userId, role })
    await logAuditEvent({
      actorUserId: auth.userId,
      actorRole: auth.primaryRole,
      entityType: 'user_roles',
      entityId: userId,
      action: 'assign_role',
      payload: { user_id: userId, role },
    })
  }

  revalidatePath('/settings')
}
