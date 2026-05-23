// أنواع حركات المخزون — جدول stock_movements في Supabase
// triggers الـ DB تُدرج صفوفاً تلقائياً عند إنشاء/إلغاء الطلبات،
// كما يُدرج bulkUpdateStock صفوفاً عند الاستيراد بالجملة.

export type StockMovementType =
  | 'sale'              // خصم تلقائي عند إنشاء طلب (DB trigger)
  | 'cancel_return'     // إرجاع تلقائي عند إلغاء طلب (DB trigger)
  | 'import'            // إضافة مخزون جديد من فاتورة شراء
  | 'manual_adjustment' // تعديل/تسوية مباشرة من المدير

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
