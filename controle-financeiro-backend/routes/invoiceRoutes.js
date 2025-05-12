const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authenticate = require('../middlewares/authenticate');

// 📋 Listar faturas de um cartão
router.get('/card/:cardId', authenticate, invoiceController.listByCard);

// 🔄 Criar fatura se não existir
router.post('/create', authenticate, invoiceController.createIfNotExists);

// ✅ Marcar uma fatura como paga
router.put('/:id/pay', authenticate, invoiceController.markAsPaid);

router.put('/:id/unpay', authenticate, invoiceController.unpayInvoice);

// 🧾 Obter informações da fatura por cartão e mês (dinâmico)
router.get('/invoice-info', authenticate, invoiceController.getInvoiceInfo);

module.exports = router;
