-- Migration: Add webhook trigger for completed orders
-- Date: 2026-05-21
--
-- هذا الملف يُنشئ تريجر (Trigger) في قاعدة البيانات يقوم باستدعاء رابط الويب هوك (Webhook)
-- الخاص بتطبيق الويب عندما يتم تحديث حالة الطلب إلى 'completed' (مكتمل).
--
-- ملاحظة: يمكنك تفعيل هذا التريجر إما بتشغيل هذا الملف أو إعداده يدوياً عبر لوحة تحكم Supabase.

-- 1. التأكد من وجود كود التريجر وحذفه إن وجد مسبقاً لمنع التكرار
DROP TRIGGER IF EXISTS on_order_completed ON public.orders;
DROP FUNCTION IF EXISTS public.handle_order_completed();

-- 2. إنشاء وظيفة التريجر التي تقوم بإرسال الطلب (HTTP POST)
CREATE OR REPLACE FUNCTION public.handle_order_completed()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url TEXT := 'http://localhost:3000/api/webhooks/order-completed'; -- استبدله برابط موقعك الفعلي في بيئة الإنتاج (مثال: https://tamm-web.vercel.app/api/webhooks/order-completed)
    webhook_secret TEXT := 'tamm_webhook_secret_2026_secure'; -- يجب أن يطابق قيمة SUPABASE_WEBHOOK_SECRET في ملف .env.local
BEGIN
    -- تشغيل الويب هوك فقط عند انتقال حالة الطلب إلى 'completed' (مكتمل)
    IF (NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed')) THEN
        -- نقوم باستخدام إرسال HTTP Asynchronous عبر إضافة net الخاصة بـ Supabase
        -- إذا لم تكن الإضافة مفعلة، يمكنك تفعيلها عبر: CREATE EXTENSION IF NOT EXISTS pg_net;
        PERFORM net.http_post(
            url := webhook_url,
            headers := json_build_object(
                'Content-Type', 'application/json',
                'x-webhook-secret', webhook_secret
            )::jsonb,
            body := json_build_object(
                'type', TG_OP,
                'table', TG_TABLE_NAME,
                'schema', TG_TABLE_SCHEMA,
                'record', row_to_json(NEW),
                'old_record', row_to_json(OLD)
            )::text
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ربط الوظيفة بالجدول للتفعيل عند التحديث
CREATE TRIGGER on_order_completed
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_order_completed();

-- ─── إعداد يدوي بديل عبر لوحة تحكم Supabase Dashboard ──────────────────────────
-- إذا كنت تفضل استخدام واجهة لوحة تحكم Supabase بدلاً من SQL:
-- 1. اذهب إلى: Database > Webhooks في لوحة تحكم Supabase.
-- 2. انقر على "Create Webhook".
-- 3. أدخل الاسم: "on_order_completed".
-- 4. اختر الجدول: "orders".
-- 5. اختر الأحداث: "Update".
-- 6. في حلف الشروط (Conditions)، يمكنك تصفية الأحداث أو ترك الفلترة للـ API (الـ API الخاص بنا يتحقق من الانتقال لـ completed بالفعل).
-- 7. نوع الاستدعاء: POST.
-- 8. الرابط (URL): http://localhost:3000/api/webhooks/order-completed (أو رابط الإنتاج).
-- 9. أضف الرؤوس (Headers):
--    - Name: "x-webhook-secret", Value: "tamm_webhook_secret_2026_secure"
-- 10. احفظ الإعدادات.
