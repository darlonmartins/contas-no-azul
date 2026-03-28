const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { Op } = require('sequelize');

const {
  Invoice,
  Card,
  Account,
  Transaction,
  InvoiceFile,
  ParsedTransaction,
} = require('../models');

const { getCardBillingPeriod } = require('../utils/getCardBillingPeriod');
const { detectBankAndPeriod, parsePdfToLines } = require('../services/invoiceParseService');

const isDev = process.env.NODE_ENV !== 'production';

/* =========================
 * Helpers
 * ========================= */
function toDateISO(v) {
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;               // YYYY-MM-DD
  const m = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);   // DD/MM/YYYY
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return null;
}
function toMonthKey(v) {
  if (!v) return null;
  if (/^\d{4}-\d{2}$/.test(v)) return v;                     // YYYY-MM
  const m = String(v).match(/^(\d{2})\/(\d{4})$/);           // MM/YYYY
  if (m) return `${m[2]}-${m[1]}`;
  return null;
}
function safeBank(v) {
  if (!v || typeof v !== 'string') return null;
  const b = v.trim();
  return b || null;
}

async function calcularTotalFatura(card, month, userId) {
  const [startDate, endDate] = getCardBillingPeriod(month, card.fechamento);
  const transacoes = await Transaction.findAll({
    where: {
      cardId: card.id,
      userId,
      type: 'despesa_cartao',
      date: { [Op.between]: [startDate, endDate] },
    },
  });
  const total = transacoes.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  return Number(total.toFixed(2));
}


async function updateAccountAfterPayment(accountId, value) {
  if (!accountId) return;
  const account = await Account.findByPk(accountId);
  if (!account) return;
  const novoSaldo = parseFloat(account.saldoAtual || 0) - parseFloat(value || 0);
  await account.update({ saldoAtual: novoSaldo });
}

/** Cria/atualiza fatura do mês e retorna a instância */
async function createInvoiceIfNeeded(cardId, month, userId) {
  // LOG de entrada
  console.log('🧾 [createInvoiceIfNeeded] IN', { cardId, month, userId });

  const existing = await Invoice.findOne({ where: { cardId, month, userId } });
  const card = await Card.findOne({ where: { id: cardId, userId } });
  if (!card) throw new Error('Cartão não encontrado.');

  const [startDate, endDate] = getCardBillingPeriod(month, card.fechamento);

  // LOG do período calculado
// LOG do período calculado
console.log('🧾 [createInvoiceIfNeeded] PERIOD', {
  startDate,
  endDate,
  fechamento: card.fechamento,
  dueDate: card.dueDate
});

const transactions = await Transaction.findAll({
  where: {
    userId,
    cardId,
    type: 'despesa_cartao',
    date: { [Op.between]: [startDate, endDate] },
    // ❌ REMOVIDO: filtro que limitava a apenas a 1ª parcela
    // [Op.or]: [
    //   { isInstallment: false },
    //   { isInstallment: true, installmentNumber: 1 },
    // ],
  },
  order: [['date', 'ASC'], ['id', 'ASC']],
});

// LOG das transações contadas (mostra amostra)
console.log('🧾 [createInvoiceIfNeeded] TX COUNT', transactions.length);
transactions.slice(0, 5).forEach((t, i) => {
  console.log('   • tx', i, {
    id: t.id,
    date: t.date,
    amount: t.amount,
    isInstallment: t.isInstallment,
    inst: t.installmentNumber,
    total: t.totalInstallments,
    title: t.title,
  });
});

// (opcional, mas útil no diagnóstico) total calculado
const amount = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
console.log('🧾 [createInvoiceIfNeeded] TOTAL', Number(amount).toFixed(2));


  console.log('🧾 [createInvoiceIfNeeded] TOTAL', amount);

  if (!existing) {
    const newInvoice = await Invoice.create({ cardId, month, userId, amount });
    console.log(`🧾 Fatura criada automaticamente para ${month}`);
    return newInvoice;
  } else {
    existing.amount = amount;
    await existing.save();
    console.log(`🔄 Fatura existente atualizada para ${month}`);
    return existing;
  }
}


/* =========================
 * Controller
 * ========================= */
const invoiceController = {
  markAsPaid: async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, paymentDate, accountId } = req.body;
      const userId = req.user.id;

      const invoice = await Invoice.findOne({ where: { id, userId } });
      if (!invoice) return res.status(404).json({ message: 'Fatura não encontrada.' });

      const card = await Card.findOne({ where: { id: invoice.cardId, userId } });
      if (!card) return res.status(404).json({ message: 'Cartão não encontrado.' });

      const valorPago = parseFloat(amount);
      if (isNaN(valorPago) || valorPago <= 0) {
        return res.status(400).json({ message: 'Valor inválido.' });
      }

      invoice.paid = true;
      invoice.paymentDate = paymentDate || new Date();
      invoice.amount = valorPago;
      await invoice.save();

      const novoDisponivel = Math.min(
        parseFloat(card.availableLimit ?? 0) + valorPago,
        parseFloat(card.limit ?? 0)
      );
      card.availableLimit = novoDisponivel;
      await card.save();

      if (accountId) {
        const account = await Account.findByPk(accountId);
        if (account) {
          account.saldoAtual = parseFloat(account.saldoAtual || 0) - valorPago;
          await account.save();
        }
      }

      return res.json({ message: 'Fatura paga com sucesso.', invoice, card });
    } catch (error) {
      console.error('❌ Erro ao marcar fatura como paga:', error);
      return res.status(500).json({ message: 'Erro interno ao marcar fatura.' });
    }
  },

  unpayInvoice: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const invoice = await Invoice.findOne({ where: { id, userId } });
      if (!invoice) return res.status(404).json({ message: 'Fatura não encontrada.' });

      const card = await Card.findOne({ where: { id: invoice.cardId, userId } });
      if (!card) return res.status(404).json({ message: 'Cartão não encontrado.' });

      const total = await calcularTotalFatura(card, invoice.month, userId);

      if (invoice.paid) {
        const novoDisponivel = Math.max(parseFloat(card.availableLimit ?? 0) - total, 0);
        card.availableLimit = novoDisponivel;
        await card.save();

        invoice.paid = false;
        invoice.paymentDate = null;
        invoice.amount = total;
        await invoice.save();
      }

      return res.json({ message: 'Fatura desmarcada como paga com sucesso.', invoice, card });
    } catch (err) {
      console.error('❌ Erro ao desfazer pagamento da fatura:', err);
      return res.status(500).json({ message: 'Erro interno ao desfazer pagamento da fatura.' });
    }
  },

  createIfNotExists: async (req, res) => {
    try {
      const { cardId, month } = req.body;
      const userId = req.user.id;
      const invoice = await createInvoiceIfNeeded(cardId, month, userId);
      return res.json({ message: 'Fatura verificada/criada com sucesso.', invoice });
    } catch (error) {
      console.error('❌ Erro ao criar/verificar fatura:', error);
      return res.status(500).json({ error: 'Erro ao criar/verificar fatura.' });
    }
  },

  listByCard: async (req, res) => {
    try {
      const { cardId } = req.params;
      const userId = req.user.id;
      const invoices = await Invoice.findAll({
        where: { cardId, userId },
        order: [['month', 'DESC']],
      });
      res.json(invoices);
    } catch (error) {
      console.error('❌ Erro ao listar faturas do cartão:', error);
      res.status(500).json({ message: 'Erro ao listar faturas.' });
    }
  },

  getInvoiceInfo: async (req, res) => {
    try {
      const { cardId, month } = req.query;
      const userId = req.user.id;

      if (!cardId || !month) {
        return res.status(400).json({ message: 'Parâmetros cardId e month são obrigatórios.' });
      }

      const card = await Card.findOne({ where: { id: cardId, userId } });
      if (!card) return res.status(404).json({ message: 'Cartão não encontrado.' });

      const invoice = await Invoice.findOne({ where: { cardId, month, userId } });

      const [year, monthStr] = month.split('-');
      const monthNum = parseInt(monthStr, 10) - 1;

      const closingDate = new Date(year, monthNum, card.fechamento);
      const dueDate     = new Date(year, monthNum, card.dueDate);

      // ====== cálculo "estilo PDF" (opcional) ======
      // 1) período do ciclo
      const { getCardBillingPeriod } = require('../utils/getCardBillingPeriod');
      const [startDateISO, endDateISO] = getCardBillingPeriod(month, card.fechamento);

      // 2) buscar linhas do staging (se houver invoiceFile do mês)
      let statementTotalPdfLike = null;
      try {
        // procura um arquivo de fatura associado ao mesmo cartao/mês
        const invFile = await InvoiceFile.findOne({
          where: { userId, cardId, statementMonth: month },
          attributes: ['id']
        });

        if (invFile) {
          const rows = await ParsedTransaction.findAll({
            where: { invoiceFileId: invFile.id },
            order: [['date', 'ASC'], ['id', 'ASC']],
          });

          const toBRL = c => Math.round(Number(c)) / 100;

          // separa por tipo
          let purchases = 0;
          let payments  = 0;
          let prevBal   = 0;
          let fees      = 0;

          for (const r of rows) {
            const desc = (r.description || '').toLowerCase();

            // só considera compras dentro do período do ciclo
            const inPeriod = r.date >= startDateISO.slice(0,10) && r.date <= endDateISO.slice(0,10);

            const isPayment = desc.startsWith('pagamento') || desc.includes('pagamentos e financiamentos');
            const isPrevBal = desc.includes('saldo restante da fatura anterior');
            const isFee     = desc.includes('encargos') || desc.includes('juros') || desc.includes('iof');

            if (isPayment) {
              payments += toBRL(r.amount);            // parser já trouxe sinal correto (positivo), mas tratamos como saída
            } else if (isPrevBal) {
              prevBal  += toBRL(r.amount);
            } else if (isFee) {
              fees     += toBRL(r.amount);
            } else if (inPeriod) {
              purchases += toBRL(r.amount);
            }
          }

          // total no formato do cabeçalho do Nubank:
          // saldo anterior + compras + encargos - pagamentos
          statementTotalPdfLike = Number((prevBal + purchases + fees - payments).toFixed(2));
        }
      } catch (e) {
        // silencioso – se não houver staging, segue null
      }

      return res.json({
        cardName: card.name,
        brand: card.brand,
        limit: card.limit,
        availableLimit: card.availableLimit,
        closingDate,
        dueDate,
        total: invoice ? invoice.amount : 0,          // seu "Fatura Atual" (somente compras do período)
        statementTotalPdfLike,                        // 👈 total no formato do PDF, se conseguimos calcular
        invoiceId: invoice?.id || null,
        paid: invoice?.paid || false,
      });
    } catch (error) {
      console.error('❌ Erro ao obter dados da fatura:', error);
      return res.status(500).json({ message: 'Erro ao obter dados da fatura.' });
    }
  },

  forecast: async (req, res) => {
    try {
      const userId = req.user.id;
      const { cardId } = req.params;
      const { month } = req.query;

      const card = await Card.findOne({ where: { id: cardId, userId } });
      if (!card) return res.status(404).json({ error: 'Cartão não encontrado' });

      const monthKey = month || new Date().toISOString().slice(0, 7);
      const [startDate, endDate] = getCardBillingPeriod(monthKey, card.fechamento);

      const total = await Transaction.sum('amount', {
  where: {
    userId,
    cardId: card.id,
    type: 'despesa_cartao',
    date: { [Op.between]: [startDate, endDate] },
  },
});


      return res.json({
        cardId: card.id,
        name: card.name,
        limit: Number(card.limit || 0),
        availableLimit: Number(card.availableLimit ?? card.limit ?? 0),
        currentCycleTotal: Number(total || 0),
        closingDate: card.fechamento,
        dueDate: card.dueDate,
        period: { start: startDate, end: endDate },
        month: monthKey,
      });
    } catch (e) {
      console.error('forecast error', e);
      return res.status(500).json({ error: 'Erro ao prever fatura' });
    }
  },

  // Upload do PDF com dedup + normalizações + fallbacks
// Upload do PDF com dedup + normalizações + fallbacks
uploadInvoice: async (req, res) => {
  // variáveis que também serão usadas no catch
  let fileHash = null;
  let statementMonth = null;
  let cardId = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo não enviado. Campo "file".' });
    }

    cardId = req.body?.cardId ? Number(req.body.cardId) : null;
    if (!cardId) return res.status(400).json({ message: 'cardId é obrigatório.' });

    // valida dono do cartão
    const ownedCard = await Card.findOne({ where: { id: cardId, userId: req.user.id } });
    if (!ownedCard) {
      try { await fs.promises.unlink(req.file.path); } catch {}
      return res.status(404).json({ message: 'Cartão não encontrado para este usuário.' });
    }

    // hash + normalizações
    const buffer   = await fs.promises.readFile(req.file.path);
    fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const filePath = req.file.path.replace(/\\/g, '/');

    // dedupe proativo por usuário+hash
    const already = await InvoiceFile.findOne({
      where: { userId: req.user.id, fileHash },
      attributes: ['id','bank','statementMonth','closingDate','dueDate']
    });
    if (already) {
      try { await fs.promises.unlink(req.file.path); } catch {}
      return res.status(409).json({
        message: 'Fatura já enviada',
        id: already.id,
        bank: already.bank,
        statementMonth: already.statementMonth,
        closingDate: already.closingDate,
        dueDate: already.dueDate,
      });
    }

    // metadados (não trava se falhar)
    let det = {};
    try { det = await detectBankAndPeriod(buffer, req.file.originalname); } catch {}

    const bank        = (typeof det.bank === 'string' && det.bank.trim()) ? det.bank.trim() : null;
    statementMonth    = toMonthKey(det.statementMonth) || null; // "YYYY-MM"
    const closingDate = toDateISO(det.closingDate);
    const dueDate     = toDateISO(det.dueDate);

    // dedupe extra por (user, card, mês) se mês for conhecido
    if (statementMonth) {
      const dupMonth = await InvoiceFile.findOne({
        where: { userId: req.user.id, cardId, statementMonth },
        attributes: ['id','bank','statementMonth','closingDate','dueDate']
      });
      if (dupMonth) {
        try { await fs.promises.unlink(req.file.path); } catch {}
        return res.status(409).json({
          message: 'Fatura deste cartão/mês já enviada',
          id: dupMonth.id,
          bank: dupMonth.bank,
          statementMonth: dupMonth.statementMonth,
          closingDate: dupMonth.closingDate,
          dueDate: dupMonth.dueDate,
        });
      }
    }

    // cria o registro
    const inv = await InvoiceFile.create({
      userId: req.user.id,
      cardId,
      bank,                // se seu model exigir ENUM, garanta que BANK aceite null ou 'DESCONHECIDO'
      statementMonth,      // "YYYY-MM"
      closingDate,         // "YYYY-MM-DD" | null
      dueDate,             // "YYYY-MM-DD" | null
      filePath,
      fileHash,
      status: 'uploaded',
    });

    return res.status(201).json({
      id: inv.id,
      bank: inv.bank,
      statementMonth: inv.statementMonth,
      closingDate: inv.closingDate,
      dueDate: inv.dueDate,
    });

  } catch (e) {
    // alguns bancos do Sequelize reportam UNIQUE como ValidationError
    if (e.name === 'SequelizeUniqueConstraintError' || e.name === 'SequelizeValidationError') {
      try {
        // 1) tenta por hash (mesmo usuário)
        let existing = null;
        if (fileHash) {
          existing = await InvoiceFile.findOne({
            where: { userId: req.user.id, fileHash },
            attributes: ['id','bank','statementMonth','closingDate','dueDate']
          });
        }
        // 2) fallback por (user, card, mês) se soubermos o mês
        if (!existing && cardId && statementMonth) {
          existing = await InvoiceFile.findOne({
            where: { userId: req.user.id, cardId, statementMonth },
            attributes: ['id','bank','statementMonth','closingDate','dueDate']
          });
        }

        try { if (req.file) await fs.promises.unlink(req.file.path); } catch {}

        if (existing) {
          return res.status(409).json({
            message: 'Fatura já enviada',
            id: existing.id,
            bank: existing.bank,
            statementMonth: existing.statementMonth,
            closingDate: existing.closingDate,
            dueDate: existing.dueDate,
          });
        }

        // se ainda assim não achou, exponha detalhes p/ depuração
        const details = (e.errors || []).map(er => ({
          path: er.path, message: er.message, validator: er.validatorKey, value: er.value,
        }));
        return res.status(409).json({ message: 'Validation error', details });
      } catch (lookupErr) {
        try { if (req.file) await fs.promises.unlink(req.file.path); } catch {}
        return res.status(409).json({ message: 'Validation error' });
      }
    }

    console.error('uploadInvoice error', e);
    return res.status(500).json({
      message: 'Erro ao receber fatura',
      ...(isDev ? { devError: e?.message, devStack: e?.stack } : null),
    });
  }
},


// Parse do PDF → staging ParsedTransaction
parseInvoice: async (req, res) => {
  try {
    const inv = await InvoiceFile.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!inv) return res.status(404).json({ message: 'Fatura não encontrada' });

    console.log('🧩 [parseInvoice] INVOICE_FILE', {
      id: inv.id, bank: inv.bank, filePath: inv.filePath
    });

    const buffer = fs.readFileSync(inv.filePath);
    console.log('🧩 [parseInvoice] INVOICE_FILE', {
  id: inv.id,
  bank: inv.bank,
  statementMonth: inv.statementMonth,
  filePath: inv.filePath,
});

const lines = await parsePdfToLines(buffer, inv.bank, { statementMonth: inv.statementMonth });



    console.log('🧩 [parseInvoice] total linhas extraídas:', lines?.length ?? 0);
    if (Array.isArray(lines) && lines.length) {
      console.log('🧩 [parseInvoice] amostras:', lines.slice(0, 3).map((l, i) => ({
        i,
        date_raw: l.date,
        date_iso: toDateISO(l.date) || l.date,
        desc: l.description,
        amountCents: l.amountCents,
        inst: l.installmentNumber,
        total: l.totalInstallments
      })));
    }

    // limpa staging anterior
    await ParsedTransaction.destroy({ where: { invoiceFileId: inv.id } });

    // grava novas linhas (⚠️ normaliza data aqui)
    const created = await Promise.all(
      lines.map(l =>
        ParsedTransaction.create({
          userId: req.user.id,
          invoiceFileId: inv.id,
          date: toDateISO(l.date) || l.date,   // <<< normalização de data
          description: l.description,
          amount: l.amountCents,               // centavos no staging
          installmentNumber: l.installmentNumber,
          totalInstallments: l.totalInstallments,
          rawLine: l.raw,
        })
      )
    );

    await inv.update({ status: 'parsed', parsedCount: created.length });
    console.log('🧩 [parseInvoice] gravadas no staging:', created.length);
    return res.json({ parsed: created.length });
  } catch (e) {
    console.error('❌ parseInvoice error', e);
    return res.status(500).json({
      message: 'Erro ao processar fatura',
      ...(isDev ? { devError: e?.message, devStack: e?.stack } : null),
    });
  }
},


  // Preview do staging
  getPreview: async (req, res) => {
    try {
      const inv = await InvoiceFile.findOne({ where: { id: req.params.id, userId: req.user.id } });
      if (!inv) return res.status(404).json({ message: 'Fatura não encontrada' });

      const rows = await ParsedTransaction.findAll({
        where: { invoiceFileId: inv.id },
        order: [['date', 'ASC'], ['id', 'ASC']],
      });

      const toBRL = c => Math.round(Number(c)) / 100;

      return res.json({
        invoice: {
          id: inv.id,
          bank: inv.bank,
          statementMonth: inv.statementMonth,
          closingDate: inv.closingDate,
          dueDate: inv.dueDate,
        },
        rows: rows.map(r => ({
          id: r.id,
          date: r.date,
          description: r.description,
          amount: toBRL(r.amount),
          installmentNumber: r.installmentNumber,
          totalInstallments: r.totalInstallments,
        })),
      });
    } catch (e) {
      console.error('getPreview error', e);
      return res.status(500).json({
        message: 'Erro ao ler staging',
        ...(isDev ? { devError: e?.message, devStack: e?.stack } : null),
      });
    }
  },

// Import do staging → Transactions (com de-dup via importHash)
// --- Import do staging → Transactions (com de-dup via importHash)
importInvoice: async (req, res) => {
  const userId = req.user.id;
  try {
    const inv = await InvoiceFile.findOne({
      where: { id: req.params.id, userId }
    });
    if (!inv) return res.status(404).json({ message: 'Fatura não encontrada' });

    const cardId = inv.cardId || req.body.cardId;
    if (!cardId) return res.status(400).json({ message: 'Defina o cardId para importação' });

    const rows = await ParsedTransaction.findAll({
      where: { invoiceFileId: inv.id },
      order: [['date', 'ASC'], ['id', 'ASC']]
    });

    console.log(`📥 [importInvoice] INVOICE_FILE { id: ${inv.id}, bank: '${inv.bank}', statementMonth: '${inv.statementMonth}', rows: ${rows.length} }`);
    console.log(`📥 [importInvoice] linhas a importar: ${rows.length}`);

    const isPaymentOrFinancing = (d = '') => {
      const s = d.toLowerCase();
      return s.startsWith('pagamento') || s.includes('pagamentos e financiamentos');
    };
    const isRefund = (cents) => Number(cents) < 0;
    const toDecimal = (cents) => Math.round(Number(cents)) / 100;

    let imported = 0;
    let skipped = 0;

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      // Campos do staging
      const dateTx = r.date;            // YYYY-MM-DD
      const amtCents = Number(r.amount);
      const desc = r.description || '';

      // Logs de amostra (primeiras 10)
      if (i < 10) {
        console.log(`   • row ${i}`, {
          date_raw: r.date,
          amt_cents: amtCents,
          desc,
          inst: r.installmentNumber,
          total: r.totalInstallments,
        });
      }

      // Ignora pagamentos / financiamentos e créditos/estornos (valor negativo)
      if (isPaymentOrFinancing(desc) || isRefund(amtCents)) { skipped++; continue; }

      // 🔑 hash de de-dup (sempre declare antes de usar)
      const importHash = require('crypto')
        .createHash('md5')
        .update(`${cardId}|${dateTx}|${amtCents}|${desc.trim()}`)
        .digest('hex');

      const exists = await Transaction.findOne({ where: { importHash, userId } });
      if (exists) { skipped++; continue; }

      await Transaction.create({
        userId,
        type: 'despesa_cartao',
        cardId,
        amount: toDecimal(amtCents),
        date: dateTx,
        title: desc.length > 80 ? `${desc.slice(0, 77)}...` : (desc || 'Compra'),
        description: desc,
        isInstallment: !!(r.totalInstallments && r.installmentNumber),
        installmentNumber: r.installmentNumber || null,
        totalInstallments: r.totalInstallments || null,
        importHash,
      });

      imported++;
    }

    await inv.update({ status: 'imported', importedCount: imported });
    console.log(`✅ [importInvoice] imported/ skipped: ${imported} ${skipped}`);
    return res.json({ imported, skipped });

  } catch (e) {
    console.error('❌ importInvoice error', e);
    return res.status(500).json({
      message: 'Erro ao importar fatura',
      ...(process.env.NODE_ENV !== 'production' ? { devError: e?.message, devStack: e?.stack } : null),
    });
  }
},



  createInvoiceIfNeeded,
};

module.exports = invoiceController;
