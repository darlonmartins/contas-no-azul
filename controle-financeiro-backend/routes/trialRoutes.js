const express = require('express');
const router = express.Router();
const trialController = require('../controllers/trialController');
const authenticate = require('../middlewares/authenticate');

// Iniciar período de trial
router.post('/start', authenticate, trialController.startTrial);

// Verificar status do trial
router.get('/status', authenticate, trialController.checkTrialStatus);

// Registrar pagamento
router.post('/payment', authenticate, trialController.registerPayment);

module.exports = router;
