const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de cadastro
router.post('/register', authController.register);

// Rota de login
router.post('/login', authController.login);

router.post('/google-login', authController.googleLogin);


module.exports = router;
