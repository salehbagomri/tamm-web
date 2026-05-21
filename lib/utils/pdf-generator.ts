import { jsPDF } from 'jspdf'
import readexFontData from './readex-font.json'
import logoData from './logo-tamm-base64.json'
import { reverseArabicLine } from './arabic-helper'

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

  // تسجيل خط Readex Pro العربي العصري — حروف واضحة جداً ومتصلة بشكل احترافي
  doc.addFileToVFS('ReadexPro.ttf', readexFontData.data)
  doc.addFont('ReadexPro.ttf', 'ReadexPro', 'normal')
  doc.setFont('ReadexPro')

  const pageW = 210
  const marginR = 15
  const marginL = 15
  const contentW = pageW - marginR - marginL
  let y = 15

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── ترويسة الفاتورة (الشعار + عنوان الفاتورة) ────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  // شعار منصة تمّ (صورة JPEG لضمان التوافقية البرمجية دون الحاجة لمكتبة canvas على الخادم)
  try {
    const format = logoData.mimeType.includes('png') ? 'PNG' : 'JPEG'
    doc.addImage(
      `data:${logoData.mimeType};base64,${logoData.data}`,
      format,
      pageW - marginR - 12, // x: يمين الصفحة
      y - 2,                // y
      12,                   // عرض الشعار
      12                    // ارتفاع الشعار
    )
  } catch (err) {
    console.error('[PDF-Generator] Failed to add logo image:', err)
  }

  // اسم المنصة بجانب الشعار
  doc.setFontSize(20)
  doc.setTextColor(21, 118, 212) // أزرق تمّ
  doc.text(reverseArabicLine('منصة تمّ'), pageW - marginR - 15, y + 5, { align: 'right' })

  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139) // Slate 500
  doc.text(reverseArabicLine('لخدمات التكييف المتكاملة وأنظمة الطاقة الشمسية'), pageW - marginR - 15, y + 10, { align: 'right' })

  // عنوان الفاتورة (يسار)
  doc.setFontSize(18)
  doc.setTextColor(15, 23, 42) // Slate 900
  doc.text(reverseArabicLine('فاتورة مبيعات'), marginL, y + 5, { align: 'left' })

  y += 18

  // بيانات الفاتورة (يسار تحت العنوان)
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105) // Slate 600
  doc.text(reverseArabicLine(`رقم الفاتورة: ${data.invoiceNumber}`), marginL, y, { align: 'left' })
  doc.text(reverseArabicLine(`تاريخ الإصدار: ${data.issuedAt}`), marginL, y + 5, { align: 'left' })
  doc.text(reverseArabicLine(`رقم الطلب: #${data.orderNumber}`), marginL, y + 10, { align: 'left' })

  y += 18

  // خط فاصل أفقي
  doc.setDrawColor(226, 232, 240) // Slate 200
  doc.setLineWidth(0.5)
  doc.line(marginL, y, pageW - marginR, y)

  y += 8

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── بيانات العميل ─────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  // صندوق رمادي لبيانات العميل
  const boxH = 22
  doc.setFillColor(248, 250, 252) // Slate 50
  doc.roundedRect(marginL, y - 2, contentW, boxH, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setTextColor(21, 118, 212)
  doc.text(reverseArabicLine('معلومات العميل'), pageW - marginR - 4, y + 3, { align: 'right' })

  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42) // Slate 900

  // العمود الأيمن
  const rX = pageW - marginR - 4
  doc.text(reverseArabicLine(`الاسم: ${data.customerName}`), rX, y + 9, { align: 'right' })
  if (data.customerPhone) {
    doc.text(reverseArabicLine(`رقم الجوال: ${data.customerPhone}`), rX, y + 14.5, { align: 'right' })
  }

  // العمود الأيسر
  const lX = marginL + 4
  if (data.customerAddress) {
    doc.text(reverseArabicLine(`العنوان: ${data.customerAddress}`), lX, y + 9, { align: 'left' })
  }
  const paymentLabel = data.paymentType === 'cash' ? 'نقداً عند الاستلام' :
                       data.paymentType === 'bank' ? 'تحويل بنكي' :
                       data.paymentType === 'card' ? 'بطاقة إلكترونية' :
                       data.paymentType === 'wallet' ? 'محفظة إلكترونية' : data.paymentType
  doc.text(reverseArabicLine(`طريقة الدفع: ${paymentLabel}`), lX, y + 14.5, { align: 'left' })

  y += boxH + 6

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── جدول المنتجات / الخدمات ───────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  // رأس الجدول
  doc.setFillColor(15, 23, 42) // Slate 900
  doc.roundedRect(marginL, y, contentW, 9, 2, 2, 'F')

  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)

  const colName = pageW - marginR - 4
  const colQty = pageW - marginR - 100
  const colPrice = pageW - marginR - 125
  const colTotal = marginL + 4

  doc.text(reverseArabicLine('البند / الخدمة'), colName, y + 6.5, { align: 'right' })
  doc.text(reverseArabicLine('الكمية'), colQty, y + 6.5, { align: 'right' })
  doc.text(reverseArabicLine('سعر الوحدة'), colPrice, y + 6.5, { align: 'right' })
  doc.text(reverseArabicLine('الإجمالي'), colTotal, y + 6.5, { align: 'left' })

  y += 9

  // صفوف المنتجات
  doc.setFontSize(9)
  let rowEven = false

  for (const item of data.items) {
    // تلوين الصفوف بالتناوب
    if (rowEven) {
      doc.setFillColor(248, 250, 252) // Slate 50
      doc.rect(marginL, y, contentW, item.includeInstallation ? 13 : 8.5, 'F')
    }
    rowEven = !rowEven

    // خط فاصل خفيف
    doc.setDrawColor(241, 245, 249)
    doc.setLineWidth(0.15)
    doc.line(marginL, y, pageW - marginR, y)

    doc.setTextColor(15, 23, 42) // Slate 900
    const itemName = item.name.length > 45 ? item.name.substring(0, 42) + '...' : item.name
    doc.text(reverseArabicLine(itemName), colName, y + 6, { align: 'right' })
    doc.text(reverseArabicLine(String(item.quantity)), colQty, y + 6, { align: 'right' })
    doc.text(reverseArabicLine(`${item.unitPrice.toFixed(2)} ر.س`), colPrice, y + 6, { align: 'right' })

    doc.setTextColor(15, 23, 42)
    doc.text(reverseArabicLine(`${item.totalPrice.toFixed(2)} ر.س`), colTotal, y + 6, { align: 'left' })

    y += 8.5

    // إشارة التركيب
    if (item.includeInstallation) {
      doc.setFontSize(7.5)
      doc.setTextColor(5, 150, 105) // Green 600
      doc.text(reverseArabicLine('✓ شامل أجور التركيب والتثبيت'), colName, y, { align: 'right' })
      doc.setFontSize(9)
      y += 5
    }
  }

  // خط سفلي للجدول
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  doc.line(marginL, y, pageW - marginR, y)

  y += 8

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── الملخص المالي ─────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  const summaryStartX = pageW / 2 + 10
  const summaryEndX = pageW - marginR - 4
  const valX = summaryStartX + 4

  doc.setFontSize(9)

  // المجموع الفرعي
  doc.setTextColor(71, 85, 105) // Slate 600
  doc.text(reverseArabicLine('إجمالي المنتجات:'), summaryEndX, y, { align: 'right' })
  doc.setTextColor(15, 23, 42)
  doc.text(reverseArabicLine(`${data.subtotal.toFixed(2)} ر.س`), valX, y, { align: 'left' })
  y += 6.5

  // رسوم التركيب
  if (data.installationFee > 0) {
    doc.setTextColor(71, 85, 105)
    doc.text(reverseArabicLine('رسوم التركيب والتثبيت:'), summaryEndX, y, { align: 'right' })
    doc.setTextColor(15, 23, 42)
    doc.text(reverseArabicLine(`${data.installationFee.toFixed(2)} ر.س`), valX, y, { align: 'left' })
    y += 6.5
  }

  // التوصيل
  doc.setTextColor(71, 85, 105)
  doc.text(reverseArabicLine('رسوم الشحن والتوصيل:'), summaryEndX, y, { align: 'right' })
  doc.setTextColor(5, 150, 105) // Green
  doc.text(reverseArabicLine(data.deliveryFee > 0 ? `${data.deliveryFee.toFixed(2)} ر.س` : 'مجاني'), valX, y, { align: 'left' })
  y += 8

  // خط فاصل قبل الإجمالي
  doc.setDrawColor(21, 118, 212)
  doc.setLineWidth(0.6)
  doc.line(summaryStartX, y, pageW - marginR, y)
  y += 7

  // الإجمالي النهائي
  doc.setFontSize(12)
  doc.setTextColor(21, 118, 212)
  doc.text(reverseArabicLine('المجموع النهائي:'), summaryEndX, y, { align: 'right' })

  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42) // Slate 900
  doc.text(reverseArabicLine(`${data.totalAmount.toFixed(2)} ر.س`), valX, y, { align: 'left' })

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── التذييل ───────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  const footerY = 275
  doc.setDrawColor(241, 245, 249)
  doc.setLineWidth(0.3)
  doc.line(marginL, footerY - 5, pageW - marginR, footerY - 5)

  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139) // Slate 500
  doc.text(reverseArabicLine('نشكركم لتعاملكم مع منصة تمّ لخدمات التكييف المتكاملة'), pageW / 2, footerY, { align: 'center' })

  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184) // Slate 400
  doc.text(reverseArabicLine('هذه الفاتورة صادرة إلكترونياً ولا تتطلب توقيعاً أو ختماً رسمياً'), pageW / 2, footerY + 5, { align: 'center' })

  return doc.output('arraybuffer')
}
