INSERT INTO fee_structure (grade, academic_year, tuition_fee, admission_fee, exam_fee, sports_fee, transport_fee, misc_fee) VALUES
(1, '2024-25', 15000, 2000, 1000, 1000, 3000, 1000),
(2, '2024-25', 15000, 0, 1000, 1000, 3000, 1000),
(3, '2024-25', 18000, 0, 1200, 1200, 3500, 1000),
(4, '2024-25', 18000, 0, 1200, 1200, 3500, 1000),
(5, '2024-25', 20000, 0, 1500, 1500, 4000, 1000),
(6, '2024-25', 20000, 0, 1500, 1500, 4000, 1000),
(7, '2024-25', 22000, 0, 1500, 1500, 4000, 1500),
(8, '2024-25', 22000, 0, 1500, 1500, 4000, 1500)
ON CONFLICT (grade, academic_year) DO UPDATE SET
  tuition_fee = EXCLUDED.tuition_fee,
  admission_fee = EXCLUDED.admission_fee,
  exam_fee = EXCLUDED.exam_fee,
  sports_fee = EXCLUDED.sports_fee,
  transport_fee = EXCLUDED.transport_fee,
  misc_fee = EXCLUDED.misc_fee;


INSERT INTO fee_dues (student_id, academic_year, total_billed, total_paid)
SELECT 
  id,
  '2024-25',
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


INSERT INTO fee_payments (student_id, academic_year, month, payment_type, amount, payment_date, payment_mode, receipt_number, recorded_by)
SELECT 
  s.id,
  '2024-25',
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
  ('2024-' || LPAD((4 + floor(random() * 9))::text, 2, '0') || '-' || LPAD((1 + floor(random() * 28))::text, 2, '0'))::date as payment_date,
  (ARRAY['cash', 'online', 'cheque', 'upi', 'bank_transfer'])[floor(random() * 5)::int + 1] as payment_mode,
  'RCP' || (10000 + row_number() OVER (ORDER BY s.id))::text as receipt_number,
  'admin'
FROM students s
WHERE random() < 0.40;

