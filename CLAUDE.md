# CLAUDE.md — Tamm Web Standing Instructions

## 1. Project Context

This is tamm_web — Next.js 16 web app for Tamm platform (AC & solar energy services, Yemen).
It shares the same Supabase database with tamm_app (Flutter).
Roles: customer + manager only. Technician → redirected to /access-denied (Flutter handles them).

## 2. Git — Auto Push After Every Change

After completing ANY task that modifies files:
1. git add -A
2. git commit -m "descriptive message in English"
3. git push origin main

Always confirm push succeeded before reporting task complete.

## 3. Cross-Project Sync Warning

Before finishing any task, check if the change affects tamm_app (Flutter).
If YES — stop and tell the user exactly:
- What was changed
- Which file(s) in tamm_app need the same change
- Whether it is a database change (affects both projects immediately)

Changes that ALWAYS affect both projects:
- Supabase table schema changes or new migrations
- New columns or renamed columns
- RLS policy changes
- Edge Function changes
- New order statuses or types
- New user roles or permissions

## 4. Database Changes

- Always write a SQL migration file in supabase/migrations/
- Never modify the database directly without a migration file
- After schema changes, update TypeScript types in lib/types/
- Notify the user to apply the same model changes in tamm_app/lib/shared/models/

## 5. Code Quality Rules

- Use CSS custom properties var(--token) — never hardcoded colors
- All UI text must be in Arabic
- Supabase errors must be mapped to Arabic messages
- Data fetching: lib/data/ for reads, lib/actions/ for mutations only
- Always call revalidatePath() after every mutation
- Prices: always use formatPrice() from lib/utils/format.ts — never raw toLocaleString
- Numbers in prices must use Western/Latin numerals (en-SA) not Arabic-Indic numerals
- RTL layout: dir="rtl" is set globally — never override it

## 6. Before Reporting Any Task Complete

- [ ] Code compiles without errors
- [ ] Git pushed to main successfully
- [ ] Cross-project impact checked and reported to user
- [ ] No hardcoded colors, spacing, or strings
- [ ] All UI text is in Arabic
- [ ] Price formatting uses formatPrice() utility
