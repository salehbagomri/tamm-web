# خطة تطوير قسم "حسابي" — Tamm Web

> هذا المستند هو مرجع التنفيذ الرسمي لإعادة بناء قسم العميل (`/account`). كل phase = commit واحد على الأقل. آخر تحديث: 2026-05-24.

---

## السياق

التطبيق الآن في الإنتاج (Vercel + Supabase). صفحة `/profile` الحالية تجمع كل شيء في صفحة واحدة (هوية + إحصاءات + تعديل + خروج). هذا لا يتسع لميزات الإنتاج: دفتر عناوين، تغيير كلمة المرور/البريد، تفضيلات الإشعارات، مركز الدعم، تصدير البيانات، رفع الصورة الرمزية.

**الهدف:** نقل القسم إلى نمط **Hub + Sub-pages**: صفحة رئيسية بكروت ذكية، كل كرت يفتح صفحة فرعية مركّزة. التجربة مألوفة (Amazon/Noon/HungerStation)، تتسع للمستقبل، ومثالية للموبايل.

---

## القرارات المعمارية

| القرار | الاختيار | السبب |
|---|---|---|
| المسار | `/account` كـ hub + `/account/<section>` كصفحات فرعية، مع redirect من `/profile` | يتسع، RESTful، سهل التوسع |
| الهيكلة | Layout مشترك بـ breadcrumbs/sidebar للموبايل والديسكتوب | ثبات بصري، سهولة التنقل |
| إعادة الاستخدام | الاحتفاظ بـ `ProfileHeader` و `ProfileStats` و `DangerZone` و `Input` كـ building blocks | لا نعيد بناء ما يعمل |
| RTL وداكن | الالتزام بقواعد CLAUDE.md | اتساق التطبيق |

---

## Phase 1 — الهيكلية والـ Hub (~2 ساعة)

**ملفات جديدة:**
- `app/(customer)/account/layout.tsx` — Layout مع breadcrumb وعنوان الصفحة الحالية
- `app/(customer)/account/page.tsx` — الـ Hub: شبكة كروت
- `components/customer/account/AccountHubCard.tsx` — كرت قابل لإعادة الاستخدام (أيقونة SVG + عنوان + وصف قصير + counter اختياري + سهم)
- `components/customer/account/AccountIdentityCard.tsx` — كرت الهوية العلوي

**ملفات تُعدَّل:**
- `app/(customer)/profile/page.tsx` → redirect إلى `/account`
- `components/customer/CustomerNavbar.tsx` → "حسابي" تشير إلى `/account`

**كروت الـ Hub (8 كروت):**
1. 📦 طلباتي — `/orders`
2. 🔔 إشعاراتي — `/notifications`
3. 👤 الملف الشخصي — `/account/profile`
4. 📍 عناويني — `/account/addresses`
5. 🔐 الأمان — `/account/security`
6. 🎚 تفضيلات الإشعارات — `/account/notification-preferences`
7. 💬 الدعم والمساعدة — `/account/support`
8. 📄 الخصوصية والبيانات — `/account/privacy`

أسفل الشبكة: **⚠️ منطقة الخطر** (تسجيل الخروج، حذف الحساب) — تنتقل من `/profile` إلى Hub.

---

## Phase 2 — الملف الشخصي + رفع الصورة الرمزية (~3 ساعات)

**المسار:** `/account/profile`

**ملفات جديدة:**
- `app/(customer)/account/profile/page.tsx`
- `components/customer/account/AvatarUploader.tsx` — preview + crop + upload
- `lib/actions/profile-avatar.ts` — server action: رفع إلى bucket `avatars` + تحديث `profiles.avatar_url`
- `supabase/migrations/<date>_create_avatars_bucket.sql` — bucket + RLS policies

**المهام:**
1. إنشاء/التأكد من bucket `avatars`
2. RLS: العميل يكتب فقط في `{user_id}/...`
3. AvatarUploader: JPEG/PNG/WebP، حد أقصى 2MB، ضغط client-side إلى 512×512
4. تحديث `updateProfile` لتقبل avatar_url
5. شارة "✓ مكتمل" / "⚠️ مكتمل جزئياً" بحسب `is_complete`

---

## Phase 3 — مركز الأمان (~3 ساعات)

**المسار:** `/account/security`

**ملفات جديدة:**
- `app/(customer)/account/security/page.tsx`
- `components/customer/account/ChangePasswordForm.tsx`
- `components/customer/account/ChangeEmailForm.tsx`
- `lib/actions/account-security.ts` — `changePassword()`, `changeEmail()`

**المهام:**
1. **تغيير كلمة المرور:** تحقق من الحالية عبر `signInWithPassword`، ثم `updateUser({ password })`. قوة كلمة المرور: 8 أحرف + حرف + رقم.
2. **تغيير البريد:** `updateUser({ email })` — يرسل تأكيد للبريدين. حماية بكلمة المرور.
3. **معلومات الجلسة:** آخر دخول + زر "خروج من كل الأجهزة" (`signOut({ scope: 'global' })`).
4. (اختياري) هاتف موثّق placeholder.

---

## Phase 4 — دفتر العناوين (~4 ساعات)

**المسار:** `/account/addresses`

**Schema جديد:**
```sql
CREATE TABLE customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label text NOT NULL,
  city text NOT NULL,
  full_address text NOT NULL,
  contact_phone text,
  latitude double precision,
  longitude double precision,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS: العميل يقرأ/يكتب/يحذف عناوينه فقط
-- Trigger: عند set is_default=true، يلغي الافتراضي السابق
```

**ملفات جديدة:**
- `app/(customer)/account/addresses/page.tsx`
- `components/customer/account/AddressCard.tsx`
- `components/customer/account/AddressFormModal.tsx`
- `lib/types/address.ts`
- `lib/data/customer-addresses.ts`
- `lib/actions/customer-addresses.ts`

**تكامل مع Checkout:** Step 1 يصبح قائمة منسدلة بالعناوين المحفوظة + زر "إضافة عنوان جديد".

**⚠️ يحتاج تنسيق مع فريق tamm_app (Flutter):** نموذج Address + صفحة "عناويني" + استخدامها في checkout.

---

## Phase 5 — تفضيلات الإشعارات (~2 ساعة)

**المسار:** `/account/notification-preferences`

**Schema:**
```sql
ALTER TABLE profiles ADD COLUMN notification_prefs jsonb DEFAULT '{
  "order_updates": true,
  "promotions": true,
  "new_products": false,
  "service_reminders": true,
  "support_replies": true
}'::jsonb;
```

**ملفات جديدة:**
- `app/(customer)/account/notification-preferences/page.tsx`
- `components/customer/account/NotificationPrefsForm.tsx`
- `lib/actions/notification-prefs.ts`

**المنطق:** إنشاء الإشعار في `notifications` يحترم prefs (يُنفَّذ على tamm_app/Edge Functions لاحقاً).

---

## Phase 6 — الدعم والمساعدة (~2 ساعة)

**المسار:** `/account/support`

**ملفات جديدة:**
- `app/(customer)/account/support/page.tsx`
- `components/customer/account/FAQAccordion.tsx`
- `components/customer/account/SupportContactCard.tsx`
- `components/customer/account/ReportProblemForm.tsx`
- `lib/actions/support.ts`

**المحتوى:**
- FAQ (6-8 أسئلة ثابتة)
- بطاقة تواصل: WhatsApp + بريد + ساعات العمل
- نموذج "أبلغ عن مشكلة": فئة/موضوع/وصف/رقم الطلب (اختياري)

**Schema:**
```sql
CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id),
  category text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  order_id uuid REFERENCES orders(id),
  status text DEFAULT 'open',
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

---

## Phase 7 — الخصوصية والبيانات (~2 ساعة)

**المسار:** `/account/privacy`

**ملفات جديدة:**
- `app/(customer)/account/privacy/page.tsx`
- `components/customer/account/DataExportCard.tsx`
- `lib/actions/data-export.ts`

**المحتوى:**
- روابط سياسة الخصوصية وشروط الاستخدام
- تنزيل البيانات JSON (ملف شخصي + طلبات + إشعارات + عناوين + تقييمات)
- حذف الحساب (نُقل من `/profile`)

---

## Phase 8 — التلميع والاختبار E2E (~3 ساعات)

**المهام:**
1. `loading.tsx` لكل صفحة فرعية
2. Empty states بأيقونات SVG
3. Skeleton loaders للهوية + الإحصاءات على الـ Hub
4. Mobile UX (touch targets ≥ 44px، sticky header)
5. Accessibility (aria-labels، keyboard nav، focus indicators)
6. اختبارات E2E:

| سيناريو | المتوقع |
|---|---|
| `/account` | الـ Hub بـ 8 كروت + عدّادات صحيحة |
| رفع صورة > 2MB | رسالة عربية واضحة |
| كلمة مرور حالية خاطئة | "كلمة المرور الحالية غير صحيحة" |
| إضافة عنوان افتراضي | الافتراضي السابق يصبح عادياً |
| اختيار عنوان في checkout | يُعبَّأ تلقائياً |
| تعطيل إشعار العروض | يُحفظ في `profiles.notification_prefs` |
| تذكرة دعم | تظهر في `support_tickets` + إشعار للمدير |
| تنزيل البيانات | JSON قابل للفتح |
| `/profile` القديم | redirect نظيف |

---

## Phase 9 — تعليمات Flutter (~ساعة)

رسالة موحّدة للـ Flutter agent تشمل:
- البنية المعمارية (Hub + Sub-pages)
- Schema المشترك (`customer_addresses`، `notification_prefs`، `support_tickets`)
- أسماء الـ data actions
- مزامنة bucket Avatar
- خطة 8 مراحل مكافئة
- اختبارات حاسمة

---

## ترتيب التنفيذ

```
Phase 1 (Hub + routes)
  ├→ Phase 2 (Profile + Avatar)
  ├→ Phase 3 (Security)
  ├→ Phase 4 (Addresses)   ─── يحتاج تنسيق DB مع tamm_app
  ├→ Phase 5 (Notif Prefs) ─── يحتاج تنسيق DB
  ├→ Phase 6 (Support)     ─── يحتاج تنسيق DB
  ├→ Phase 7 (Privacy)
  └→ Phase 8 (Polish + E2E)
        └→ Phase 9 (Flutter)
```

**الزمن التقديري:** ~22 ساعة موزّعة على 9 مراحل.

---

## مخاطر وإدارة

| خطر | تخفيف |
|---|---|
| تعارض schema مع tamm_app | لا تنفيذ Phase 4-6 قبل تأكيد فريق Flutter |
| كسر روابط `/profile` القديمة | redirect دائم + اختبار |
| رفع صورة كبيرة يعطّل المتصفح | ضغط client + حد 2MB |
| تغيير البريد دون تأكيد | حماية بكلمة المرور + رسالة للبريدين |
| Performance لـ JSON download | streaming + pagination داخلية |
