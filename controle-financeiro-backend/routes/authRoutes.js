const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de cadastro
router.post('/register', authController.register);

// Rota de login
router.post('/login', authController.login);

// Rota de login com Google (verifique se o nome está igual ao exportado)
router.post('/google-login', authController.googleLogin);

module.exports = router;
