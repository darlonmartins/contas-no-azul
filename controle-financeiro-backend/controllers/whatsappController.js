// backend/controllers/whatsappController.js
const { User, Transaction, Category, Account } = require('../models');
const whatsappService = require('../services/whatsappService');
const { parseMessage } = require('../utils/parseMessage');
const normalizePhone = require('../utils/normalizePhone');
const pairingRepo = require('../repositories/whatsappPairingRepo');

// Pendências em memória (confirmação de lançamento — curta duração, ok em memória)
const pendingByPhone = new Map();

/**
 * Idempotência de mensagens.
 * Usa o banco para persistir IDs processados — restart do servidor
 * não causa duplicação de lançamentos.
 *
 * A tabela ProcessedWhatsappMessage precisa existir:
 *   messageId VARCHAR(255) PRIMARY KEY
 *   processedAt DATETIME DEFAULT NOW()
 *
 * Se preferir não criar a tabela agora, basta substituir as chamadas
 * abaixo pelo Set em memória (menos seguro, mas funcional).
 */
async function alreadyProcessed(messageId) {
  if (!messageId) return false;
  try {
    const { ProcessedWhatsappMessage } = require('../models');
    const existing = await ProcessedWhatsappMessage.findByPk(messageId);
    if (existing) return true;
    await ProcessedWhatsappMessage.create({ messageId });
    return false;
  } catch {
    // Fallback: se o modelo não existir ainda, usa verificação simples
    return false;
  }
}

async function tryPairing(from, text) {
  const m = text.toLowerCase().match(/^vincular\s+([^\s@]+@[^\s@]+\.[^\s@]+)$/i);
  if (!m) return false;

  const email = m[1];
  const user = await User.findOne({ where: { email } });
  if (!user) {
    await whatsappService.sendText(from, `Não encontrei usuário com e-mail: ${email}`);
    return true;
  }

  await pairingRepo.upsertPairing(from, user.id);
  await whatsappService.sendText(
    from,
    `Número vinculado ao usuário: ${user.name || email}.\nAgora você pode lançar: "gastei 45,90 no mercado (alimentação) hoje no Nubank".`
  );
  return true;
}

async function resolveUserId(from) {
  const pairing = await pairingRepo.findByPhone(from);
  return pairing?.userId || null;
}

async function createTransactionFromPayload(p) {
  const { userId, type, amount, date, title, categoryName, accountName, fromAccountName, toAccountName } = p;

  const [category, account] = await Promise.all([
    categoryName ? Category.findOne({ where: { userId, name: categoryName } }) : null,
    accountName  ? Account.findOne({  where: { userId, name: accountName  } }) : null,
  ]);

  let fromAccount = null, toAccount = null;
  if (type === 'transfer') {
    [fromAccount, toAccount] = await Promise.all([
      fromAccountName ? Account.findOne({ where: { userId, name: fromAccountName } }) : null,
      toAccountName   ? Account.findOne({ where: { userId, name: toAccountName   } }) : null,
    ]);
  }

  const created = await Transaction.create({
    userId, type, amount, date,
    title: title || 'WhatsApp',
    categoryId:    category?.id    || null,
    accountId:     account?.id     || null,
    fromAccountId: fromAccount?.id || null,
    toAccountId:   toAccount?.id   || null,
  });

  return Transaction.findByPk(created.id, {
    include: [{ model: Category }, { model: Account }],
  });
}

async function handleTextMessage(msgObj) {
  const from = normalizePhone(msgObj.from);
  const text = msgObj.text?.body?.trim();
  if (!text) return;

  if (/^ajuda$/i.test(text)) {
    await whatsappService.sendText(from,
      'Exemplos:\n' +
      '- "vincular seu-email@dominio.com"\n' +
      '- "gastei 45,90 no mercado hoje no Nubank (alimentação)"\n' +
      '- "recebi 1500,00 salário 05/08 na Carteira Principal"\n' +
      'Depois responda "confirmar" para lançar.\n' +
      'Comandos rápidos: saldo | menu | cancelar'
    );
    return;
  }

  if (/^menu$/i.test(text)) {
    await whatsappService.sendText(from, 'Opcoes: saldo | ajuda | confirmar | cancelar');
    return;
  }

  if (/^saldo$/i.test(text)) {
    const userId = await resolveUserId(from);
    if (!userId) {
      await whatsappService.sendText(from, 'Para começar, envie: "vincular seu-email@dominio.com".');
      return;
    }
    // TODO: consultar saldo real do usuário
    await whatsappService.sendText(from, 'Consulta de saldo em breve disponível.');
    return;
  }

  if (await tryPairing(from, text)) return;

  if (/^confirmar$/i.test(text)) {
    const pend = pendingByPhone.get(from);
    if (!pend) {
      await whatsappService.sendText(from, 'Não há lançamento pendente.');
      return;
    }
    try {
      const created = await createTransactionFromPayload(pend.payload);
      pendingByPhone.delete(from);
      const tipo = created.type === 'income' ? 'Ganho' : created.type === 'transfer' ? 'Transferência' : 'Despesa';
      await whatsappService.sendText(from,
        `Lancado: ${tipo}\n` +
        `R$ ${Number(created.amount).toFixed(2)} - ${created.date}` +
        (created.Category ? ` - ${created.Category.name}` : '')
      );
    } catch (err) {
      console.error('Erro ao criar transação via WhatsApp:', err.message);
      await whatsappService.sendText(from, 'Erro ao lançar. Verifique os dados e tente novamente.');
    }
    return;
  }

  if (/^cancelar$/i.test(text)) {
    pendingByPhone.delete(from);
    await whatsappService.sendText(from, 'Lançamento cancelado.');
    return;
  }

  const userId = await resolveUserId(from);
  if (!userId) {
    await whatsappService.sendText(from, 'Para começar, envie: "vincular seu-email@dominio.com".');
    return;
  }

  const parsed = parseMessage(text);
  if (!parsed.amount) {
    await whatsappService.sendText(from, 'Não entendi o valor. Envie algo como: "gastei 45,90 no mercado (alimentação)".');
    return;
  }

  const payload = { from, userId, ...parsed };
  pendingByPhone.set(from, { payload });

  await whatsappService.sendText(from,
    `Vou lançar:\n` +
    `Tipo: ${payload.type}\n` +
    `Valor: R$ ${payload.amount.toFixed(2)}\n` +
    `Data: ${payload.date}\n` +
    (payload.title        ? `Descricao: ${payload.title}\n`     : '') +
    (payload.categoryName ? `Categoria: ${payload.categoryName}\n` : '') +
    (payload.accountName  ? `Conta/Cartao: ${payload.accountName}\n` : '') +
    '\nResponda "confirmar" para lançar ou "cancelar" para descartar.'
  );
}

async function handleWebhook(req, res) {
  res.sendStatus(200);

  try {
    const messages = req.body?.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!Array.isArray(messages) || messages.length === 0) return;

    for (const msg of messages) {
      const messageId = msg.id || msg.key?.id;
      if (await alreadyProcessed(messageId)) continue;

      if (msg.type === 'text') {
        await handleTextMessage(msg);
      } else {
        await whatsappService.sendText(msg.from, 'Por enquanto só entendo texto. Em breve vou aceitar fotos de comprovantes.');
      }
    }
  } catch (err) {
    console.error('Erro no webhook WhatsApp:', err?.response?.data || err.message);
  }
}

module.exports = {
  handleWebhook,
  __pendingByPhone: pendingByPhone,
};
