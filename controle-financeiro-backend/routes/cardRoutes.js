const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas protegidas por autenticação
router.post('/', authMiddleware, cardController.create);
router.get('/', authMiddleware, cardController.list);
router.get('/with-available-limit', authMiddleware, cardController.getCardsWithAvailableLimit);
router.put('/:id', authMiddleware, cardController.update);
router.delete('/:id', authMiddleware, cardController.delete);
router.get('/:id/details', cardController.getOneCardWithLimit);


module.exports = router;
