// backend/controllers/whatsappController.js
const { User, Transaction, Category, Account } = require('../models');
const whatsappService = require('../services/whatsappService');
const { parseMessage } = require('../utils/parseMessage');
const normalizePhone = require('../utils/normalizePhone');
const pairingRepo = require('../repositories/whatsappPairingRepo');

// Mantemos apenas pendências em memória
const pendingByPhone = new Map();

// Idempotência simples (opcional)
const processedMessageIds = new Set();
const MAX_IDS = 5000;
function alreadyProcessed(messageId) {
  if (!messageId) return false;
  if (processedMessageIds.has(messageId)) return true;
  processedMessageIds.add(messageId);
  if (processedMessageIds.size > MAX_IDS) {
    const first = processedMessageIds.values().next().value;
    processedMessageIds.delete(first);
  }
  return false;
}

async function tryPairing(from, text) {
  const m = text.toLowerCase().match(/^vincular\s+([^\s@]+@[^\s@]+\.[^\s@]+)$/i);
  if (!m) return false;

  const email = m[1];
  const user = await User.findOne({ where: { email } });
  if (!user) {
    await whatsappService.sendText(from, `❌ Não encontrei usuário com e-mail: ${email}`);
    return true;
  }

  await pairingRepo.upsertPairing(from, user.id); // ✅ persiste
  await whatsappService.sendText(
    from,
    `✅ Número vinculado ao usuário: ${user.name || email}.
Agora você pode lançar: "gastei 45,90 no mercado (alimentação) hoje no Nubank".`
  );
  return true;
}

async function resolveUserId(from) {
  const pairing = await pairingRepo.findByPhone(from); // ✅ lê do banco
  return pairing?.userId || null;
}

async function createTransactionFromPayload(p) {
  const {
    userId, type, amount, date, title,
    categoryName, accountName, fromAccountName, toAccountName
  } = p;

  let category = null;
  if (categoryName) {
    category = await Category.findOne({ where: { userId, name: categoryName } });
  }

  let account = null;
  if (accountName) {
    account = await Account.findOne({ where: { userId, name: accountName } });
  }

  let fromAccount = null;
  let toAccount = null;

  if (type === 'transfer') {
    if (fromAccountName) {
      fromAccount = await Account.findOne({ where: { userId, name: fromAccountName } });
    }
    if (toAccountName) {
      toAccount = await Account.findOne({ where: { userId, name: toAccountName } });
    }
  }

  const payload = {
    userId,
    type,
    amount,
    date,
    title: title || 'WhatsApp',
    categoryId: category?.id || null,
    accountId: account?.id || null,
    fromAccountId: fromAccount?.id || null,
    toAccountId: toAccount?.id || null
  };

  const created = await Transaction.create(payload, {
    include: [{ model: Category }, { model: Account }],
  });

  return Transaction.findByPk(created.id, {
    include: [{ model: Category }, { model: Account }],
  });
}

async function handleTextMessage(msgObj) {
  const from = normalizePhone(msgObj.from);
  const text = msgObj.text?.body?.trim();
  if (!text) return;

  // ajuda
  if (/^ajuda$/i.test(text)) {
    await whatsappService.sendText(from,
`📌 Exemplos:
- "vincular seu-email@dominio.com"
- "gastei 45,90 no mercado hoje no Nubank (alimentação)"
- "recebi 1500,00 salário 05/08 na Carteira Principal"
Depois responda "confirmar" para lançar.
Comandos rápidos: saldo | menu | cancelar`);
    return;
  }

  // comandos curtos
  if (/^menu$/i.test(text)) {
    await whatsappService.sendText(from, '📋 Opções: saldo | ajuda | confirmar | cancelar');
    return;
  }
  if (/^saldo$/i.test(text)) {
    // TODO: consultar saldo real do usuário (via resolveUserId(from))
    const userId = await resolveUserId(from);
    if (!userId) {
      await whatsappService.sendText(from, 'Para começar, envie: "vincular seu-email@dominio.com".');
      return;
    }
    const saldo = 'R$ 1.250,00'; // placeholder
    await whatsappService.sendText(from, `🧾 Seu saldo atual é ${saldo}`);
    return;
  }

  // vincular
  if (await tryPairing(from, text)) return;

  // confirmar/cancelar
  if (/^confirmar$/i.test(text)) {
    const pend = pendingByPhone.get(from);
    if (!pend) {
      await whatsappService.sendText(from, 'Não há lançamento pendente.');
      return;
    }
    const { payload } = pend;
    try {
      const created = await createTransactionFromPayload(payload);
      pendingByPhone.delete(from);
      await whatsappService.sendText(
        from,
        `✔️ Lançado: ${created.type === 'income' ? 'Ganho' :
                     created.type === 'transfer' ? 'Transferência' : 'Despesa'}
• R$ ${Number(created.amount).toFixed(2)} • ${created.date}${
          created.Category ? ` • ${created.Category.name}` : ''}`
      );
    } catch (err) {
      console.error('Erro ao criar transação:', err);
      await whatsappService.sendText(from, '❌ Erro ao lançar. Verifique os dados e tente novamente.');
    }
    return;
  }

  if (/^cancelar$/i.test(text)) {
    pendingByPhone.delete(from);
    await whatsappService.sendText(from, '✅ Lançamento cancelado.');
    return;
  }

  // precisa estar vinculado p/ lançar
  const userId = await resolveUserId(from);
  if (!userId) {
    await whatsappService.sendText(from, 'Para começar, envie: "vincular seu-email@dominio.com".');
    return;
  }

  // parsing do texto para transação
  const parsed = parseMessage(text);
  if (!parsed.amount) {
    await whatsappService.sendText(from, 'Não entendi o valor. Envie algo como: "gastei 45,90 no mercado (alimentação)".');
    return;
  }

  const payload = { from, userId, ...parsed };
  pendingByPhone.set(from, { payload });

  const resumo =
`Vou lançar:
• Tipo: ${payload.type}
• Valor: R$ ${payload.amount.toFixed(2)}
• Data: ${payload.date}
${payload.title ? `• Descrição: ${payload.title}\n` : ''}${
  payload.categoryName ? `• Categoria: ${payload.categoryName}\n` : ''}${
  payload.accountName ? `• Conta/Cartão: ${payload.accountName}\n` : ''}`;

  await whatsappService.sendText(from, `${resumo}\nResponda **confirmar** para lançar ou **cancelar** para descartar.`);
}

async function handleWebhook(req, res) {
  // responde 200 rápido
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;

    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        const messageId = msg.id || msg.key?.id;
        if (alreadyProcessed(messageId)) continue;

        if (msg.type === 'text') {
          await handleTextMessage(msg);
        } else {
          await whatsappService.sendText(msg.from, 'Por enquanto só entendo texto. Em breve vou aceitar fotos de comprovantes 📷.');
        }
      }
    }
  } catch (err) {
    console.error('Erro no webhook WhatsApp:', err?.response?.data || err.message);
  }
}

module.exports = {
  handleWebhook,
  __pendingByPhone: pendingByPhone
};
