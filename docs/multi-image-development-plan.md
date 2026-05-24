# خطة التطوير المشتركة: دعم رفع صور متعددة للمنتجات (الويب والموبايل)

يوثّق هذا المستند خطة التطوير والمزامنة المعمارية الشاملة لترقية نظام المنتجات في منصة **تمّ (Tamm)** لدعم رفع وعرض صور متعددة حقيقية لكل منتج. تم اعتماد **الخيار الثاني (One-to-Many Relation)** عبر جدول فرعي مخصص لضمان أعلى معايير أداء قواعد البيانات، والتوافق مع محركات البحث (SEO)، ومرونة الميزات المستقبلية.

---

## 1. بنية قاعدة البيانات الجديدة (Database Schema)

تعتمد البنية على إضافة جدول فرعي باسم `product_images` يربطه بجدول `products` علاقة (رأس بأطراف):

```sql
-- 1. إنشاء جدول الصور الفرعي للمنتجات
CREATE TABLE IF NOT EXISTS public.product_images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    alt_text    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. إنشاء كشافات لتحسين أداء عمليات البحث والربط
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS product_images_sort_order_idx ON public.product_images(sort_order);

-- 3. تفعيل الحماية على مستوى الصفوف (Row Level Security)
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- 4. إعداد سياسات الأمان (RLS Policies)
-- الجميع (العملاء والضيوف) يمكنهم مشاهدة الصور
DROP POLICY IF EXISTS "Allow public read access to product_images" ON public.product_images;
CREATE POLICY "Allow public read access to product_images" 
ON public.product_images FOR SELECT 
TO public 
USING (true);

-- المدراء فقط يمكنهم التعديل والإدخال والحذف
DROP POLICY IF EXISTS "Allow managers full control over product_images" ON public.product_images;
CREATE POLICY "Allow managers full control over product_images" 
ON public.product_images FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'manager'
  )
);
```

### خطوة الهجرة الآمنة للبيانات الحالية (Migration & Seed Script):
لضمان عدم فقدان صورة أي منتج متوفر حالياً في النظام أثناء الانتقال للبنية الجديدة، سنقوم بتشغيل سكربت هجرة يقوم بنسخ الصورة الفردية الحالية لكل منتج في جدول `products` وإدراجها كصورة أولى (`sort_order = 0`) في جدول `product_images` الجديد:

```sql
-- ترحيل الصور الحالية تلقائياً لمنع فقدان البيانات
INSERT INTO public.product_images (product_id, image_url, sort_order)
SELECT id, image_url, 0
FROM public.products
WHERE image_url IS NOT NULL AND image_url <> ''
ON CONFLICT DO NOTHING;
```

---

## 2. مراحل التطبيق والتنفيذ (Implementation Phases)

### 📌 المرحلة الأولى: إعداد قاعدة البيانات والترحيل (Database & Migration)
* **المسؤول:** مطور الويب (Next.js Agent).
* **المهام:**
  * تشغيل ملف الـ Migration الخاص بجدول `product_images` وترحيل البيانات الحالية.
  * الحفاظ مؤقتاً على عمود `image_url` القديم في جدول `products` كاحتياط لضمان عدم تعطل النسخ القديمة من تطبيق الهاتف حتى يتم تحديثها بالكامل.

### 📌 المرحلة الثانية: تطوير لوحة تحكم المدير بالويب (Admin Panel & Multiple Upload)
* **المسؤول:** مطور الويب (Next.js Agent).
* **المهام:**
  * تحديث دالة الرفع `uploadProductImage` لتقبل رفع ملفات متعددة دفعة واحدة.
  * تحديث واجهة تعديل وإضافة المنتجات (`AdminProductForm.tsx`):
    * عرض شبكة من الصور المرفوعة للمنتج.
    * إمكانية حذف أي صورة على حدة، وإضافة صور جديدة.
    * توفير إمكانية فرز وترتيب الصور (Drag & Drop) لحفظ قيم `sort_order` المناسبة.
  * تعديل دالتي `createProduct` و `updateProduct` لإدراج وحذف الأسطر المناسبة في جدول `product_images` بالتزامن مع العملية.

### 📌 المرحلة الثالثة: تحديث واجهة العميل بالويب (Customer Web & Gallery Sync)
* **المسؤول:** مطور الويب (Next.js Agent).
* **المهام:**
  * تحديث استعلامات جلب البيانات (`getProductById` و `getRelatedProducts`) لتشمل الصور المرتبطة بـ JOIN:
    ```typescript
    .select('*, product_images(*)')
    ```
  * تعديل مكون المعرض الفاخر [ProductGallery.tsx](file:///c:/flutterprojects/tamm_web/components/customer/store/ProductGallery.tsx) ليقرأ الصور الفعلية المتعددة من السجل مباشرة بدلاً من توليد اللقطات الافتراضية، مع الاحتفاظ باللقطات الافتراضية كـ (Fallback) دفاعي رائع في حال كان للمنتج صورة واحدة فقط.

### 📌 المرحلة الرابعة: دمج تطبيق الهاتف وتطويره (Flutter Integration)
* **المسؤول:** مطور التطبيقات (Flutter Agent).
* **المهام:**
  * تحديث الـ Model وجلب البيانات وربطه بمعرض الصور (تجدون التعليمات الكاملة له أدناه).

---

## 3. تعليمات التنسيق الفني لوكيل تطبيق فلاتر (Instructions for Flutter Agent)

يرجى تزويد وكيل الفلاتر بالرسالة البرمجية المباشرة التالية لمزامنة منطق العمل:

```markdown
# ⚠️ مهمة مزامنة برمجية: ترقية معرض صور المنتجات لصور متعددة (saved_addresses)

عزيزي مطور فلاتر (Flutter Agent)،
لقد قمنا بترقية معمارية قواعد البيانات المشتركة (Supabase) لدعم رفع وعرض صور متعددة حقيقية لكل منتج عبر جدول فرعي مخصص يحمل اسم `product_images`.

يرجى تعديل تطبيق الهاتف ليتوافق مع هذه المعمارية الجديدة ومزامنتها برمجياً باتباع الإرشادات والخطوات التالية:

### 1. فهم بنية جدول الصور الفرعي الجديد
اسم الجدول في Supabase: `product_images`
الأعمدة المرتبطة:
- `id` (UUID) - معرف فريد للصورة.
- `product_id` (UUID) - معرف المنتج المرتبط (Foreign Key).
- `image_url` (TEXT) - رابط الصورة العام.
- `sort_order` (INT) - ترتيب الصورة (الرئيسية تبدأ بـ 0).
- `alt_text` (TEXT) - نص بديل للصورة.

---

### 2. تحديث الـ Model في فلاتر (Product & ProductImage)
يرجى فتح ملف الـ Model الخاص بالمنتجات `lib/shared/models/product.dart` وتعديله كالتالي:

أولاً: إنشاء كلاس فرعي جديد لتمثيل الصورة:
```dart
class ProductImage {
  final String id;
  final String productId;
  final String imageUrl;
  final int sortOrder;
  final String? altText;

  ProductImage({
    required this.id,
    required this.productId,
    required this.imageUrl,
    required this.sortOrder,
    this.altText,
  });

  factory ProductImage.fromJson(Map<String, dynamic> json) {
    return ProductImage(
      id: json['id'] as String,
      productId: json['product_id'] as String,
      imageUrl: json['image_url'] as String,
      sortOrder: (json['sort_order'] as num).toInt(),
      altText: json['alt_text'] as String?,
    );
  }
}
```

ثانياً: ترقية كلاس `Product` ليحتوي على قائمة الصور مع الحفاظ على التوافق الخلفي (Backwards Compatibility):
```dart
class Product {
  // ... الحقول الحالية للمنتج ...
  final String? imageUrl; // الصورة الأساسية (قديمة للاحتياط)
  final List<ProductImage> images; // قائمة الصور المتعددة الجديدة

  Product({
    // ... الباني الحالي ...
    this.imageUrl,
    required this.images,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // 1. تحليل الصور الفرعية المرفقة بـ Join
    final imagesList = (json['product_images'] as List?)
        ?.map((img) => ProductImage.fromJson(img as Map<String, dynamic>))
        .toList() ?? [];

    // ترتيب الصور بحسب حقل sort_order
    imagesList.sort((a, b) => a.sortOrder.compareTo(b.sortOrder));

    // 2. تحديد الرابط الرئيسي للصورة
    // للاحتياط والتوافق الخلفي: إذا كان جدول الصور يحتوي على صورة نعتمدها،
    // وإلا نعود للـ image_url المخزن قديماً في جدول المنتجات
    final primaryImgUrl = imagesList.isNotEmpty 
        ? imagesList.first.imageUrl 
        : (json['image_url'] as String?);

    return Product(
      // ... الحقول الحالية ...
      imageUrl: primaryImgUrl,
      images: imagesList,
      // ... بقية الحقول ...
    );
  }
}
```

---

### 3. تحديث الـ Repository وجلب البيانات (Order / Store Repository)
تأكد عند استعلام المنتجات من Supabase في الـ Fetchers والـ Repositories من استدعاء الجدول الفرعي `product_images` في جملة الاستعلام (Select Query):
```dart
// مثال:
final response = await _client
    .from('products')
    .select('*, product_images(*)') // ضرورة جلب جدول الصور الفرعي
    .eq('id', productId)
    .single();
```

---

### 4. تحديث واجهة العرض (Product Detail Screen UI)
يرجى الانتقال لملف عرض تفاصيل المنتج في الهاتف `product_detail_screen.dart`:
* استبدل ويدجيت عرض الصورة المفردة بـ **`PageView`** أو شريط تمرير أفقي (Slider Carousel) لكي يتمكن العميل من سحب الصور والتنقل بين كافة الصور المتوفرة في مصفوفة `product.images`.
* **دفاع تفاعلي هام:** في حال كانت مصفوفة `product.images` فارغة، يجب وضع كود دفاعي يعرض الصورة المفردة الاحتياطية `product.imageUrl` أو يعرض ويدجيت الـ Placeholder الخاص بمنصة تمّ لمنع أي فراغات بصرية.

شكراً لتعاونكم ومزامنتكم الاحترافية!
```
