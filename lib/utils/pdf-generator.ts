import { jsPDF } from 'jspdf'
import fontData from './alexandria-font.json'

interface InvoiceItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  includeInstallation: boolean
}

interface InvoicePDFData {
  invoiceNumber: string
  orderNumber: string
  customerName: string
  customerPhone: string | null
  customerAddress: string | null
  items: InvoiceItem[]
  subtotal: number
  installationFee: number
  totalAmount: number
  paymentType: string
  issuedAt: string
  deliveryFee: number
}

// ─── توليد PDF للفاتورة ──────────────────────────────────────────────────────

export function generateInvoicePDF(data: InvoicePDFData): ArrayBuffer {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // تسجيل الخط العربي
  doc.addFileToVFS('Alexandria-Regular.ttf', fontData.data)
  doc.addFont('Alexandria-Regular.ttf', 'Alexandria', 'normal')
  doc.setFont('Alexandria')

  const pageW = 210
  const marginR = 15 // هامش يمين (الصفحة RTL)
  const marginL = 15
  const contentW = pageW - marginR - marginL
  let y = 20

  // ─── الرأس ──────────────────────────────────────────────────────────────

  // اسم المنصة
  doc.setFontSize(22)
  doc.setTextColor(21, 118, 212) // blue-primary
  doc.text('تمّ', pageW - marginR, y, { align: 'right' })

  doc.setFontSize(9)
  doc.setTextColor(122, 150, 176) // text-second
  doc.text('خدمات كهربائية متكاملة', pageW - marginR, y + 7, { align: 'right' })

  // رقم الفاتورة (يسار)
  doc.setFontSize(10)
  doc.setTextColor(232, 240, 248) // text-primary
  doc.text(data.invoiceNumber, marginL, y, { align: 'left' })

  doc.setFontSize(8)
  doc.setTextColor(122, 150, 176)
  doc.text(data.issuedAt, marginL, y + 5, { align: 'left' })

  y += 18

  // خط فاصل
  doc.setDrawColor(26, 46, 68) // border
  doc.setLineWidth(0.3)
  doc.line(marginL, y, pageW - marginR, y)
  y += 8

  // ─── بيانات العميل ──────────────────────────────────────────────────────

  doc.setFontSize(10)
  doc.setTextColor(141, 203, 250) // blue-sky
  doc.text('بيانات العميل', pageW - marginR, y, { align: 'right' })
  y += 7

  doc.setFontSize(9)
  doc.setTextColor(232, 240, 248)
  const customerInfo = [
    `الاسم: ${data.customerName}`,
    data.customerPhone ? `الجوال: ${data.customerPhone}` : null,
    data.customerAddress ? `العنوان: ${data.customerAddress}` : null,
    `رقم الطلب: #${data.orderNumber}`,
  ].filter(Boolean) as string[]

  for (const line of customerInfo) {
    doc.text(line, pageW - marginR, y, { align: 'right' })
    y += 5.5
  }

  y += 5

  // ─── جدول المنتجات/الخدمات ─────────────────────────────────────────────

  // رأس الجدول
  doc.setFillColor(13, 24, 37) // bg-surface
  doc.rect(marginL, y, contentW, 8, 'F')

  doc.setFontSize(8)
  doc.setTextColor(122, 150, 176)

  const colX = {
    name: pageW - marginR - 2,
    qty: pageW - marginR - 95,
    price: pageW - marginR - 120,
    total: marginL + 2,
  }

  doc.text('المنتج / الخدمة', colX.name, y + 5.5, { align: 'right' })
  doc.text('الكمية', colX.qty, y + 5.5, { align: 'right' })
  doc.text('السعر', colX.price, y + 5.5, { align: 'right' })
  doc.text('الإجمالي', colX.total, y + 5.5, { align: 'left' })

  y += 10

  // صفوف المنتجات
  doc.setTextColor(232, 240, 248)
  doc.setFontSize(8.5)

  for (const item of data.items) {
    // خط فاصل خفيف
    doc.setDrawColor(26, 46, 68)
    doc.setLineWidth(0.15)
    doc.line(marginL, y, pageW - marginR, y)

    y += 1.5

    const itemName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name
    doc.text(itemName, colX.name, y + 4, { align: 'right' })
    doc.text(String(item.quantity), colX.qty, y + 4, { align: 'right' })
    doc.text(`${item.unitPrice.toFixed(0)} ر.س`, colX.price, y + 4, { align: 'right' })
    doc.text(`${item.totalPrice.toFixed(0)} ر.س`, colX.total, y + 4, { align: 'left' })

    y += 7.5

    // إشارة التركيب
    if (item.includeInstallation) {
      doc.setFontSize(7)
      doc.setTextColor(34, 201, 138) // success
      doc.text('+ شامل التركيب', colX.name, y, { align: 'right' })
      doc.setTextColor(232, 240, 248)
      doc.setFontSize(8.5)
      y += 5
    }
  }

  y += 5

  // ─── الملخص المالي ──────────────────────────────────────────────────────

  doc.setDrawColor(26, 46, 68)
  doc.setLineWidth(0.3)
  doc.line(marginL, y, pageW - marginR, y)
  y += 6

  const summaryX = pageW - marginR - 2
  const summaryValX = marginL + 30

  doc.setFontSize(9)
  doc.setTextColor(122, 150, 176)

  // المجموع الفرعي
  doc.text('إجمالي المنتجات:', summaryX, y, { align: 'right' })
  doc.setTextColor(232, 240, 248)
  doc.text(`${data.subtotal.toFixed(0)} ر.س`, summaryValX, y, { align: 'left' })
  y += 6

  // رسوم التركيب
  if (data.installationFee > 0) {
    doc.setTextColor(122, 150, 176)
    doc.text('رسوم التركيب والتثبيت:', summaryX, y, { align: 'right' })
    doc.setTextColor(232, 240, 248)
    doc.text(`${data.installationFee.toFixed(0)} ر.س`, summaryValX, y, { align: 'left' })
    y += 6
  }

  // رسوم التوصيل
  doc.setTextColor(122, 150, 176)
  doc.text('رسوم التوصيل:', summaryX, y, { align: 'right' })
  doc.setTextColor(34, 201, 138)
  doc.text(data.deliveryFee > 0 ? `${data.deliveryFee.toFixed(0)} ر.س` : 'مجاني', summaryValX, y, { align: 'left' })
  y += 8

  // خط مزدوج
  doc.setDrawColor(21, 118, 212)
  doc.setLineWidth(0.5)
  doc.line(marginL + 60, y, pageW - marginR, y)
  y += 7

  // الإجمالي النهائي
  doc.setFontSize(12)
  doc.setTextColor(141, 203, 250)
  doc.text('الإجمالي:', summaryX, y, { align: 'right' })
  doc.setTextColor(62, 158, 245) // blue-light
  doc.text(`${data.totalAmount.toFixed(0)} ر.س`, summaryValX, y, { align: 'left' })
  y += 6

  // طريقة الدفع
  doc.setFontSize(8)
  doc.setTextColor(122, 150, 176)
  const paymentLabel = data.paymentType === 'cash' ? 'نقداً عند الاستلام' :
                       data.paymentType === 'card' ? 'بطاقة ائتمان' :
                       data.paymentType === 'transfer' ? 'تحويل بنكي' : data.paymentType
  doc.text(`طريقة الدفع: ${paymentLabel}`, summaryX, y, { align: 'right' })

  // ─── التذييل ────────────────────────────────────────────────────────────

  const footerY = 280
  doc.setDrawColor(26, 46, 68)
  doc.setLineWidth(0.2)
  doc.line(marginL, footerY - 5, pageW - marginR, footerY - 5)

  doc.setFontSize(7.5)
  doc.setTextColor(62, 84, 104) // text-faint
  doc.text('شكراً لثقتكم بمنصة تمّ — خدمات كهربائية متكاملة', pageW / 2, footerY, { align: 'center' })
  doc.text('هذه الفاتورة صادرة إلكترونياً ولا تحتاج إلى توقيع أو ختم', pageW / 2, footerY + 4, { align: 'center' })

  return doc.output('arraybuffer')
}
