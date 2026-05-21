const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

const logoData = require('./lib/utils/logo-tamm-base64.json');

const fontsDir = path.join(__dirname, 'public', 'fonts');

function generateInvoice(fontName, fontFile, outputFile) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  const fontBase64 = fs.readFileSync(fontFile).toString('base64');
  doc.addFileToVFS(`${fontName}.ttf`, fontBase64);
  doc.addFont(`${fontName}.ttf`, fontName, 'normal');
  doc.setFont(fontName);

  const pageW = 210;
  const marginR = 15;
  const marginL = 15;
  const contentW = pageW - marginR - marginL;
  let y = 15;

  // ─── الشعار والترويسة ─────────────────────────────────────
  try {
    doc.addImage(
      `data:${logoData.mimeType};base64,${logoData.data}`,
      'PNG', pageW - marginR - 12, y - 2, 12, 12
    );
  } catch {}

  doc.setFontSize(20);
  doc.setTextColor(21, 118, 212);
  doc.text('منصة تمّ', pageW - marginR - 15, y + 5, { align: 'right' });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('لخدمات التكييف المتكاملة وأنظمة الطاقة الشمسية', pageW - marginR - 15, y + 10, { align: 'right' });

  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text('فاتورة مبيعات', marginL, y + 5, { align: 'left' });

  y += 18;
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('رقم الفاتورة: INV-2026-0010', marginL, y, { align: 'left' });
  doc.text('تاريخ الإصدار: 21-05-2026م', marginL, y + 5, { align: 'left' });
  doc.text('رقم الطلب: #TM-0064', marginL, y + 10, { align: 'left' });

  // خط فاصل حقيقي
  doc.setFontSize(7);
  doc.setTextColor(180, 180, 180);
  doc.text(`الخط المستخدم: ${fontName}`, pageW - marginR, y + 10, { align: 'right' });

  y += 18;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(marginL, y, pageW - marginR, y);
  y += 8;

  // ─── بيانات العميل ─────────────────────────────────────────
  const boxH = 22;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginL, y - 2, contentW, boxH, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(21, 118, 212);
  doc.text('معلومات العميل', pageW - marginR - 4, y + 3, { align: 'right' });

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  const rX = pageW - marginR - 4;
  const lX = marginL + 4;
  doc.text('الاسم: صالح باقعمري', rX, y + 9, { align: 'right' });
  doc.text('رقم الجوال: 0501234567', rX, y + 14.5, { align: 'right' });
  doc.text('العنوان: الرياض، حي النسيم، شارع الأمير سلمان', lX, y + 9, { align: 'left' });
  doc.text('طريقة الدفع: نقداً عند الاستلام', lX, y + 14.5, { align: 'left' });

  y += boxH + 6;

  // ─── جدول المنتجات ─────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(marginL, y, contentW, 9, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  const colName = pageW - marginR - 4;
  const colQty = pageW - marginR - 100;
  const colPrice = pageW - marginR - 125;
  const colTotal = marginL + 4;

  doc.text('البند / الخدمة', colName, y + 6.5, { align: 'right' });
  doc.text('الكمية', colQty, y + 6.5, { align: 'right' });
  doc.text('سعر الوحدة', colPrice, y + 6.5, { align: 'right' });
  doc.text('الإجمالي', colTotal, y + 6.5, { align: 'left' });
  y += 9;

  const items = [
    { name: 'مكيف سبليت 18 بارد جداري', qty: 2, price: 1500, total: 3400, install: true },
    { name: 'فلتر مكيف داخلي قياسي', qty: 4, price: 35, total: 140, install: false },
    { name: 'خدمة صيانة دورية شاملة', qty: 1, price: 200, total: 200, install: false },
  ];

  let rowEven = false;
  for (const item of items) {
    if (rowEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginL, y, contentW, item.install ? 13 : 8.5, 'F');
    }
    rowEven = !rowEven;

    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.15);
    doc.line(marginL, y, pageW - marginR, y);

    doc.setTextColor(15, 23, 42);
    doc.text(item.name, colName, y + 6, { align: 'right' });
    doc.text(String(item.qty), colQty, y + 6, { align: 'right' });
    doc.text(`${item.price.toFixed(2)} ر.س`, colPrice, y + 6, { align: 'right' });
    doc.text(`${item.total.toFixed(2)} ر.س`, colTotal, y + 6, { align: 'left' });
    y += 8.5;

    if (item.install) {
      doc.setFontSize(7.5);
      doc.setTextColor(5, 150, 105);
      doc.text('✓ شامل أجور التركيب والتثبيت', colName, y, { align: 'right' });
      doc.setFontSize(9);
      y += 5;
    }
  }

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(marginL, y, pageW - marginR, y);
  y += 8;

  // ─── الملخص المالي ─────────────────────────────────────────
  const summaryEndX = pageW - marginR - 4;
  const valX = pageW / 2 + 14;

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('إجمالي المنتجات:', summaryEndX, y, { align: 'right' });
  doc.setTextColor(15, 23, 42);
  doc.text('3,140.00 ر.س', valX, y, { align: 'left' });
  y += 6.5;

  doc.setTextColor(71, 85, 105);
  doc.text('رسوم التركيب والتثبيت:', summaryEndX, y, { align: 'right' });
  doc.setTextColor(15, 23, 42);
  doc.text('400.00 ر.س', valX, y, { align: 'left' });
  y += 6.5;

  doc.setTextColor(71, 85, 105);
  doc.text('رسوم الشحن والتوصيل:', summaryEndX, y, { align: 'right' });
  doc.setTextColor(5, 150, 105);
  doc.text('مجاني', valX, y, { align: 'left' });
  y += 8;

  doc.setDrawColor(21, 118, 212);
  doc.setLineWidth(0.6);
  doc.line(valX - 5, y, pageW - marginR, y);
  y += 7;

  doc.setFontSize(12);
  doc.setTextColor(21, 118, 212);
  doc.text('المجموع النهائي:', summaryEndX, y, { align: 'right' });
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('3,740.00 ر.س', valX, y, { align: 'left' });

  // ─── التذييل ───────────────────────────────────────────────
  const footerY = 275;
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.3);
  doc.line(marginL, footerY - 5, pageW - marginR, footerY - 5);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('نشكركم لتعاملكم مع منصة تمّ لخدمات التكييف المتكاملة', pageW / 2, footerY, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('هذه الفاتورة صادرة إلكترونياً ولا تتطلب توقيعاً أو ختماً رسمياً', pageW / 2, footerY + 5, { align: 'center' });

  const buffer = doc.output('arraybuffer');
  fs.writeFileSync(outputFile, Buffer.from(buffer));
  console.log(`✅ ${fontName}: ${outputFile} (${buffer.byteLength} bytes)`);
}

// Generate both invoices
console.log('=== Generating full invoice with Readex Pro ===');
generateInvoice('ReadexPro', path.join(fontsDir, 'Readex-Pro.ttf'), 'invoice_readex_pro.pdf');

console.log('=== Generating full invoice with Noto Sans Arabic ===');
generateInvoice('NotoSansArabic', path.join(fontsDir, 'NotoSansArabic.ttf'), 'invoice_noto_sans.pdf');

console.log('\nDone! Open both PDFs to compare.');
