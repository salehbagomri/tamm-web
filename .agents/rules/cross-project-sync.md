---
trigger: always_on
---

# Tamm Web — Next.js Agent Rules

## Project Architecture

This project (Next.js Web) is part of a two-app ecosystem:
- **Next.js Web**     → Customer + Admin (this project)
- **Flutter Android** → Customer + Technician (separate project)
- **Supabase**        → Shared database and auth between both

Both projects are independent codebases sharing the same
Supabase instance. Any change affecting shared logic must
be reflected in both projects.

---

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- Supabase JS Client v2 + @supabase/ssr
- Fonts: Google Fonts (Harmattan for Arabic)
- Theme: Dark Mode only (CSS Variables from Tamm color system)
- Language: Arabic (RTL) — UI text in Arabic, code in English

## Color System (never change these values)
--bg-primary:   #080E18
--bg-surface:   #0D1825
--bg-surface2:  #121F30
--border:       #1A2E44
--blue-dark:    #0A2540
--blue-mid:     #0E4C8C
--blue-primary: #1576D4
--blue-light:   #3E9EF5
--blue-sky:     #8DCBFA
--text-primary: #E8F0F8
--text-second:  #7A96B0
--text-faint:   #3E5468
--success:      #22C98A
--error:        #E05252
--warning:      #F5A623

---

## Project Structure

app/
├── (auth)/         → login, register (no navbar)
├── (customer)/     → customer-facing pages (with navbar)
└── (admin)/        → admin dashboard (with sidebar)

components/
├── ui/             → shared base components
├── customer/       → customer-specific components
└── admin/          → admin-specific components

lib/
├── supabase/       → client.ts (browser) + server.ts (SSR)
├── types/          → user.ts, order.ts, product.ts, service.ts
└── utils/          → auth helpers

---

## Code Rules

- All code in English, all comments and UI text in Arabic
- TypeScript strict mode — no any types
- Never add new packages without explicit approval
- Never modify database schema without writing a SQL migration
- Always use existing types: Order, Product, ServiceType, UserProfile
- Never modify type structure without explicit approval
- Always use CSS Variables for colors — never hardcode hex values
- Always maintain RTL direction and Arabic language support
- Use Server Components by default — Client Components only when needed

---

## Route Protection Rules

/admin/*    → manager only
             customer attempt → redirect /home

/(customer)/* → customer only
               manager attempt → redirect /admin/dashboard

/(auth)/*   → unauthenticated only
             authenticated → redirect by role

/ (root)    → redirect by session:
             no session → /login
             customer   → /home
             manager    → /admin/dashboard

---

## Git Rules

After every successful change or fix, always:

1. Stage all modified files
   git add .

2. Commit with a clear descriptive message in this format:
   git commit -m "feat: [what was added]"
   git commit -m "fix: [what was fixed]"
   git commit -m "refactor: [what was refactored]"
   git commit -m "chore: [dependency or config change]"

3. Push to main branch immediately
   git push origin main

Never leave changes uncommitted after a completed task.
Always push before ending the session.

---

## Cross-Project Sync Rule

After any change or fix, evaluate whether it falls under
any of these categories and notify me immediately if so:

### Triggers that affect Flutter Android:

1. **Supabase changes**
   - Added, modified, or deleted table or column
   - Changed RLS policies
   - Modified Edge Functions
   - Added SQL Migration

2. **Data type changes**
   - Modified Order, Product, UserProfile, or ServiceType
   - Added new field or changed existing field type

3. **Customer business logic changes**
   - Changed order flow or status transitions
   - Changed pricing calculation logic
   - Changed validation rules

4. **Customer UX changes**
   - Changed flow of any customer-facing page
   - Added new step to any customer process

### Notification format:

When any trigger above is detected, append this to your response:

⚠️ Flutter Android Impact:
- What changed exactly
- Which file or table
- What needs to be updated in the Flutter project

If the change is UI-only and does not affect any of the above,
no notification needed — continue normally.

---

## Before Every Response

Ask yourself:
- Does this change affect Supabase? → notify
- Does this change affect a shared data type? → notify
- Does this change affect customer-facing logic or flow? → notify
- Is this UI-only? → no notification needed
- Did I commit and push after completing the task? → always yes