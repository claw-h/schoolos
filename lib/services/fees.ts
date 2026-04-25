import { createSupabaseServiceClient } from '@/lib/supabase-service'
import type { FeeAccount, FeeDue, PaymentReceipt, Student } from '@/types/domain'

export async function getFeeAccounts(): Promise<FeeAccount[]> {
  const admin = createSupabaseServiceClient()
  const [studentsRes, duesRes] = await Promise.all([
    admin.from('students').select('*').eq('status', 'active').order('grade').order('roll_number'),
    admin.from('fee_dues').select('*').eq('academic_year', '2024-25'),
  ])

  let receiptRows: PaymentReceipt[] = []
  try {
    const { data } = await admin.from('payment_receipts').select('*').order('received_on', { ascending: false })
    receiptRows = (data || []) as PaymentReceipt[]
  } catch {
    try {
      const { data } = await admin.from('fee_payments').select('*').order('payment_date', { ascending: false })
      receiptRows = (data || []).map((row: any) => ({
        id: row.id,
        student_id: row.student_id,
        receipt_number: row.receipt_number || `LEG-${row.id.slice(0, 6)}`,
        amount_received: row.amount,
        received_on: row.payment_date,
        payment_mode: row.payment_mode,
      }))
    } catch {
      receiptRows = []
    }
  }

  const students = (studentsRes.data || []) as Student[]
  const dues = (duesRes.data || []) as FeeDue[]

  return students.map((student) => {
    const due = dues.find((row) => row.student_id === student.id)
    const receipts = receiptRows.filter((receipt) => receipt.student_id === student.id).slice(0, 5)
    return {
      student,
      billed: due?.total_billed || 0,
      paid: due?.total_paid || receipts.reduce((sum, receipt) => sum + receipt.amount_received, 0),
      balance: due?.outstanding || Math.max((due?.total_billed || 0) - receipts.reduce((sum, receipt) => sum + receipt.amount_received, 0), 0),
      receipts,
    }
  })
}
