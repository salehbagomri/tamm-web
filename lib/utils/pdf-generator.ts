import { jsPDF } from 'jspdf'
import fontData from './amiri-font.json'

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

  // تسجيل الخط العربي (Amiri)
  doc.addFileToVFS('Amiri-Regular.ttf', fontData.data)
  doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal')
  doc.setFont('Amiri')

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
  doc.setFontSize(24)
  doc.setTextColor(21, 118, 212) // blue-primary (#1576D4)
  doc.text('منصة تمّ', pageW - marginR, y, { align: 'right' })

  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105) // text-second (Slate 600)
  doc.text('لخدمات التكييف وأنظمة الطاقة الشمسية', pageW - marginR, y + 7.5, { align: 'right' })

  // رقم الفاتورة (يسار)
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42) // text-primary (Slate 900)
  doc.text(`رقم الفاتورة: ${data.invoiceNumber}`, marginL, y, { align: 'left' })

  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105) // Slate 600
  doc.text(`تاريخ الإصدار: ${data.issuedAt}`, marginL, y + 6, { align: 'left' })

  y += 20

  // خط فاصل علوي
  doc.setDrawColor(226, 232, 240) // border (Slate 200)
  doc.setLineWidth(0.4)
  doc.line(marginL, y, pageW - marginR, y)
  y += 8

  // ─── بيانات العميل ──────────────────────────────────────────────────────

  doc.setFontSize(11)
  doc.setTextColor(21, 118, 212) // blue-primary
  doc.text('معلومات العميل والخدمة', pageW - marginR, y, { align: 'right' })
  y += 7

  // صندوق معلومات رمادي فاتح
  doc.setFillColor(248, 250, 252) // bg-surface (Slate 50)
  doc.rect(marginL, y - 2, contentW, 26, 'F')
  doc.setDrawColor(241, 245, 249)
  doc.rect(marginL, y - 2, contentW, 26, 'S')

  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42) // Slate 900

  // كتابة البيانات داخل الصندوق (يمين ويسار)
  const rightColX = pageW - marginR - 4
  const leftColX = marginL + 4

  // العمود الأيمن
  doc.text(`الاسم: ${data.customerName}`, rightColX, y + 4, { align: 'right' })
  if (data.customerPhone) {
    doc.text(`رقم الجوال: ${data.customerPhone}`, rightColX, y + 10, { align: 'right' })
  }
  doc.text(`رقم الطلب: #${data.orderNumber}`, rightColX, y + 16, { align: 'right' })

  // العمود الأيسر
  if (data.customerAddress) {
    doc.text(`العنوان: ${data.customerAddress}`, leftColX, y + 4, { align: 'left' })
  }
  const paymentLabel = data.paymentType === 'cash' ? 'نقداً عند الاستلام' :
                       data.paymentType === 'card' ? 'بطاقة دفع إلكتروني' :
                       data.paymentType === 'transfer' || data.paymentType === 'bank' ? 'تحويل بنكي' : data.paymentType
  doc.text(`طريقة الدفع: ${paymentLabel}`, leftColX, y + 10, { align: 'left' })

  y += 30

  // ─── جدول المنتجات/الخدمات ─────────────────────────────────────────────

  // رأس الجدول
  doc.setFillColor(15, 23, 42) // Slate 900
  doc.rect(marginL, y, contentW, 9, 'F')

  doc.setFontSize(9.5)
  doc.setTextColor(255, 255, 255) // White

  const colX = {
    name: pageW - marginR - 3,
    qty: pageW - marginR - 95,
    price: pageW - marginR - 120,
    total: marginL + 3,
  }

  doc.text('البند / الخدمة', colX.name, y + 6, { align: 'right' })
  doc.text('الكمية', colX.qty, y + 6, { align: 'right' })
  doc.text('سعر الوحدة', colX.price, y + 6, { align: 'right' })
  doc.text('الإجمالي', colX.total, y + 6, { align: 'left' })

  y += 9

  // صفوف المنتجات
  doc.setTextColor(15, 23, 42) // Slate 900
  doc.setFontSize(9)

  for (const item of data.items) {
    // خط فاصل خفيف بين الصفوف
    doc.setDrawColor(241, 245, 249) // Slate 100
    doc.setLineWidth(0.2)
    doc.line(marginL, y, pageW - marginR, y)

    y += 1.5

    const itemName = item.name.length > 45 ? item.name.substring(0, 42) + '...' : item.name
    doc.text(itemName, colX.name, y + 5, { align: 'right' })
    doc.text(String(item.quantity), colX.qty, y + 5, { align: 'right' })
    doc.text(`${item.unitPrice.toFixed(0)} ر.س`, colX.price, y + 5, { align: 'right' })
    doc.text(`${item.totalPrice.toFixed(0)} ر.س`, colX.total, y + 5, { align: 'left' })

    y += 8.5

    // إشارة التركيب
    if (item.includeInstallation) {
      doc.setFontSize(7.5)
      doc.setTextColor(5, 150, 105) // success (Green 600)
      doc.text('+ شامل أجور التركيب والتثبيت', colX.name, y, { align: 'right' })
      doc.setTextColor(15, 23, 42) // reset to Slate 900
      doc.setFontSize(9)
      y += 5.5
    }
  }

  y += 3

  // ─── الملخص المالي ──────────────────────────────────────────────────────

  doc.setDrawColor(226, 232, 240) // Slate 200
  doc.setLineWidth(0.4)
  doc.line(marginL, y, pageW - marginR, y)
  y += 7

  const summaryX = pageW - marginR - 3
  const summaryValX = marginL + 3

  doc.setFontSize(9.5)
  doc.setTextColor(71, 85, 105) // Slate 600

  // المجموع الفرعي
  doc.text('إجمالي المنتجات والخدمات:', summaryX, y, { align: 'right' })
  doc.setTextColor(15, 23, 42) // Slate 900
  doc.text(`${data.subtotal.toFixed(2)} ر.س`, summaryValX, y, { align: 'left' })
  y += 6.5

  // رسوم التركيب
  if (data.installationFee > 0) {
    doc.setTextColor(71, 85, 105)
    doc.text('رسوم التركيب والتثبيت الإضافية:', summaryX, y, { align: 'right' })
    doc.setTextColor(15, 23, 42)
    doc.text(`${data.installationFee.toFixed(2)} ر.s`, summaryValX, y, { align: 'left' })
    y += 6.5
  }

  // رسوم التوصيل
  doc.setTextColor(71, 85, 105)
  doc.text('رسوم الشحن والتوصيل:', summaryX, y, { align: 'right' })
  doc.setTextColor(5, 150, 105) // Green 600
  doc.text(data.deliveryFee > 0 ? `${data.deliveryFee.toFixed(2)} ر.س` : 'مجاني', summaryValX, y, { align: 'left' })
  y += 8

  // خط الإجمالي
  doc.setDrawColor(21, 118, 212) // Tamm Blue
  doc.setLineWidth(0.5)
  doc.line(marginL + 80, y, pageW - marginR, y)
  y += 7

  // الإجمالي النهائي
  doc.setFontSize(13)
  doc.setTextColor(21, 118, 212) // Tamm Blue
  doc.text('المجموع النهائي (شامل ضريبة القيمة المضافة):', summaryX, y, { align: 'right' })
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42) // Slate 900
  doc.text(`${data.totalAmount.toFixed(2)} ر.س`, summaryValX, y, { align: 'left' })
  y += 10

  // ─── التذييل ────────────────────────────────────────────────────────────

  const footerY = 275
  doc.setDrawColor(241, 245, 249)
  doc.setLineWidth(0.3)
  doc.line(marginL, footerY - 5, pageW - marginR, footerY - 5)

  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139) // Slate 500
  doc.text('نشكركم لتعاملكم مع منصة تمّ لخدمات التكييف المتكاملة', pageW / 2, footerY, { align: 'center' })
  doc.setFontSize(7.5)
  doc.text('هذه الفاتورة صادرة إلكترونياً ولا تتطلب توقيعاً أو ختماً رسمياً', pageW / 2, footerY + 5, { align: 'center' })

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
