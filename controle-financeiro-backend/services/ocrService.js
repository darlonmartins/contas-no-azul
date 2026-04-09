// backend/services/ocrService.js
const Tesseract = require('tesseract.js');
const { fromBuffer } = require('pdf2pic');
const path = require('path');
const os = require('os');
const fs = require('fs');

/**
 * Converte PDF em texto via OCR.
 * Retorna o texto completo extraído de todas as páginas.
 */
async function extractTextFromPdfOCR(buffer) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocr-'));

  try {
    // Converte cada página do PDF em imagem PNG
    const converter = fromBuffer(buffer, {
      density: 200,          // DPI — maior = mais preciso, mais lento
      saveFilename: 'page',
      savePath: tmpDir,
      format: 'png',
      width: 1654,
      height: 2339,
    });

    // Descobre número de páginas e converte todas
    const firstResult = await converter(1, { responseType: 'image' });
    
    // Tenta converter até 10 páginas
    const maxPages = 10;
    const images = [firstResult];
    
    for (let p = 2; p <= maxPages; p++) {
      try {
        const img = await converter(p, { responseType: 'image' });
        if (img && img.path) images.push(img);
      } catch {
        break; // acabaram as páginas
      }
    }

    console.log(`🔍 [OCR] ${images.length} página(s) convertida(s) para imagem`);

    // OCR em cada página
    let fullText = '';
    for (let i = 0; i < images.length; i++) {
      const imgPath = images[i].path;
      if (!imgPath || !fs.existsSync(imgPath)) continue;

      console.log(`🔍 [OCR] processando página ${i + 1}...`);
      const { data } = await Tesseract.recognize(imgPath, 'por', {
        logger: () => {}, // silencia logs do tesseract
      });

      fullText += `\n--- PÁGINA ${i + 1} ---\n${data.text}\n`;
    }

    console.log(`✅ [OCR] texto extraído: ${fullText.length} chars`);
    return fullText;

  } finally {
    // Limpa arquivos temporários
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  }
}

module.exports = { extractTextFromPdfOCR };
