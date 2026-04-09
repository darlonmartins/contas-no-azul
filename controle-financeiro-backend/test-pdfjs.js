const path = require('path');
const fs = require('fs');

async function testPdfJs() {
  const uploadDir = path.join(__dirname, 'uploads', 'invoices');
  const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.pdf'));
  if (!files.length) { console.log('Nenhum PDF encontrado'); return; }
  const latest = files.sort().pop();
  const filePath = path.join(uploadDir, latest);
  console.log('📄 Testando:', filePath);

  const data = new Uint8Array(fs.readFileSync(filePath));

  try {
    // pdfjs-dist v4 legacy para Node.js
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');
    
    const doc = await pdfjsLib.getDocument({
      data,
      disableWorker: true,
      useWorkerFetch: false,
      isEvalSupported: false,
    }).promise;

    console.log('📊 Páginas:', doc.numPages);

    let fullText = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    console.log('📝 Texto (primeiros 1000 chars):');
    console.log('---');
    console.log(fullText.slice(0, 1000));
    console.log('---');
    console.log('📏 Total chars:', fullText.length);
  } catch (e) {
    console.error('❌ pdfjs-dist falhou:', e.message);
    
    // Tenta abordagem alternativa com import dinâmico
    try {
      console.log('🔄 Tentando import dinâmico...');
      const { getDocument } = await import('pdfjs-dist');
      const doc = await getDocument({ data }).promise;
      console.log('📊 Páginas (ESM):', doc.numPages);
      
      let fullText = '';
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      console.log('📝 Texto ESM (primeiros 1000 chars):');
      console.log('---');
      console.log(fullText.slice(0, 1000));
      console.log('---');
      console.log('📏 Total chars:', fullText.length);
    } catch (e2) {
      console.error('❌ ESM também falhou:', e2.message);
    }
  }
}

testPdfJs();
