import random
from datetime import datetime, timedelta

# Academic year
academic_year = "2024-25"

# Fee structure by grade (in rupees)
fee_tiers = {
    1: {'tuition': 15000, 'admission': 2000, 'exam': 1000, 'sports': 1000, 'transport': 3000, 'misc': 1000},
    2: {'tuition': 15000, 'admission': 0, 'exam': 1000, 'sports': 1000, 'transport': 3000, 'misc': 1000},
    3: {'tuition': 18000, 'admission': 0, 'exam': 1200, 'sports': 1200, 'transport': 3500, 'misc': 1000},
    4: {'tuition': 18000, 'admission': 0, 'exam': 1200, 'sports': 1200, 'transport': 3500, 'misc': 1000},
    5: {'tuition': 20000, 'admission': 0, 'exam': 1500, 'sports': 1500, 'transport': 4000, 'misc': 1000},
    6: {'tuition': 20000, 'admission': 0, 'exam': 1500, 'sports': 1500, 'transport': 4000, 'misc': 1000},
    7: {'tuition': 22000, 'admission': 0, 'exam': 1500, 'sports': 1500, 'transport': 4000, 'misc': 1500},
    8: {'tuition': 22000, 'admission': 0, 'exam': 1500, 'sports': 1500, 'transport': 4000, 'misc': 1500},
}

# Payment modes
payment_modes = ['cash', 'online', 'cheque', 'upi', 'bank_transfer']

# Student data (300 students, grades 1-8)
# Grade 1-7: 37 students each (259 total)
# Grade 8: 41 students
students_by_grade = {}
for grade in range(1, 9):
    if grade <= 7:
        students_by_grade[grade] = list(range((grade-1)*37 + 1, grade*37 + 1))
    else:
        students_by_grade[grade] = list(range(259 + 1, 300 + 1))

# Generate SQL for fee_structure
fee_structure_sql = "INSERT INTO fee_structure (grade, academic_year, tuition_fee, admission_fee, exam_fee, sports_fee, transport_fee, misc_fee) VALUES\n"
fee_structure_values = []
for grade in range(1, 9):
    fees = fee_tiers[grade]
    val = f"({grade}, '{academic_year}', {fees['tuition']}, {fees['admission']}, {fees['exam']}, {fees['sports']}, {fees['transport']}, {fees['misc']})"
    fee_structure_values.append(val)

fee_structure_sql += ",\n".join(fee_structure_values) + "\n"
fee_structure_sql += "ON CONFLICT (grade, academic_year) DO UPDATE SET\n"
fee_structure_sql += "  tuition_fee = EXCLUDED.tuition_fee,\n"
fee_structure_sql += "  admission_fee = EXCLUDED.admission_fee,\n"
fee_structure_sql += "  exam_fee = EXCLUDED.exam_fee,\n"
fee_structure_sql += "  sports_fee = EXCLUDED.sports_fee,\n"
fee_structure_sql += "  transport_fee = EXCLUDED.transport_fee,\n"
fee_structure_sql += "  misc_fee = EXCLUDED.misc_fee;\n"

# Generate fee_dues entries using INSERT INTO ... SELECT
# This will join with the students table to get the correct UUID ids
fee_dues_cte = """
WITH fee_data AS (
  SELECT 
    s.id,
    '{academic_year}' as academic_year,
    CASE 
      WHEN g.grade <= 7 THEN 23000 + (g.grade - 1) * 2000
      WHEN g.grade = 8 THEN 30500
    END as total_billed,
    NULL::numeric as total_paid_calc
  FROM (
    SELECT DISTINCT grade FROM (
""".format(academic_year=academic_year)

# Build the grade list with student counts
student_entries = []
for grade in range(1, 9):
    if grade <= 7:
        num_students = 37
    else:
        num_students = 41
    for i in range(num_students):
        student_num = (grade-1)*37 + i + 1 if grade <= 7 else 259 + i + 1
        student_entries.append(f"      SELECT {grade} as grade, 'SCH-2024-{student_num:03d}' as sid")

# Actually, let's use a simpler approach with direct values

fee_dues_values = []
for grade in range(1, 9):
    fees = fee_tiers[grade]
    total_billed = fees['tuition'] + fees['admission'] + fees['exam'] + fees['sports'] + fees['transport'] + fees['misc']
    
    for student_num in students_by_grade[grade]:
        student_id = f"SCH-2024-{student_num:03d}"
        
        # Generate payment status: 40% fully paid, 40% partially paid, 20% not paid
        rand = random.random()
        if rand < 0.40:
            # Fully paid
            total_paid = total_billed
            payment_status = "full"
        elif rand < 0.80:
            # Partially paid (50-90% of fees)
            paid_percentage = random.randint(50, 90) / 100
            total_paid = int(total_billed * paid_percentage)
            payment_status = "partial"
        else:
            # Not paid
            total_paid = 0
            payment_status = "none"
        
        fee_dues_values.append({
            'student_id': student_id,
            'total_billed': total_billed,
            'total_paid': total_paid,
            'status': payment_status,
            'grade': grade,
            'fees': fees
        })

# Generate SQL using subquery to get the UUID
fee_dues_sql = f"""INSERT INTO fee_dues (student_id, academic_year, total_billed, total_paid)
SELECT 
  s.id,
  '{academic_year}',
  (SELECT CASE 
    WHEN s.grade = 1 THEN 23000
    WHEN s.grade = 2 THEN 21000
    WHEN s.grade = 3 THEN 24900
    WHEN s.grade = 4 THEN 24900
    WHEN s.grade = 5 THEN 28000
    WHEN s.grade = 6 THEN 28000
    WHEN s.grade = 7 THEN 30500
    WHEN s.grade = 8 THEN 30500
  END) as total_billed,
  0 as total_paid
FROM students s
WHERE s.grade IS NOT NULL;
"""

# But wait, the original approach would be simpler. Let me use a VALUES clause with JOIN
# Actually, the simplest is to use CASE statements to calculate total_billed based on grade

fee_dues_sql = f"""INSERT INTO fee_dues (student_id, academic_year, total_billed, total_paid)
SELECT 
  id,
  '{academic_year}',
  CASE 
    WHEN grade = 1 THEN 23000
    WHEN grade = 2 THEN 21000
    WHEN grade = 3 THEN 24900
    WHEN grade = 4 THEN 24900
    WHEN grade = 5 THEN 28000
    WHEN grade = 6 THEN 28000
    WHEN grade = 7 THEN 30500
    WHEN grade = 8 THEN 30500
  END as total_billed,
  CASE 
    WHEN random() < 0.40 THEN CASE 
      WHEN grade = 1 THEN 23000
      WHEN grade = 2 THEN 21000
      WHEN grade = 3 THEN 24900
      WHEN grade = 4 THEN 24900
      WHEN grade = 5 THEN 28000
      WHEN grade = 6 THEN 28000
      WHEN grade = 7 THEN 30500
      WHEN grade = 8 THEN 30500
    END
    WHEN random() < 0.80 THEN (CASE 
      WHEN grade = 1 THEN 23000
      WHEN grade = 2 THEN 21000
      WHEN grade = 3 THEN 24900
      WHEN grade = 4 THEN 24900
      WHEN grade = 5 THEN 28000
      WHEN grade = 6 THEN 28000
      WHEN grade = 7 THEN 30500
      WHEN grade = 8 THEN 30500
    END) * (0.5 + random() * 0.4)::int
    ELSE 0
  END as total_paid
FROM students
ORDER BY student_id;
"""

# Simpler: just generate payment data in Python then use it
payment_records = []
for fd in fee_dues_values:
    payment_records.append(fd)

# For fee_payments, we need a more complex approach
# Let's generate a CTE with payment data

fee_payments_sql = """INSERT INTO fee_payments (student_id, academic_year, month, payment_type, amount, payment_date, payment_mode, receipt_number, recorded_by)
SELECT 
  s.id,
  '{academic_year}',
  NULL,
  'full',
  CASE 
    WHEN s.grade = 1 THEN 23000
    WHEN s.grade = 2 THEN 21000
    WHEN s.grade = 3 THEN 24900
    WHEN s.grade = 4 THEN 24900
    WHEN s.grade = 5 THEN 28000
    WHEN s.grade = 6 THEN 28000
    WHEN s.grade = 7 THEN 30500
    WHEN s.grade = 8 THEN 30500
  END as amount,
  '2024-' || LPAD((4 + floor(random() * 9))::text, 2, '0') || '-' || LPAD((1 + floor(random() * 28))::text, 2, '0') as payment_date,
  (ARRAY['cash', 'online', 'cheque', 'upi', 'bank_transfer'])[floor(random() * 5)::int + 1] as payment_mode,
  'RCP' || (10000 + row_number() OVER (ORDER BY s.id))::text as receipt_number,
  'admin'
FROM students s
WHERE random() < 0.40;
""".format(academic_year=academic_year)

all_sql = fee_structure_sql + "\n\n" + fee_dues_sql + "\n\n" + fee_payments_sql

print(all_sql)
