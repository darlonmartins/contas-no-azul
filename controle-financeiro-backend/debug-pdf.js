const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Pega o PDF mais recente na pasta de uploads
const uploadDir = path.join(__dirname, 'uploads', 'invoices');
const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.pdf'));
if (!files.length) { console.log('Nenhum PDF encontrado em', uploadDir); process.exit(1); }

const latest = files.sort().pop();
const filePath = path.join(uploadDir, latest);
console.log('📄 Analisando:', filePath);

const buffer = fs.readFileSync(filePath);

pdfParse(buffer).then(data => {
  console.log('\n📊 Páginas:', data.numpages);
  console.log('📝 Texto extraído (primeiros 2000 chars):');
  console.log('---');
  console.log((data.text || '').slice(0, 2000));
  console.log('---');
  console.log('📏 Total de chars:', (data.text || '').length);
  console.log('\n🔍 Info do PDF:', JSON.stringify(data.info, null, 2));
}).catch(err => {
  console.error('❌ Erro ao parsear PDF:', err.message);
});
