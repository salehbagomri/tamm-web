# tamm_web — Comprehensive Project Summary

> Generated: 2026-05-14

---

## 1. Overview

**tamm_web** is a full-stack Arabic-language home-services marketplace focused on air-conditioning and solar-energy services. It is the web counterpart of a Flutter mobile app (type definitions are explicitly noted as "ported from Flutter"). The platform serves three distinct roles:

- **Customer** — browse services/products, place orders, track status, request quotes
- **Manager (Admin)** — full back-office: orders, quotes, products, services, technicians, promotions
- **Technician** — accounts exist but the web app has no technician portal; that side lives in the Flutter app (web redirects them to `/access-denied`)

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (React 19, TypeScript) |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Auth | Supabase Auth — Email/Password + Google OAuth |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Font | Alexandria (Google Fonts — Arabic + Latin) |
| Deployment | Firebase Hosting with Next.js framework backend (`us-central1`) |
| State | React Context (cart) + React `cache()` (server dedup) |

---

## 3. Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_SITE_URL` | Site origin — used for password-reset redirect URL |

---

## 4. Project File Structure

```
tamm_web/
├── app/
│   ├── (admin)/admin/          # Admin route group
│   ├── (auth)/                 # Auth route group
│   ├── (customer)/             # Customer route group
│   ├── access-denied/          # Technician landing page
│   ├── auth/callback/          # OAuth code exchange route
│   ├── globals.css             # Design system tokens + global styles
│   ├── layout.tsx              # Root layout (Alexandria font, RTL, metadata)
│   └── page.tsx                # Root redirect → /home
├── components/
│   ├── admin/                  # Admin UI components
│   ├── customer/               # Customer UI components
│   └── ui/                     # Shared primitives (Button, Input, Card, Badge)
├── lib/
│   ├── actions/                # Server Actions ('use server')
│   │   ├── auth.ts
│   │   ├── orders.ts
│   │   ├── profile.ts
│   │   └── admin/
│   │       ├── orders.ts
│   │       ├── products.ts
│   │       ├── promotions.ts
│   │       ├── services.ts
│   │       └── technicians.ts
│   ├── data/                   # Server-side data fetching (read-only)
│   │   ├── home.ts
│   │   ├── orders.ts
│   │   ├── profile.ts
│   │   ├── services.ts
│   │   ├── store.ts
│   │   └── admin/
│   │       ├── dashboard.ts
│   │       ├── orders.ts
│   │       ├── products.ts
│   │       ├── promotions.ts
│   │       ├── services.ts
│   │       └── technicians.ts
│   ├── store/
│   │   └── cart-context.tsx    # Client cart state (React Context + localStorage)
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server + middleware Supabase clients
│   ├── types/
│   │   ├── order.ts
│   │   ├── product.ts
│   │   ├── service.ts
│   │   └── user.ts
│   └── utils/
│       └── auth.ts             # getUserRole, getUserProfile, getRedirectPathByRole
├── public/
├── supabase/email-templates/
├── proxy.ts                    # Next.js middleware (role-based routing guard)
├── firebase.json               # Firebase Hosting config
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Routing & Middleware

### `proxy.ts` (Next.js middleware)

The middleware intercepts every non-static request and enforces role-based access:

| Path pattern | Unauthenticated | `customer` | `manager` | `technician` |
|---|---|---|---|---|
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Show page | → `/home` or `/admin/dashboard` | → `/admin/dashboard` | → `/access-denied` |
| `/admin/**` | → `/login` | → `/home` | Allow | → `/access-denied` |
| `/orders`, `/profile`, `/checkout`, `/quote-request`, `/order-success`, `/services/*/book` | → `/login` | Allow | → `/admin/dashboard` | → `/access-denied` |
| `/home`, `/store`, `/services`, `/` | Allow (guest) | Allow | Allow | → `/access-denied` |
| `/` (root) | → `/home` | → `/home` | → `/admin/dashboard` | → `/access-denied` |

### Route Groups

| Group | Layout | Protected |
|---|---|---|
| `(admin)` | Sidebar + manager auth check | Manager only |
| `(customer)` | `CustomerNavbar` + `CartProvider` | Mixed (some public, some auth) |
| `(auth)` | Centered card layout | Redirects away if already logged in |

---

## 6. Pages

### Admin Pages

| Route | Description |
|---|---|
| `/admin/dashboard` | Stats grid, recent orders table, order-by-type and order-by-status charts, quick actions |
| `/admin/orders` | Paginated, filterable order list (by status, type, search) |
| `/admin/orders/[id]` | Full order detail — customer info, items, technician assignment, scheduling, quote management |
| `/admin/quotes` | Dedicated view for `quote_request` orders, filterable by quote status |
| `/admin/products` | Product list with filters; toggle availability inline |
| `/admin/products/new` | Create product form with image upload |
| `/admin/products/[id]/edit` | Edit existing product |
| `/admin/services` | Service list; toggle active inline |
| `/admin/services/new` | Create service form |
| `/admin/services/[id]/edit` | Edit existing service |
| `/admin/technicians` | Technician list with assignment count and availability |
| `/admin/technicians/[id]` | Technician profile + assigned orders history |
| `/admin/promotions` | Promotion banners list; toggle active/delete inline |
| `/admin/promotions/new` | Create promotion form |
| `/admin/promotions/[id]/edit` | Edit promotion |

### Customer Pages

| Route | Auth required | Description |
|---|---|---|
| `/home` | No | Hero, category shortcuts, active-order banner, promotions, featured products, services, why-us, CTA |
| `/store` | No | Product grid with category/brand filters and pagination |
| `/store/[id]` | No | Product detail — gallery, specs, related products, add-to-cart |
| `/services` | No | Service list with category tabs |
| `/services/[id]` | No | Service detail — description, includes, pricing |
| `/services/[id]/book` | Yes | Booking form — address, phone, date, time slot |
| `/cart` | No | Cart items, installation toggles, totals |
| `/checkout` | Yes | Delivery details form → places product order |
| `/order-success` | Yes | Confirmation screen with order number |
| `/orders` | Yes | Tabbed list (active / history) |
| `/orders/[id]` | Yes | Order detail — status tracker, items, technician card, quote response |
| `/profile` | Yes | Profile stats, edit form, avatar, danger zone (delete account) |
| `/quote-request` | Yes | Freeform quote request form |

### Auth Pages

| Route | Description |
|---|---|
| `/login` | Email + password form + Google OAuth button |
| `/register` | Name, email, password sign-up |
| `/forgot-password` | Send password-reset email |
| `/reset-password` | Enter new password (landed from reset email link) |
| `/auth/callback` | Server route — exchanges OAuth code for session, redirects by role |
| `/access-denied` | Shown to technician role on web |

---

## 7. Database Schema (inferred)

### Tables

#### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | FK → Supabase auth.users |
| `full_name` | text | |
| `email` | text | |
| `phone` | text | nullable |
| `role` | text | `customer` \| `manager` \| `technician` |
| `is_complete` | boolean | profile onboarding flag |
| `avatar_url` | text | nullable |
| `address` | text | nullable |
| `created_at` | timestamptz | |

#### `products`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `name` | text | |
| `description` | text | nullable |
| `category` | text | `ac` \| `solar_panel` \| `solar_battery` \| `solar_inverter` \| `accessory` |
| `price` | numeric | nullable (null when `is_price_on_request`) |
| `old_price` | numeric | nullable — for showing discounts |
| `is_price_on_request` | boolean | |
| `brand` | text | nullable |
| `specs` | jsonb | key-value pairs |
| `is_available` | boolean | |
| `is_featured` | boolean | shows on home page |
| `requires_installation` | boolean | |
| `installation_price` | numeric | |
| `image_url` | text | nullable — Supabase Storage URL |
| `created_at` / `updated_at` | timestamptz | |

#### `service_types`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `name` | text | |
| `description` | text | nullable |
| `category` | text | `ac_install` \| `ac_repair` \| `ac_wash` \| `ac_maintenance` \| `solar_install` \| `solar_maintenance` \| `consultation` |
| `base_price` | numeric | 0 when quote-based |
| `is_quote_based` | boolean | triggers quote flow |
| `estimated_duration` | text | nullable |
| `includes` | text[] | feature list |
| `is_active` | boolean | |
| `icon_name` | text | nullable |

#### `orders`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `order_number` | text | format: `TM-YYYY-XXXXXX` |
| `customer_id` | uuid | FK → profiles |
| `order_type` | text | `product` \| `service` \| `product_and_service` \| `quote_request` |
| `status` | text | `pending` → `confirmed` → `assigned` → `on_the_way` → `in_progress` → `completed` / `cancelled` |
| `total_amount` | numeric | |
| `address` | text | |
| `preferred_date` | date | nullable |
| `preferred_time_slot` | text | nullable |
| `notes` | text | nullable |
| `include_installation` | boolean | |
| `scheduled_period` | text | nullable — set by admin |
| `scheduled_hour` | text | nullable — set by admin |
| `quote_status` | text | `pending` \| `sent` \| `accepted` \| `rejected` (nullable) |
| `quote_price` | numeric | nullable |
| `quote_details` | text | nullable |
| `quote_duration` | text | nullable |
| `quote_attachment_url` | text | nullable — PDF or image in Storage |
| `quote_sent_at` | timestamptz | nullable |
| `quote_responded_at` | timestamptz | nullable |
| `rejection_reason` | text | nullable |
| `created_at` / `updated_at` | timestamptz | |

#### `order_items`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `order_id` | uuid | FK → orders |
| `item_type` | text | `product` \| `service` |
| `product_id` | uuid | nullable FK → products |
| `service_type_id` | uuid | nullable FK → service_types |
| `quantity` | integer | |
| `unit_price` | numeric | |
| `total_price` | numeric | |
| `include_installation` | boolean | |

#### `technicians`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `profile_id` | uuid | FK → profiles |
| `is_active` | boolean | |
| `status` | text | `available` \| `busy` |
| `created_at` | timestamptz | |

#### `assignments`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `order_id` | uuid | FK → orders |
| `technician_id` | uuid | FK → technicians |
| `technician_notes` | text | nullable |
| `created_at` | timestamptz | |

#### `promotions`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `title` | text | |
| `subtitle` | text | nullable |
| `icon_name` | text | nullable |
| `gradient_start` | text | nullable — CSS color |
| `gradient_end` | text | nullable — CSS color |
| `destination` | text | nullable — internal route or URL |
| `sort_order` | integer | display ordering |
| `is_active` | boolean | |

### Supabase Storage Buckets

| Bucket | Contents |
|---|---|
| `product-images` | Product photos (JPEG, PNG, WebP — max 5 MB) |
| `quote-attachments` | Quote PDFs and images (max 10 MB) |

---

## 8. TypeScript Types

### `UserRole`
```ts
'customer' | 'manager' | 'technician'
```

### `OrderStatus`
```ts
'pending' | 'confirmed' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled'
```

### `OrderType`
```ts
'product' | 'service' | 'product_and_service' | 'quote_request'
```

### `QuoteStatus`
```ts
'pending' | 'sent' | 'accepted' | 'rejected'
```

### `ServiceCategory`
```ts
'ac_install' | 'ac_repair' | 'ac_wash' | 'ac_maintenance' | 'solar_install' | 'solar_maintenance' | 'consultation'
```

### `ProductCategory`
```ts
'ac' | 'solar_panel' | 'solar_battery' | 'solar_inverter' | 'accessory'
```

---

## 9. Server Actions

All actions use the `'use server'` directive and call `revalidatePath` after mutations.

### `lib/actions/auth.ts`
| Function | Description |
|---|---|
| `signInWithEmail(email, password)` | Email login → redirects by role |
| `signUpWithEmail(name, email, password)` | Registration — returns `emailSent: true` if confirmation required |
| `resetPassword(email)` | Sends password-reset email with redirect to `/reset-password` |
| `updatePassword(newPassword)` | Sets new password after reset flow |
| `signOut()` | Signs out → redirects to `/login` |

### `lib/actions/orders.ts`
| Function | Description |
|---|---|
| `createProductOrder(cartItems, checkoutData)` | Creates `product` order from cart |
| `createServiceOrder(serviceId, ...)` | Creates `service` or `quote_request` order from booking form |
| `createQuoteRequest(quoteData)` | Creates freeform `quote_request` order |
| `respondToQuote(orderId, response, reason?)` | Customer accepts/rejects a sent quote |

### `lib/actions/profile.ts`
Profile update actions (full name, phone, address, avatar).

### `lib/actions/admin/orders.ts`
| Function | Description |
|---|---|
| `updateOrderStatus(orderId, status)` | Change order status |
| `assignTechnician(orderId, technicianId)` | Creates assignment record, sets status to `assigned` |
| `scheduleOrder(orderId, period, hour)` | Sets `scheduled_period` and `scheduled_hour` |
| `sendQuote(orderId, quoteData)` | Sends quote with price, details, duration, optional attachment |
| `uploadQuoteAttachment(formData, orderId)` | Uploads file to `quote-attachments` bucket |

### `lib/actions/admin/products.ts`
| Function | Description |
|---|---|
| `createProduct(data)` | Insert new product |
| `updateProduct(id, data)` | Update existing product |
| `deleteProduct(id)` | Delete — blocked if linked to any order items |
| `uploadProductImage(formData)` | Upload to `product-images` bucket |
| `toggleProductAvailability(id, isAvailable)` | Quick toggle |

### `lib/actions/admin/services.ts`
| Function | Description |
|---|---|
| `createService(data)` | Insert new service type |
| `updateService(id, data)` | Update service type |
| `deleteService(id)` | Delete — blocked if linked to any order items |
| `toggleServiceActive(id, isActive)` | Quick toggle |

### `lib/actions/admin/technicians.ts`
| Function | Description |
|---|---|
| `searchCandidate(identifier)` | Look up existing user by email or phone |
| `promoteAndAddTechnician(profileId)` | Sets role to `technician`, inserts into `technicians` table |
| `removeTechnician(technicianId)` | Removes from `technicians` (user account stays) |
| `toggleTechnicianAvailability(id, isAvailable)` | Sets status `available` / `busy` |

### `lib/actions/admin/promotions.ts`
| Function | Description |
|---|---|
| `savePromotion(data)` | Create or update promotion (upsert by presence of `id`) |
| `togglePromotionStatus(id, isActive)` | Quick toggle |
| `deletePromotion(id)` | Delete promotion |

---

## 10. Data Fetching (`lib/data/`)

Read-only server functions, used in Server Components and pages.

### Home
- `getFeaturedProducts()` — up to 8 featured, available products
- `getServices()` — up to 6 active service types
- `getActivePromotions()` — all active promotions, sorted by `sort_order`
- `getActiveOrder(userId)` — latest active order for logged-in user (shown as banner)

### Admin Dashboard
- `getDashboardStats()` — React `cache()`-wrapped; fires 15 parallel Supabase queries to compute: `totalOrders`, `pendingOrders`, `activeOrders`, `completedToday`, `cancelledOrders`, `pendingQuotes`, `sentQuotes`, `totalCustomers`, `totalTechnicians`, `totalAvailableProducts`, `newOrdersToday`, `totalRevenue`, `recentOrders` (last 5), `ordersByType`, `ordersByStatus`

### Admin Orders
- `getAdminOrders(filters)` — paginated, filterable by status/type/search (searches order number + customer name)
- `getAdminOrderById(orderId)` — full order with customer profile, items, assignment + technician profile
- `getAvailableTechnicians()` — technicians with `status = 'available'`
- `getAdminQuotes(filters)` — paginated quote requests, filterable by quote_status

### Admin Technicians
- `getAdminTechnicians()` — all technicians with profile data + assignment count (N+1 — one count query per technician)
- `getAdminTechnicianById(id)` — single technician detail
- `getAdminTechnicianOrders(technicianId)` — all assignments with order info

---

## 11. Client State — Cart

**`lib/store/cart-context.tsx`** — React Context with `useReducer`, persisted to `localStorage` key `tamm_cart`.

### Cart Item fields
`id`, `name`, `price`, `imageUrl`, `installationPrice`, `includeInstallation`, `quantity`, `isPriceOnRequest`, `requiresInstallation`

### Actions
| Action | Behavior |
|---|---|
| `ADD` | Adds item; increments quantity if already in cart |
| `REMOVE` | Removes by id |
| `UPDATE` | Sets quantity (min 1) |
| `TOGGLE_INSTALL` | Flips `includeInstallation` for one item |
| `CLEAR` | Empties cart |
| `LOAD` | Hydrates from localStorage |

`totalAmount` excludes `isPriceOnRequest` items (counted but priced as 0).

---

## 12. Key Components

### Admin

| Component | Purpose |
|---|---|
| `AdminSidebar` | RTL nav sidebar with pending order/quote badge counts |
| `StatsGrid` | Dashboard stat cards (orders, revenue, customers, etc.) |
| `RecentOrdersTable` | Last 5 orders with customer and status |
| `OrdersDistributionCard` | Order breakdown by type |
| `OrdersStatusCard` | Order breakdown by status |
| `QuickActionsCard` | Shortcut buttons to pending orders/quotes |
| `AdminOrdersTable` | Sortable, paginated orders list |
| `AdminOrdersFilters` | Status + type dropdowns + search input |
| `AdminOrderActions` | Status changer, technician assignment dropdown, schedule picker |
| `QuoteManagement` | Admin quote form — price, details, duration, file upload |
| `AdminCustomerInfo` | Customer profile card on order detail |
| `AdminProductForm` | Full product form with image upload |
| `AdminProductsFilters` | Category + availability filters |
| `AdminServiceForm` | Full service form |
| `PromotionForm` | Promotion create/edit with gradient and icon pickers |
| `AdminPromotionsTable` | Promotion list with toggle and delete |
| `AddTechnicianForm` | Search existing user → confirm → promote to technician |
| `AdminTechniciansTable` | Technician list with availability toggle and remove |

### Customer

| Component | Purpose |
|---|---|
| `CustomerNavbar` | Top nav — logo, links, cart badge, profile/login |
| `HeroSection` | Landing banner |
| `CategorySection` | Quick category shortcuts |
| `PromoSection` | Promotional banners from DB (gradient cards) |
| `FeaturedProductsSection` | Grid of featured products |
| `ServicesSection` | Services preview grid |
| `WhyUsSection` | Value proposition section |
| `CTASection` | Call-to-action banner |
| `ActiveOrderBanner` | Sticky banner when user has an active order |
| `ServiceCard` | Service listing card |
| `ServiceCategoryTabs` | Filter tabs for service categories |
| `ServiceBookingForm` | Booking form with date/time/address/notes |
| `ProductCard` | Product listing card (with price-on-request handling) |
| `ProductsGrid` | Responsive product grid |
| `StoreFilters` | Category + brand filter panel |
| `StorePagination` | Page navigation |
| `ProductGallery` | Product image display |
| `ProductInfo` | Product detail — specs, installation option, add-to-cart |
| `RelatedProducts` | Same-category product suggestions |
| `CartItemRow` | Cart line item with qty controls and installation toggle |
| `CheckoutForm` | Delivery details → calls `createProductOrder` |
| `OrdersTabs` | Active / History tab switch |
| `OrderCard` | Order summary card in list |
| `OrderStatusTracker` | Visual step progress bar |
| `OrderDetailCard` | Full order detail display |
| `OrderItemsList` | Items in an order |
| `TechnicianCard` | Assigned technician info |
| `QuoteSection` | Quote details + accept/reject controls |
| `ProfileHeader` | Avatar + name display |
| `ProfileStats` | Order count stats |
| `ProfileForm` | Name, phone, address edit form |
| `DangerZone` | Account deletion |
| `QuoteRequestForm` | Freeform quote request form |

### UI Primitives

| Component | Description |
|---|---|
| `Button` | Variants: `primary`, `secondary`, `ghost`; sizes: `sm`, `md`, `lg`; loading state |
| `Input` | Label, error message, `rightElement` slot (used for password toggle) |
| `Card` | Surface wrapper with border and border-radius |
| `Badge` | Status badges with color variants |

---

## 13. Design System

All styling is dark-theme only with a deep navy/blue palette defined as CSS custom properties.

### Color Tokens

| Token | Value | Role |
|---|---|---|
| `--bg-primary` | `#080E18` | Page background |
| `--bg-surface` | `#0D1825` | Cards, panels |
| `--bg-surface2` | `#121F30` | Elevated surfaces |
| `--border` | `#1A2E44` | Borders |
| `--blue-primary` | `#1576D4` | Primary actions |
| `--blue-light` | `#3E9EF5` | Links, highlights |
| `--blue-sky` | `#8DCBFA` | Hover states |
| `--text-primary` | `#E8F0F8` | Body text |
| `--text-second` | `#7A96B0` | Secondary text |
| `--text-faint` | `#3E5468` | Placeholder/disabled |
| `--success` | `#22C98A` | Success states |
| `--error` | `#E05252` | Error states |
| `--warning` | `#F5A623` | Warning states |

Tokens are registered in both `:root` CSS variables and Tailwind v4 `@theme` so both inline styles and Tailwind utilities use the same values.

### Global CSS Utilities
- `.surface` / `.surface2` — background + border + border-radius shorthand classes
- `.product-card`, `.category-card`, `.service-card` — hover lift animations
- `.nav-link` / `.nav-link.active` — navigation link states
- `.skeleton` — shimmer loading animation
- Custom scrollbar styles (6px, navy/blue)

### Layout
- `dir="rtl"` and `lang="ar"` on `<html>`
- Almost all layout uses inline styles (not Tailwind utilities) with CSS custom property values
- Responsive breakpoints handled with `@media` in `<style>` tags inside components

---

## 14. Order Lifecycle

```
[Customer places order]
        │
        ▼
    pending ──────────────────────────────────────────────► cancelled
        │
        ▼ (Admin confirms)
    confirmed
        │
        ▼ (Admin assigns technician)
    assigned ── (technician record created in assignments table)
        │
        ▼ (Technician en route — Flutter app)
    on_the_way
        │
        ▼ (Work started)
    in_progress
        │
        ▼ (Work done)
    completed
```

### Quote Sub-flow (for `quote_request` orders)

```
order.quote_status = pending  ← order created
        │
        ▼ (Admin sends quote)
order.quote_status = sent      ← quote_price, quote_details, quote_duration set
        │
        ├──► accepted          ← customer accepts → order proceeds
        └──► rejected          ← customer rejects with reason → order effectively closed
```

---

## 15. Authentication Flow

### Email/Password
1. `signInWithEmail` server action → `supabase.auth.signInWithPassword`
2. Fetch role from `profiles` → redirect to `/admin/dashboard` (manager) or `/home` (customer)
3. All Supabase errors mapped to Arabic messages

### Google OAuth
1. Client calls `supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/auth/callback' })`
2. `/auth/callback` route exchanges code for session → redirects by role

### Password Reset
1. `/forgot-password` → `resetPassword` → email with link to `/auth/callback?next=/reset-password`
2. Callback exchanges code → redirects to `/reset-password`
3. `/reset-password` → `updatePassword` → redirects to `/home`

---

## 16. Technician Management

Technicians are not registered separately — they are existing users promoted by an admin:

1. Admin searches by email or phone → `searchCandidate()` finds user in `profiles`
2. Admin confirms → `promoteAndAddTechnician()`:
   - Updates `profiles.role` to `technician`
   - Inserts row in `technicians` table (`status: 'available'`)
3. Admin can toggle availability (`available` / `busy`) or remove (deletes from `technicians`, keeps account)
4. On web login, technician role → `/access-denied` (technician workflow lives in Flutter app)

---

## 17. Key Architectural Patterns

- **Data/Actions separation**: `lib/data/` is read-only server functions; `lib/actions/` are `'use server'` mutations — clean unidirectional flow
- **snake_case ↔ camelCase mapping**: All Supabase raw rows are typed separately (e.g. `RawProduct`) and mapped to camelCase TypeScript types before use
- **React `cache()`**: `getDashboardStats` is wrapped to deduplicate concurrent calls within one render pass
- **`revalidatePath` after every mutation**: Ensures Next.js cache stays fresh without manual invalidation
- **Middleware as proxy**: `proxy.ts` (not `middleware.ts`) contains the exported middleware function and matcher config — fully handles role-based routing so individual pages don't need auth guards (though some pages do add a secondary guard as defense-in-depth)
- **Cart persistence**: Cart serialized to `localStorage` as `tamm_cart` on every change; hydrated on `CartProvider` mount
- **Order number format**: `TM-YYYY-XXXXXX` where the last 6 digits are the last 6 of `Date.now()`
- **Image handling**: Remote patterns configured for `*.supabase.co` and `lh3.googleusercontent.com` (Google profile photos)
- **All UI text in Arabic**: Including server-side error messages mapped from English Supabase errors

---

## 18. Current State & Known Gaps

- **No technician portal**: Web app redirects technicians to `/access-denied`. The Flutter app handles technician workflows.
- **No onboarding flow**: `getRedirectPathByRole` references `/onboarding` if `isComplete = false`, but no `/onboarding` page exists in the app directory yet.
- **`profile.ts` actions**: File exists but not detailed here — handles profile updates.
- **N+1 query in technicians**: `getAdminTechnicians` runs one `assignments` count query per technician row — may be slow with many technicians.
- **No real-time updates**: Order status changes require page refresh (no Supabase Realtime subscriptions).
- **Test files**: Several `test_*.cjs` / `test_*.js` files at root (e.g. `test_banners.cjs`, `test_orders.cjs`) — appear to be one-off Supabase data verification scripts, not part of the app.
- **Firebase config**: `firebase.json` targets `us-central1` for the Next.js framework backend — deployment is via Firebase Hosting, not Vercel.
