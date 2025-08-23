const { parse, isValid, format } = require('date-fns');
const { ptBR } = require('date-fns/locale');

function normalizeAmount(str) {
  if (!str) return null;
  const cleaned = str.replace(/\./g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function extractAmount(text) {
  const m = text.match(/(\d{1,3}(\.\d{3})*|\d+)[,\.]\d{2}/);
  return m ? normalizeAmount(m[0]) : null;
}

function extractDate(text) {
  const lower = text.toLowerCase();

  if (/\bhoje\b/.test(lower)) {
    return format(new Date(), 'yyyy-MM-dd');
  }
  if (/\bontem\b/.test(lower)) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return format(d, 'yyyy-MM-dd');
  }

  const m = lower.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\b/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = m[2].padStart(2, '0');
    const year = m[3] || String(new Date().getFullYear());
    const parsed = parse(`${day}/${month}/${year}`, 'dd/MM/yyyy', new Date(), { locale: ptBR });
    if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
  }

  return format(new Date(), 'yyyy-MM-dd');
}

function extractType(text) {
  const lower = text.toLowerCase();
  if (/\b(recebi|ganhei|entrada|renda|salário)\b/.test(lower)) return 'income';
  if (/\b(transferi|transferência)\b/.test(lower)) return 'transfer';
  return 'expense';
}

function extractBetweenParens(text) {
  const m = text.match(/\(([^)]+)\)/);
  return m ? m[1].trim() : null;
}

function extractAccount(text) {
  const m = text.match(/\b(no|na|cart[aã]o)\s+([A-Za-z0-9\s\-]+)\b/i);
  return m ? m[2].trim() : null;
}

function extractTitle(text) {
  const m = text.match(/\b(no|na|em)\s+([A-Za-z0-9\-\s]+)/i);
  return m ? m[2].trim() : 'Lançamento via WhatsApp';
}

// NOVO: extrai contas origem/destino para transferências
function extractAccountsForTransfer(text) {
  const m = text.match(/\bda\s+(.+?)\s+para\s+(.+)/i);
  if (m) {
    return {
      fromAccountName: m[1].trim(),
      toAccountName: m[2].trim()
    };
  }
  return {};
}

function parseMessage(text) {
  const amount = extractAmount(text);
  const date = extractDate(text);
  const type = extractType(text);
  const categoryName = extractBetweenParens(text);
  const accountName = extractAccount(text);
  const title = extractTitle(text);

  const transferAccounts = type === 'transfer' ? extractAccountsForTransfer(text) : {};

  return { amount, date, type, categoryName, accountName, title, ...transferAccounts };
}

module.exports = { parseMessage };
