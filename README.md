# SchoolOS — School Management ERP

A full-stack school ERP built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## Features

| Module | What it does |
|---|---|
| **Dashboard** | Live overview — student count, fee totals, outstanding dues, quick actions |
| **Students** | Full student registry with search/filter by grade/status, add/edit/delete, guardian info |
| **Fees** | Per-student payment recording, dues tracking, payment history modal, defaulter list |
| **Academics** | Mark entry grid per grade & exam, color-coded performance, grade letters |
| **Documents** | Per-student document checklist (10 doc types), manual status updates (pending → submitted → verified), notes |
| **Finance** | Area chart (monthly collection + forecast), bar chart (dues by grade), pie chart (payment modes), fee structure table, 1–6 month projections |

---

## Quick Start

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the entire contents of `supabase/schema.sql` and run it
3. Copy your **Project URL** and **anon key** from Settings → API

### 2. Environment

```bash
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
schoolos/
├── app/
│   ├── globals.css          # Design tokens, utility classes
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # App shell + sidebar + routing
├── components/
│   └── modules/
│       ├── Dashboard.tsx    # Overview stats + quick actions
│       ├── Students.tsx     # Student registry
│       ├── Fees.tsx         # Fee management
│       ├── Academics.tsx    # Marks & performance
│       ├── Documents.tsx    # Document verification
│       └── Finance.tsx      # Financial dashboard
├── lib/
│   └── supabase.ts          # Supabase client + all types + helpers
└── supabase/
    └── schema.sql           # Full DB schema + seed data
```

---

## Database Schema

- `students` — core student profiles
- `fee_structure` — annual fee breakdown per grade
- `fee_payments` — individual payment transactions
- `fee_dues` — running balance per student per year
- `subjects` — subject registry per grade
- `academic_records` — marks per student/subject/exam
- `attendance` — daily attendance (ready, UI not yet built)
- `documents` — document checklist per student
- `announcements` — notices (ready, UI not yet built)

---

## Extending

**Add authentication:** Supabase Auth with `@supabase/ssr` + middleware for login/role protection.

**Add attendance UI:** Table `attendance` is schema-ready. Build a date-picker grid similar to the marks grid.

**Add report card PDF:** Use `@react-pdf/renderer` to generate per-student PDFs from `academic_records`.

**Add notifications:** Trigger edge functions on payment or document status changes to send SMS/email.

**Role-based access:** Add a `staff` table linked to Supabase auth, restrict write operations by role.
