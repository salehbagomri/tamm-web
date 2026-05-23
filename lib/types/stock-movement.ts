// أنواع حركات المخزون — جدول stock_movements في Supabase
// triggers الـ DB تُدرج صفوفاً تلقائياً عند إنشاء/إلغاء الطلبات،
// كما يُدرج bulkUpdateStock صفوفاً عند الاستيراد بالجملة.

export type StockMovementType =
  | 'order'      // خصم تلقائي عند إنشاء طلب
  | 'cancel'     // إرجاع تلقائي عند إلغاء طلب
  | 'import'     // استيراد بالجملة من المدير
  | 'manual'     // تعديل يدوي من المدير
  | 'adjustment' // تسوية مخزون

export type StockMovement = {
  id: string
  productId: string
  movementType: StockMovementType
  quantityBefore: number
  quantityAfter: number
  quantityChange: number
  notes: string | null
  performedBy: string | null
  orderId: string | null
  createdAt: string
}
