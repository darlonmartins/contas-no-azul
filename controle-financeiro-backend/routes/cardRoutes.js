const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// ⚠️ NÃO aplique auth aqui — já está no index.js com:
// app.use('/api/cards', authenticate, cardRoutes);

// Rotas específicas primeiro
router.get('/:id/details', cardController.getOneCardWithLimit);
router.get('/with-available-limit', cardController.getCardsWithAvailableLimit);

// CRUD / resumo
router.get('/', cardController.list);
router.post('/', cardController.create);
router.put('/:id', cardController.update);
router.delete('/:id', cardController.delete);
router.get('/summary', cardController.getSummary);

module.exports = router;
