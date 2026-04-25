import { createSupabaseServiceClient } from '@/lib/supabase-service'
import { formatINR } from '@/types/domain'

export async function getDashboardSnapshot() {
  const admin = createSupabaseServiceClient()
  const [studentsRes, duesRes, paymentsRes, admissionsRes] = await Promise.all([
    admin.from('students').select('id,grade,status'),
    admin.from('fee_dues').select('outstanding,total_paid'),
    admin.from('fee_payments').select('amount,payment_date').order('payment_date', { ascending: false }).limit(8),
    admin.from('admissions').select('status'),
  ])

  const students = studentsRes.data || []
  const dues = duesRes.data || []
  const payments = paymentsRes.data || []
  const admissions = admissionsRes.data || []

  const totalStudents = students.length
  const activeStudents = students.filter((student: any) => student.status === 'active').length
  const outstanding = dues.reduce((sum: number, row: any) => sum + Number(row.outstanding || 0), 0)
  const collected = dues.reduce((sum: number, row: any) => sum + Number(row.total_paid || 0), 0)

  return {
    totalStudents,
    activeStudents,
    outstanding,
    outstandingLabel: formatINR(outstanding),
    collected,
    collectedLabel: formatINR(collected),
    recentPayments: payments,
    admissions,
    gradeDistribution: [1, 2, 3, 4, 5, 6, 7, 8].map((grade) => ({
      grade,
      count: students.filter((student: any) => student.grade === grade).length,
    })),
  }
}
