-- إضافة عمود رقم هاتف التواصل للطلبات
-- يُخزّن الهاتف الذي أدخله العميل عند الحجز، قد يختلف عن هاتف ملفه الشخصي
ALTER TABLE orders ADD COLUMN IF NOT EXISTS contact_phone TEXT;
