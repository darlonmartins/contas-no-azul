const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');

// Rota segura para retornar dados do usuário logado
router.get('/me', authMiddleware, userController.getUserProfile);

module.exports = router;
