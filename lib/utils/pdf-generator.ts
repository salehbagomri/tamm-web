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

  // تجاوز مشاكل عرض اللغة العربية في jsPDF عبر تشكيل الحروف وعكسها برمجياً
  const originalText = doc.text.bind(doc)
  doc.text = function (text: any, x: any, y: any, options?: any) {
    if (typeof text === 'string') {
      text = reverseArabicLine(text)
    } else if (Array.isArray(text)) {
      text = text.map(t => typeof t === 'string' ? reverseArabicLine(t) : t)
    }
    return originalText(text, x, y, options)
  } as any


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

// ─── خوارزمية تشكيل وعكس النصوص العربية لعرضها بشكل صحيح ──────────────────

const ARABIC_MAP: Record<string, string[]> = {
  '\u0622': ['\uFE81', '\uFE82', '\uFE81', '\uFE82'], // آ
  '\u0623': ['\uFE83', '\uFE84', '\uFE83', '\uFE84'], // أ
  '\u0624': ['\uFE85', '\uFE86', '\uFE85', '\uFE86'], // ؤ
  '\u0625': ['\uFE87', '\uFE88', '\uFE87', '\uFE88'], // إ
  '\u0626': ['\uFE89', '\uFE8A', '\uFE8B', '\uFE8C'], // ئ
  '\u0627': ['\uFE8D', '\uFE8E', '\uFE8D', '\uFE8E'], // ا
  '\u0628': ['\uFE8F', '\uFE90', '\uFE91', '\uFE92'], // ب
  '\u0629': ['\uFE93', '\uFE94', '\uFE93', '\uFE94'], // ة
  '\u062A': ['\uFE95', '\uFE96', '\uFE97', '\uFE98'], // ت
  '\u062B': ['\uFE99', '\uFE9A', '\uFE9B', '\uFE9C'], // ث
  '\u062C': ['\uFE9D', '\uFE9E', '\uFE9F', '\uFEA0'], // ج
  '\u062D': ['\uFEA1', '\uFEA2', '\uFEA3', '\uFEA4'], // ح
  '\u062E': ['\uFEA5', '\uFEA6', '\uFEA7', '\uFEA8'], // خ
  '\u062F': ['\uFEA9', '\uFEAA', '\uFEA9', '\uFEAA'], // د
  '\u0630': ['\uFEAB', '\uFEAC', '\uFEAB', '\uFEAC'], // ذ
  '\u0631': ['\uFEAD', '\uFEAE', '\uFEAD', '\uFEAE'], // ر
  '\u0632': ['\uFEAF', '\uFEB0', '\uFEAF', '\uFEB0'], // ز
  '\u0633': ['\uFEB1', '\uFEB2', '\uFEB3', '\uFEB4'], // س
  '\u0634': ['\uFEB5', '\uFEB6', '\uFEB7', '\uFEB8'], // ش
  '\u0635': ['\uFEB9', '\uFEBA', '\uFEBB', '\uFEBC'], // ص
  '\u0636': ['\uFEBD', '\uFEBE', '\uFEBF', '\uFEC0'], // ض
  '\u0637': ['\uFEC1', '\uFEC2', '\uFEC3', '\uFEC4'], // ط
  '\u0638': ['\uFEC5', '\uFEC6', '\uFEC7', '\uFEC8'], // ظ
  '\u0639': ['\uFEC9', '\uFECA', '\uFECB', '\uFECC'], // ع
  '\u063A': ['\uFECD', '\uFECE', '\uFECF', '\uFED0'], // غ
  '\u0641': ['\uFED1', '\uFED2', '\uFED3', '\uFED4'], // ف
  '\u0642': ['\uFED5', '\uFED6', '\uFED7', '\uFED8'], // ق
  '\u0643': ['\uFED9', '\uFEDA', '\uFEDB', '\uFEDC'], // ك
  '\u0644': ['\uFEDD', '\uFEDE', '\uFEDF', '\uFEE0'], // ل
  '\u0645': ['\uFEE1', '\uFEE2', '\uFEE3', '\uFEE4'], // م
  '\u0646': ['\uFEE5', '\uFEE6', '\uFEE7', '\uFEE8'], // ن
  '\u0647': ['\uFEE9', '\uFEEA', '\uFEEB', '\uFEEC'], // ه
  '\u0648': ['\uFEED', '\uFEEE', '\uFEED', '\uFEEE'], // و
  '\u0649': ['\uFEEF', '\uFEF0', '\uFEEF', '\uFEF0'], // ى
  '\u064A': ['\uFEF1', '\uFEF2', '\uFEF3', '\uFEF4'], // ي
}

const NON_LEFT_CONNECTING = new Set([
  '\u0622', '\u0623', '\u0624', '\u0625', '\u0627',
  '\u062F', '\u0630', '\u0631', '\u0632', '\u0648',
  '\u0629', 'لآ', 'لأ', 'لإ', 'لا'
])

function isArabic(char: string): boolean {
  if (!char) return false
  const code = char.charCodeAt(0)
  return (code >= 0x0600 && code <= 0x06FF) || (code >= 0xFE70 && code <= 0xFEFF)
}

function shapeArabic(text: string): string {
  if (!text) return ''

  const chars: Array<{ char: string; forms: string[] | null; isArabic: boolean; isLigature: boolean }> = []
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]
    if (char === '\u0644' && nextChar && ['\u0622', '\u0623', '\u0625', '\u0627'].includes(nextChar)) {
      let ligature = ''
      let forms: string[] = []
      if (nextChar === '\u0622') { ligature = 'لآ'; forms = ['\uFEF5', '\uFEF6', '\uFEF5', '\uFEF6']; }
      else if (nextChar === '\u0623') { ligature = 'لأ'; forms = ['\uFEF7', '\uFEF8', '\uFEF7', '\uFEF8']; }
      else if (nextChar === '\u0625') { ligature = 'لإ'; forms = ['\uFEF9', '\uFEFA', '\uFEF9', '\uFEFA']; }
      else if (nextChar === '\u0627') { ligature = 'لا'; forms = ['\uFEFB', '\uFEFC', '\uFEFB', '\uFEFC']; }
      chars.push({ char: ligature, forms, isArabic: true, isLigature: true })
      i++ 
    } else {
      const isAr = isArabic(char)
      chars.push({
        char,
        forms: ARABIC_MAP[char] || null,
        isArabic: isAr,
        isLigature: false
      })
    }
  }

  let shapedText = ''
  for (let i = 0; i < chars.length; i++) {
    const current = chars[i]
    if (!current.isArabic || !current.forms) {
      shapedText += current.char
      continue
    }

    const prev = i > 0 ? chars[i - 1] : null
    const next = i < chars.length - 1 ? chars[i + 1] : null

    const connectBefore = prev && prev.isArabic && !NON_LEFT_CONNECTING.has(prev.char) && current.char !== '\u0621'
    const connectAfter = next && next.isArabic && !NON_LEFT_CONNECTING.has(current.char) && next.char !== '\u0621'

    let formIndex = 0
    if (connectBefore && connectAfter) {
      formIndex = 3 
    } else if (connectBefore && !connectAfter) {
      formIndex = 1 
    } else if (!connectBefore && connectAfter) {
      formIndex = 2 
    }

    shapedText += current.forms[formIndex]
  }

  return shapedText
}

function reverseArabicLine(text: string): string {
  if (!text) return ''
  
  const cleanText = text.replace(/[\u064B-\u0652]/g, '')
  const shaped = shapeArabic(cleanText)
  const reversed = shaped.split('').reverse().join('')

  const final = reversed.replace(/[A-Za-z0-9+#\-\.\/:%@$]+/g, (match) => {
    return match.split('').reverse().join('')
  })

  return final
}
