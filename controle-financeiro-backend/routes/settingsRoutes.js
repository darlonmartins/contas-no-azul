const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Autenticação já aplicada globalmente em index.js para /api/settings
// Não duplicar o middleware aqui.

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

module.exports = router;
