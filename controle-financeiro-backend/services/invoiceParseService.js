// backend/services/invoiceParseService.js
const pdfParse = require('pdf-parse');

/** Util: primeiros N chars pra log */
function logHead(tag, text, n = 1200) {
  const head = (text || '').slice(0, n);
  console.log(`🔎 [${tag}] head:\n\n${head}\n--- (len=${(text || '').length}) ---`);
}

/** Converte "1.234,56" ou "-12,34" => centavos (integer) */
function parsePtBrMoneyToCents(str) {
  if (!str) return null;
  const s = String(str).replace(/\s/g, '').replace(/^R\$\s*/i, '');
  const m = s.match(/^(-)?(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})$/);
  if (!m) return null;
  const sign = m[1] ? -1 : 1;
  const intPart = m[2].replace(/\./g, '');
  const decPart = m[3];
  return sign * (parseInt(intPart, 10) * 100 + parseInt(decPart, 10));
}

/** Extrai info de parcelas de uma descrição (ex.: "12/24") */
function extractInstallments(desc) {
  const m = String(desc || '').match(/(\d{1,2})\s*\/\s*(\d{1,2})/);
  if (!m) return { installmentNumber: null, totalInstallments: null };
  return { installmentNumber: Number(m[1]), totalInstallments: Number(m[2]) };
}

/** ====== PARSER NUBANK (mês por extenso: SET/OUT/...) ====== */

const PT_BR_MONTHS = {
  JAN: '01', FEV: '02', MAR: '03', ABR: '04', MAI: '05', JUN: '06',
  JUL: '07', AGO: '08', SET: '09', OUT: '10', NOV: '11', DEZ: '12',
};

// "10 OUT" ou "10 OUT 2025"
function matchDayMon(line) {
  const m = String(line || '').match(/^(\d{2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)(?:\s+(\d{4}))?$/i);
  if (!m) return null;
  return { dd: m[1], mon: m[2].toUpperCase(), yyyy: m[3] || null };
}

// Valor em BRL numa linha só
function matchBrl(line) {
  const m = String(line || '').match(/^-?\s*R?\$?\s*([0-9]{1,3}(?:\.[0-9]{3})*,\d{2})$/);
  if (!m) return null;
  return m[1];
}

function parseNubank(text, context = {}) {
  const out = [];

  // (A) Tenta “uma linha só”: "10 OUT 2025 ... R$ 123,45"
  const rxOne = /(^|\n)\s*(\d{2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)(?:\s+(\d{4}))?\s+(.+?)\s+R?\$?\s*([\-]?\d{1,3}(?:\.\d{3})*,\d{2})\s*(?=\n|$)/gi;
  let m;
  while ((m = rxOne.exec(text)) !== null) {
    const dd = m[2];
    const mon = String(m[3] || '').toUpperCase();
    const yyyy = m[4] || (context.statementMonth ? String(context.statementMonth).slice(0,4) : null);
    if (!yyyy || !PT_BR_MONTHS[mon]) continue;

    const dateISO = `${yyyy}-${PT_BR_MONTHS[mon]}-${dd}`;
    const desc = (m[5] || '').replace(/\s+/g, ' ').trim();
    const cents = parsePtBrMoneyToCents(m[6]);
    if (cents == null || !desc) continue;

    out.push({
      date: dateISO,
      description: desc,
      amountCents: cents,
      ...extractInstallments(desc),
      raw: m[0].replace(/\n/g, ' ').trim(),
    });
  }
  if (out.length) return out;

  // (B) Parsing por blocos:
  // data ("10 OUT"), depois 1..N linhas descrição, depois 1 linha de valor
  const all = String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  const yearFromCtx = (context.statementMonth && String(context.statementMonth).slice(0,4)) || null;

  let i = 0;
  while (i < all.length) {
    const hit = matchDayMon(all[i]);
    if (!hit) { i++; continue; }

    const dd = hit.dd;
    const mon = hit.mon;
    const yyyy = hit.yyyy || yearFromCtx;
    if (!yyyy || !PT_BR_MONTHS[mon]) { i++; continue; }

    i++; // vai para a próxima linha após a data
    const descParts = [];
    let amountStr = null;

    while (i < all.length) {
      const money = matchBrl(all[i]);
      if (money) { amountStr = money; i++; break; }
      if (matchDayMon(all[i])) break; // próxima compra começando

      // ignora alguns cabeçalhos óbvios
      if (/^fatura\b/i.test(all[i]) || /^pagamento\b/i.test(all[i])) { i++; continue; }

      descParts.push(all[i]);
      i++;
    }

    if (amountStr) {
      const dateISO = `${yyyy}-${PT_BR_MONTHS[mon]}-${dd}`;
      const desc = descParts.join(' ').replace(/\s+/g, ' ').trim();
      const cents = parsePtBrMoneyToCents(amountStr);
      if (cents != null && desc) {
        out.push({
          date: dateISO,
          description: desc,
          amountCents: cents,
          ...extractInstallments(desc),
          raw: `${dd} ${mon} ${yyyy || ''} | ${desc} | ${amountStr}`,
        });
      }
    }
  }

  return out;
}

/** Detecta banco e período (stub simples; ajuste se já tiver lógica própria) */
async function detectBankAndPeriod(buffer, filename) {
  const parsed = await pdfParse(buffer);
  const text = (parsed.text || '').toUpperCase();

  let bank = null;
  if (text.includes('NUBANK')) bank = 'NUBANK';

  // statementMonth com base no “FATURA 17 OUT 2025” (se tiver)
  let statementMonth = null;
  const m = text.match(/FATURA\s+\d{1,2}\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+(\d{4})/);
  if (m && PT_BR_MONTHS[m[1]]) {
    statementMonth = `${m[2]}-${PT_BR_MONTHS[m[1]]}`;
  }

  // closingDate/dueDate
  let closingDate = null, dueDate = null;
  const due = text.match(/VENCIMENTO:\s*\d{1,2}\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+(\d{4})/);
  if (due && PT_BR_MONTHS[due[1]]) {
    const dd = text.match(/VENCIMENTO:\s*(\d{1,2})/i)?.[1] || '01';
    dueDate = `${due[2]}-${PT_BR_MONTHS[due[1]]}-${dd.padStart(2,'0')}`;
  }

  return { bank, statementMonth, closingDate, dueDate };
}

/** Roteador principal */
async function parsePdfToLines(buffer, bank, extra = {}) {
  const parsed = await pdfParse(buffer);
  const text = (parsed.text || '').replace(/\r/g, '');

  const bankNorm = String(bank || '').toUpperCase().trim();

  let lines = [];
  if (bankNorm === 'NUBANK') {
    lines = parseNubank(text, { statementMonth: extra.statementMonth });
  } else {
    // fallback simples
    lines = parseNubank(text, { statementMonth: extra.statementMonth });
  }

  if (!lines.length) {
    console.warn('⚠️ [parsePdfToLines] 0 linhas extraídas. Banco:', bankNorm);
    logHead('parsePdfToLines.zero', text);
  } else {
    console.log('✅ [parsePdfToLines] linhas extraídas:', lines.length);
    console.log('🔬 primeiras 3:', lines.slice(0, 3));
  }

  return lines;
}

module.exports = {
  detectBankAndPeriod,
  parsePdfToLines,
  // exporta helpers se quiser testar
  _internals: { parseNubank, parsePtBrMoneyToCents, extractInstallments, matchDayMon, matchBrl },
};
