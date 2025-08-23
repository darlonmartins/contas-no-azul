const whatsappController = require('./whatsappController');

// Pega os elementos internos expostos no controller real
const {
  __handleTextMessage,
  __pendingByPhone,
  __pairByPhone,
  __createTransactionFromPayload
} = whatsappController;

// Número padrão para simulação (pode sobrescrever no body)
const TEST_PHONE = process.env.WHATSAPP_TEST_PHONE || '5599999999999';

// POST /api/whatsapp/test/pair { email, phone? }
async function pair(req, res) {
  try {
    const phone = req.body.phone || TEST_PHONE;
    const email = String(req.body.email || '').trim();

    if (!email) {
      return res.status(400).json({ error: 'Informe email' });
    }

    // Simula mensagem "vincular email@dominio.com"
    const fakeMsg = {
      from: phone,
      text: { body: `vincular ${email}` }
    };

    await __handleTextMessage(fakeMsg);

    return res.json({
      ok: true,
      phone,
      paired: __pairByPhone.get(`pair:${phone}`) || null
    });
  } catch (e) {
    console.error('Erro no teste pair:', e);
    return res.status(500).json({ error: 'Erro ao parear' });
  }
}

// POST /api/whatsapp/test/message { text, phone? }
async function message(req, res) {
  try {
    const phone = req.body.phone || TEST_PHONE;
    const text = String(req.body.text || '').trim();

    if (!text) {
      return res.status(400).json({ error: 'Informe o texto' });
    }

    const fakeMsg = {
      from: phone,
      text: { body: text }
    };

    await __handleTextMessage(fakeMsg);

    return res.json({
      ok: true,
      phone,
      pending: __pendingByPhone.get(phone) || null
    });
  } catch (e) {
    console.error('Erro no teste message:', e);
    return res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
}

// POST /api/whatsapp/test/confirm { phone? }
async function confirm(req, res) {
  try {
    const phone = req.body.phone || TEST_PHONE;
    const pend = __pendingByPhone.get(phone);

    if (!pend) {
      return res.status(400).json({ error: 'Sem lançamento pendente' });
    }

    const created = await __createTransactionFromPayload(pend.payload);
    __pendingByPhone.delete(phone);

    return res.json({ ok: true, created });
  } catch (e) {
    console.error('Erro no teste confirm:', e);
    return res.status(500).json({ error: 'Erro ao confirmar' });
  }
}

// POST /api/whatsapp/test/cancel { phone? }
async function cancel(req, res) {
  try {
    const phone = req.body.phone || TEST_PHONE;
    __pendingByPhone.delete(phone);
    return res.json({ ok: true, canceled: true });
  } catch (e) {
    console.error('Erro no teste cancel:', e);
    return res.status(500).json({ error: 'Erro ao cancelar' });
  }
}

module.exports = { pair, message, confirm, cancel };
