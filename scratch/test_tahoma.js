const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

// --- Overwrite Arabic Helper in JS ---
const ARABIC_MAP = {
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
};

const NON_LEFT_CONNECTING = new Set([
  '\u0622', '\u0623', '\u0624', '\u0625', '\u0627',
  '\u062F', '\u0630', '\u0631', '\u0632', '\u0648',
  '\u0629', 'لآ', 'لأ', 'لإ', 'لا'
]);

function isArabic(char) {
  if (!char) return false;
  const code = char.charCodeAt(0);
  return (code >= 0x0600 && code <= 0x06FF) || (code >= 0xFE70 && code <= 0xFEFF);
}

function shapeArabic(text) {
  if (!text) return '';

  const chars = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '\u0644' && nextChar && ['\u0622', '\u0623', '\u0625', '\u0627'].includes(nextChar)) {
      let ligature = '';
      let forms = [' ', ' ', ' ', ' '];
      if (nextChar === '\u0622') { ligature = 'لآ'; forms = ['\uFEF5', '\uFEF6', '\uFEF5', '\uFEF6']; }
      else if (nextChar === '\u0623') { ligature = 'لأ'; forms = ['\uFEF7', '\uFEF8', '\uFEF7', '\uFEF8']; }
      else if (nextChar === '\u0625') { ligature = 'لإ'; forms = ['\uFEF9', '\uFEFA', '\uFEF9', '\uFEFA']; }
      else if (nextChar === '\u0627') { ligature = 'لا'; forms = ['\uFEFB', '\uFEFC', '\uFEFB', '\uFEFC']; }
      chars.push({ char: ligature, forms, isArabic: true, isLigature: true });
      i++;
    } else {
      const isAr = isArabic(char);
      chars.push({
        char,
        forms: ARABIC_MAP[char] || null,
        isArabic: isAr,
        isLigature: false
      });
    }
  }

  let shapedText = '';
  for (let i = 0; i < chars.length; i++) {
    const current = chars[i];
    if (!current.isArabic || !current.forms) {
      shapedText += current.char;
      continue;
    }

    const prev = i > 0 ? chars[i - 1] : null;
    const next = i < chars.length - 1 ? chars[i + 1] : null;

    const connectBefore = prev && prev.isArabic && !NON_LEFT_CONNECTING.has(prev.char) && current.char !== '\u0621';
    const connectAfter = next && next.isArabic && !NON_LEFT_CONNECTING.has(current.char) && next.char !== '\u0621';

    let formIndex = 0;
    if (connectBefore && connectAfter) {
      formIndex = 3;
    } else if (connectBefore && !connectAfter) {
      formIndex = 1;
    } else if (!connectBefore && connectAfter) {
      formIndex = 2;
    }

    shapedText += current.forms[formIndex];
  }

  return shapedText;
}

function reverseArabicLine(text) {
  if (!text) return '';
  const shaped = shapeArabic(text);
  const reversed = shaped.split('').reverse().join('');
  const final = reversed.replace(/[A-Za-z0-9+#\-\.\/:]+/g, (match) => {
    return match.split('').reverse().join('');
  });
  return final;
}

// --- Main Testing Logic for Tahoma ---
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

// Load Tahoma from C:\Windows\Fonts\tahoma.ttf
try {
  const tahomaBuffer = fs.readFileSync('C:\\Windows\\Fonts\\tahoma.ttf');
  const tahomaBase64 = tahomaBuffer.toString('base64');
  doc.addFileToVFS('Tahoma.ttf', tahomaBase64);
  doc.addFont('Tahoma.ttf', 'Tahoma', 'normal');
  console.log('✅ Loaded Tahoma font successfully');
} catch (err) {
  console.error('❌ Failed to load Tahoma font:', err.message);
}

const testText = 'منصة تمّ لخدمات التكييف المتكاملة (#TM-0073) - السعر: 30.00 ر.س';
const reversedText = reverseArabicLine(testText);

doc.setFont('Tahoma');
doc.setFontSize(16);
doc.text('Testing Tahoma Font with jsPDF & shaping', 10, 20);

doc.setFontSize(12);
doc.text('Font: Tahoma', 15, 35);
doc.text(reversedText, 195, 42, { align: 'right' });

const buffer = doc.output('arraybuffer');
fs.writeFileSync(path.join(__dirname, '..', 'test_tahoma.pdf'), Buffer.from(buffer));
console.log('Done! Generated test_tahoma.pdf');
