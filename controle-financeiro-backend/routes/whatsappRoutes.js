// routes/whatsappRoutes.js
const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// GET: verificação do webhook
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge); // ✅ confirma
  }
  return res.sendStatus(403); // 🔒 token errado
});

// POST: eventos do WhatsApp (mensagens, status etc.)
router.post('/webhook', whatsappController.handleWebhook);

module.exports = router;
