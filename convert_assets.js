const fs = require('fs');
const path = require('path');

// 1. Convert Alexandria font to base64
console.log('=== Converting Alexandria-Regular.ttf to base64 ===');
const fontPath = path.join(__dirname, 'public', 'fonts', 'Alexandria-Regular.ttf');
const fontBuffer = fs.readFileSync(fontPath);
const fontBase64 = fontBuffer.toString('base64');
const fontJson = { name: 'Alexandria', data: fontBase64 };
fs.writeFileSync(path.join(__dirname, 'lib', 'utils', 'alexandria-font.json'), JSON.stringify(fontJson));
console.log(`Font converted: ${fontBuffer.length} bytes -> ${fontBase64.length} base64 chars`);

// 1.5 Convert Readex Pro font to base64
console.log('=== Converting Readex-Pro.ttf to base64 ===');
const readexPath = path.join(__dirname, 'public', 'fonts', 'Readex-Pro.ttf');
const readexBuffer = fs.readFileSync(readexPath);
const readexBase64 = readexBuffer.toString('base64');
const readexJson = { name: 'ReadexPro', data: readexBase64 };
fs.writeFileSync(path.join(__dirname, 'lib', 'utils', 'readex-font.json'), JSON.stringify(readexJson));
console.log(`Readex Font converted: ${readexBuffer.length} bytes -> ${readexBase64.length} base64 chars`);

// 2. Convert logo to base64
console.log('=== Converting logo-tamm.jpg to base64 ===');
const logoPath = path.join(__dirname, 'public', 'logo-tamm.jpg');
const logoBuffer = fs.readFileSync(logoPath);
const logoBase64 = logoBuffer.toString('base64');
const logoJson = { data: logoBase64, mimeType: 'image/jpeg' };
fs.writeFileSync(path.join(__dirname, 'lib', 'utils', 'logo-tamm-base64.json'), JSON.stringify(logoJson));
console.log(`Logo converted: ${logoBuffer.length} bytes -> ${logoBase64.length} base64 chars`);

console.log('Done!');
