import random
from datetime import datetime, timedelta

# Common Indian names
male_first = ['Rahul', 'Arjun', 'Vikram', 'Karan', 'Rohan', 'Aryan', 'Aditya', 'Rohit', 'Sameer', 'Naveen', 'Suresh', 'Ramesh', 'Amit', 'Rajesh', 'Manoj', 'Vijay', 'Anil', 'Sunil', 'Prakash', 'Mahesh', 'Dinesh', 'Raj', 'Kumar', 'Shyam', 'Ram', 'Hari', 'Gopal', 'Krishna', 'Shankar', 'Vishnu', 'Bharat', 'Ashok', 'Vinod', 'Sanjay', 'Ajay', 'Ravi', 'Mohan', 'Dev', 'Narayan', 'Laxman']
female_first = ['Priya', 'Anjali', 'Meera', 'Pooja', 'Kavita', 'Sunita', 'Rekha', 'Neha', 'Aisha', 'Fatima', 'Sarika', 'Kiran', 'Lata', 'Geeta', 'Seema', 'Rita', 'Nita', 'Vandana', 'Madhuri', 'Kavita', 'Shobha', 'Usha', 'Indu', 'Kumari', 'Devi', 'Maya', 'Rina', 'Tina', 'Nina', 'Mina', 'Sita', 'Radha', 'Lakshmi', 'Parvati', 'Durga', 'Kali', 'Saraswati', 'Ganga', 'Yamuna', 'Narmada']
last_names = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Verma', 'Jain', 'Agarwal', 'Yadav', 'Chauhan', 'Rathore', 'Thakur', 'Pandey', 'Mishra', 'Tiwari', 'Dubey', 'Saxena', 'Chaturvedi', 'Trivedi', 'Shukla', 'Garg', 'Bansal', 'Khandelwal', 'Ahuja', 'Khanna', 'Kapoor', 'Malhotra', 'Chopra', 'Seth', 'Bhatia', 'Goel', 'Arora', 'Mehrotra', 'Srivastava', 'Mathur', 'Nanda', 'Bajaj', 'Dhingra', 'Kohli', 'Gill']

# Cities for addresses
cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra']

# Generate DOB based on grade
def generate_dob(grade):
    base_age = grade + 5  # grade 1: 6, grade 8: 13
    current_year = 2026
    birth_year = current_year - base_age
    # Random month and day
    month = random.randint(1, 12)
    if month in [1,3,5,7,8,10,12]:
        day = random.randint(1,31)
    elif month == 2:
        day = random.randint(1,28)
    else:
        day = random.randint(1,30)
    return f"{birth_year}-{month:02d}-{day:02d}"

# Generate phone
def generate_phone():
    return f"+91{random.randint(6000000000, 9999999999)}"

# Generate email
def generate_email(first, last):
    domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
    return f"{first.lower()}.{last.lower()}@{random.choice(domains)}"

# Generate address
def generate_address():
    house_no = random.randint(1, 999)
    street = random.choice(['Main Road', 'Station Road', 'Market Street', 'Park Avenue', 'Garden Colony', 'Sector', 'Phase'])
    city = random.choice(cities)
    return f"{house_no} {street}, {city}"

# Sections
sections = ['A', 'B', 'C']

# Generate students
students = []
student_counter = 1
grades_students = {g: [] for g in range(1,9)}

# Distribute: 37 per grade for 1-7, 41 for 8
for grade in range(1,8):
    num = 37
    for i in range(num):
        gender = random.choice(['Male', 'Female'])
        if gender == 'Male':
            first = random.choice(male_first)
        else:
            first = random.choice(female_first)
        last = random.choice(last_names)
        dob = generate_dob(grade)
        section = random.choice(sections)
        roll = len(grades_students[grade]) + 1
        student_id = f"SCH-2024-{student_counter:03d}"
        guardian_name = f"{random.choice(male_first)} {random.choice(last_names)}"
        guardian_phone = generate_phone()
        guardian_email = generate_email(guardian_name.split()[0], guardian_name.split()[1])
        address = generate_address()
        status = 'active'
        enrollment_date = '2024-04-01'  # Assume April 1, 2024

        student = {
            'student_id': student_id,
            'first_name': first,
            'last_name': last,
            'date_of_birth': dob,
            'gender': gender,
            'grade': grade,
            'section': section,
            'roll_number': roll,
            'enrollment_date': enrollment_date,
            'status': status,
            'guardian_name': guardian_name,
            'guardian_phone': guardian_phone,
            'guardian_email': guardian_email,
            'address': address,
            'photo_url': None
        }
        grades_students[grade].append(student)
        students.append(student)
        student_counter += 1

# Grade 8: 41
grade = 8
num = 41
for i in range(num):
    gender = random.choice(['Male', 'Female'])
    if gender == 'Male':
        first = random.choice(male_first)
    else:
        first = random.choice(female_first)
    last = random.choice(last_names)
    dob = generate_dob(grade)
    section = random.choice(sections)
    roll = len(grades_students[grade]) + 1
    student_id = f"SCH-2024-{student_counter:03d}"
    guardian_name = f"{random.choice(male_first)} {random.choice(last_names)}"
    guardian_phone = generate_phone()
    guardian_email = generate_email(guardian_name.split()[0], guardian_name.split()[1])
    address = generate_address()
    status = 'active'
    enrollment_date = '2024-04-01'

    student = {
        'student_id': student_id,
        'first_name': first,
        'last_name': last,
        'date_of_birth': dob,
        'gender': gender,
        'grade': grade,
        'section': section,
        'roll_number': roll,
        'enrollment_date': enrollment_date,
        'status': status,
        'guardian_name': guardian_name,
        'guardian_phone': guardian_phone,
        'guardian_email': guardian_email,
        'address': address,
        'photo_url': None
    }
    grades_students[grade].append(student)
    students.append(student)
    student_counter += 1

# Now generate SQL
sql = "INSERT INTO students (student_id, first_name, last_name, date_of_birth, gender, grade, section, roll_number, enrollment_date, status, guardian_name, guardian_phone, guardian_email, address, photo_url) VALUES\n"

values = []
for s in students:
    val = f"('{s['student_id']}', '{s['first_name']}', '{s['last_name']}', '{s['date_of_birth']}', '{s['gender']}', {s['grade']}, '{s['section']}', {s['roll_number']}, '{s['enrollment_date']}', '{s['status']}', '{s['guardian_name']}', '{s['guardian_phone']}', '{s['guardian_email']}', '{s['address']}', NULL)"
    values.append(val)

sql += ",\n".join(values) + ";"

print(sql)