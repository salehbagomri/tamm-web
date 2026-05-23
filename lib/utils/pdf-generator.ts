import { jsPDF } from 'jspdf'
import notoArabicFontData from './noto-arabic-font.json'
import logoData from './logo-tamm-base64.json'

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

  // خط Noto Sans Arabic — حديث، عصري وواضح، يدعم العربية أصلياً عبر OpenType
  doc.addFileToVFS('NotoSansArabic.ttf', notoArabicFontData.data)
  doc.addFont('NotoSansArabic.ttf', 'NotoSansArabic', 'normal')
  doc.setFont('NotoSansArabic')

  const pageW = 210
  const marginR = 15
  const marginL = 15
  const contentW = pageW - marginR - marginL
  let y = 15

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── ترويسة الفاتورة (الشعار + عنوان الفاتورة) ────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  try {
    const format = logoData.mimeType.includes('png') ? 'PNG' : 'JPEG'
    doc.addImage(
      `data:${logoData.mimeType};base64,${logoData.data}`,
      format,
      pageW - marginR - 12,
      y - 2,
      12,
      12
    )
  } catch (err) {
    console.error('[PDF-Generator] Failed to add logo image:', err)
  }

  doc.setFontSize(20)
  doc.setTextColor(21, 118, 212)
  doc.text('منصة تمّ', pageW - marginR - 15, y + 5, { align: 'right' })

  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text('لخدمات التكييف المتكاملة وأنظمة الطاقة الشمسية', pageW - marginR - 15, y + 10, { align: 'right' })

  doc.setFontSize(18)
  doc.setTextColor(15, 23, 42)
  doc.text('فاتورة مبيعات', marginL, y + 5, { align: 'left' })

  y += 18

  // كل سطر: القيمة على اليسار + التسمية بمحاذاة يمين على بُعد قصير
  doc.setFontSize(9)
  const metaRight = marginL + 50
  const metaRows: [string, string][] = [
    ['رقم الفاتورة', data.invoiceNumber],
    ['تاريخ الإصدار', data.issuedAt],
    ['رقم الطلب', `#${data.orderNumber}`],
  ]
  metaRows.forEach(([label, value], idx) => {
    const lineY = y + idx * 5
    doc.setTextColor(71, 85, 105)
    doc.text(value, marginL, lineY, { align: 'left' })
    doc.setTextColor(15, 23, 42)
    doc.text(label, metaRight, lineY, { align: 'right' })
  })

  y += 18

  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.5)
  doc.line(marginL, y, pageW - marginR, y)

  y += 8

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── بيانات العميل ─────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  const boxH = 22
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(marginL, y - 2, contentW, boxH, 3, 3, 'F')

  doc.setFontSize(10)
  doc.setTextColor(21, 118, 212)
  doc.text('معلومات العميل', pageW - marginR - 4, y + 3, { align: 'right' })

  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)

  const rX = pageW - marginR - 4
  doc.text(`الاسم: ${data.customerName}`, rX, y + 9, { align: 'right' })
  if (data.customerPhone) {
    doc.text(`رقم الجوال: ${data.customerPhone}`, rX, y + 14.5, { align: 'right' })
  }

  const lX = marginL + 4
  if (data.customerAddress) {
    doc.text(`العنوان: ${data.customerAddress}`, lX, y + 9, { align: 'left' })
  }
  const paymentLabel = data.paymentType === 'cash' ? 'نقداً عند الاستلام' :
                       data.paymentType === 'bank' ? 'تحويل بنكي' :
                       data.paymentType === 'card' ? 'بطاقة إلكترونية' :
                       data.paymentType === 'wallet' ? 'محفظة إلكترونية' : data.paymentType
  doc.text(`طريقة الدفع: ${paymentLabel}`, lX, y + 14.5, { align: 'left' })

  y += boxH + 6

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── جدول المنتجات / الخدمات ───────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  doc.setFillColor(15, 23, 42)
  doc.roundedRect(marginL, y, contentW, 9, 2, 2, 'F')

  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)

  const colName = pageW - marginR - 4
  const colQty = pageW - marginR - 100
  const colPrice = pageW - marginR - 125
  const colTotal = marginL + 4

  doc.text('البند / الخدمة', colName, y + 6.5, { align: 'right' })
  doc.text('الكمية', colQty, y + 6.5, { align: 'right' })
  doc.text('سعر الوحدة', colPrice, y + 6.5, { align: 'right' })
  doc.text('الإجمالي', colTotal, y + 6.5, { align: 'left' })

  y += 9

  doc.setFontSize(9)
  let rowEven = false

  for (const item of data.items) {
    if (rowEven) {
      doc.setFillColor(248, 250, 252)
      doc.rect(marginL, y, contentW, item.includeInstallation ? 13 : 8.5, 'F')
    }
    rowEven = !rowEven

    doc.setDrawColor(241, 245, 249)
    doc.setLineWidth(0.15)
    doc.line(marginL, y, pageW - marginR, y)

    doc.setTextColor(15, 23, 42)
    const itemName = item.name.length > 45 ? item.name.substring(0, 42) + '...' : item.name
    doc.text(itemName, colName, y + 6, { align: 'right' })
    doc.text(String(item.quantity), colQty, y + 6, { align: 'right' })

    // سعر الوحدة الصافي (بدون تركيب) — التركيب يظهر كسطر مستقل أسفل اسم البند
    const bareUnit = (item.unitPrice ?? 0).toFixed(2)
    doc.text(bareUnit, colPrice, y + 6, { align: 'right' })
    doc.text('ر.س', colPrice - doc.getTextWidth(bareUnit) - 1.5, y + 6, { align: 'right' })

    doc.setTextColor(15, 23, 42)
    // الإجمالي = (سعر صافي + تركيب) × كمية — يساوي item.totalPrice
    const totalNum = item.totalPrice.toFixed(2)
    const rasW = doc.getTextWidth('ر.س')
    doc.text('ر.س', colTotal, y + 6, { align: 'left' })
    doc.text(totalNum, colTotal + rasW + 1.5, y + 6, { align: 'left' })

    y += 8.5

    if (item.includeInstallation) {
      // حساب أجور التركيب لكل وحدة وإجمالي التركيب للسطر
      const installPerUnit = (item.totalPrice - item.unitPrice * item.quantity) / item.quantity
      const installLineTotal = installPerUnit * item.quantity
      doc.setFontSize(7.5)
      doc.setTextColor(5, 150, 105)
      doc.text(
        `🛠 خدمة التركيب: ${installLineTotal.toFixed(2)} ر.س (${installPerUnit.toFixed(2)} × ${item.quantity})`,
        colName, y, { align: 'right' }
      )
      doc.setFontSize(9)
      y += 5
    }
  }

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

  // مرسى السعر في الملخّص: نقطة ثابتة على يسار الصفحة لكل القيم تضمن محاذاة موحّدة
  const priceAnchor = valX + 28

  // رسم سعر مع عملة ر.س على يساره بمسافة 1.5 ملم
  function drawPrice(value: string, anchor: number, lineY: number) {
    doc.text(value, anchor, lineY, { align: 'right' })
    doc.text('ر.س', anchor - doc.getTextWidth(value) - 1.5, lineY, { align: 'right' })
  }

  doc.setTextColor(71, 85, 105)
  doc.text('إجمالي المنتجات (صافي)', summaryEndX, y, { align: 'right' })
  doc.setTextColor(15, 23, 42)
  drawPrice(data.subtotal.toFixed(2), priceAnchor, y)
  y += 6.5

  if (data.installationFee > 0) {
    doc.setTextColor(71, 85, 105)
    doc.text('إجمالي خدمة التركيب', summaryEndX, y, { align: 'right' })
    doc.setTextColor(5, 150, 105)
    drawPrice(data.installationFee.toFixed(2), priceAnchor, y)
    y += 6.5
  }

  doc.setTextColor(71, 85, 105)
  doc.text('رسوم الشحن والتوصيل', summaryEndX, y, { align: 'right' })
  if (data.deliveryFee > 0) {
    doc.setTextColor(5, 150, 105)
    drawPrice(data.deliveryFee.toFixed(2), priceAnchor, y)
  } else {
    doc.setTextColor(5, 150, 105)
    doc.text('مجاني', priceAnchor, y, { align: 'right' })
  }
  y += 8

  doc.setDrawColor(21, 118, 212)
  doc.setLineWidth(0.6)
  doc.line(summaryStartX, y, pageW - marginR, y)
  y += 7

  doc.setFontSize(12)
  doc.setTextColor(21, 118, 212)
  doc.text('المجموع النهائي', summaryEndX, y, { align: 'right' })

  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  drawPrice(data.totalAmount.toFixed(2), priceAnchor, y)

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── التذييل ───────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  const footerY = 275
  doc.setDrawColor(241, 245, 249)
  doc.setLineWidth(0.3)
  doc.line(marginL, footerY - 5, pageW - marginR, footerY - 5)

  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text('نشكركم لتعاملكم مع منصة تمّ لخدمات التكييف المتكاملة', pageW / 2, footerY, { align: 'center' })

  doc.setFontSize(7.5)
  doc.setTextColor(148, 163, 184)
  doc.text('هذه الفاتورة صادرة إلكترونياً ولا تتطلب توقيعاً أو ختماً رسمياً', pageW / 2, footerY + 5, { align: 'center' })

  return doc.output('arraybuffer')
}
