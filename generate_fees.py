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

fee_structure_sql += ",\n".join(fee_structure_values) + ";"

# Generate fee_dues entries for all students
fee_dues_sql = "INSERT INTO fee_dues (student_id, academic_year, total_billed, total_paid) VALUES\n"
fee_dues_values = []

# Track which students have paid what for payment records later
payment_records = []

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
        
        val = f"('{student_id}', '{academic_year}', {total_billed}, {total_paid})"
        fee_dues_values.append(val)
        
        # Store for payment records
        payment_records.append({
            'student_id': student_id,
            'grade': grade,
            'total_billed': total_billed,
            'total_paid': total_paid,
            'status': payment_status,
            'fees': fees
        })

fee_dues_sql += ",\n".join(fee_dues_values) + ";"

# Generate fee_payment records (show some detail of payments made)
fee_payments_sql = "INSERT INTO fee_payments (student_id, academic_year, month, payment_type, amount, payment_date, payment_mode, receipt_number, recorded_by) VALUES\n"
fee_payment_values = []
receipt_counter = 10001

for record in payment_records:
    if record['total_paid'] > 0:
        student_id = record['student_id']
        total_paid = record['total_paid']
        status = record['status']
        fees = record['fees']
        
        if status == "full":
            # One lump sum payment
            payment_date = f"2024-{random.randint(4,12):02d}-{random.randint(1,28):02d}"
            payment_type = random.choice(['full', 'tuition', 'misc'])
            payment_mode = random.choice(payment_modes)
            receipt = f"RCP{receipt_counter}"
            receipt_counter += 1
            val = f"('{student_id}', '{academic_year}', NULL, '{payment_type}', {total_paid}, '{payment_date}', '{payment_mode}', '{receipt}', 'admin')"
            fee_payment_values.append(val)
        else:
            # Multiple payments
            remaining = total_paid
            payments_made = 0
            
            # Randomly decide to pay tuition first, then others
            payment_types_order = ['tuition', 'transport', 'exam', 'sports', 'misc']
            random.shuffle(payment_types_order)
            
            for ptype in payment_types_order:
                if remaining <= 0:
                    break
                
                fee_amount = fees.get(ptype, 0)
                if fee_amount > 0:
                    # Pay this fee or partial
                    if remaining >= fee_amount:
                        amount_to_pay = fee_amount
                        remaining -= fee_amount
                    else:
                        amount_to_pay = remaining
                        remaining = 0
                    
                    payment_date = f"2024-{random.randint(4,12):02d}-{random.randint(1,28):02d}"
                    payment_mode = random.choice(payment_modes)
                    receipt = f"RCP{receipt_counter}"
                    receipt_counter += 1
                    month_names = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                    month = random.choice(month_names)
                    val = f"('{student_id}', '{academic_year}', '{month}', '{ptype}', {amount_to_pay}, '{payment_date}', '{payment_mode}', '{receipt}', 'admin')"
                    fee_payment_values.append(val)
                    
                    payments_made += 1
                    if payments_made >= 3:  # Max 3 payment records per student
                        break

# Combine all SQL statements
all_sql = fee_structure_sql + "\n\n" + fee_dues_sql + "\n\n"
if fee_payment_values:
    all_sql += fee_payments_sql + ",\n".join(fee_payment_values) + ";"

print(all_sql)
