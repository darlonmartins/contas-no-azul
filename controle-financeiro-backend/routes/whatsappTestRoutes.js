const express = require('express');
const router = express.Router();
const whatsappTestController = require('../controllers/whatsappTestController');

// Simula "vincular email@dominio.com"
router.post('/pair', whatsappTestController.pair);

// Simula envio de mensagem de texto
router.post('/message', whatsappTestController.message);

// Simula "confirmar"
router.post('/confirm', whatsappTestController.confirm);

// Simula "cancelar"
router.post('/cancel', whatsappTestController.cancel);

module.exports = router;
