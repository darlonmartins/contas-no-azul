const express = require('express');
const router = express.Router();
const { createIncome } = require('../controllers/incomeController');
const authenticate = require('../middlewares/authenticate');

router.post('/income', authenticate, createIncome);

module.exports = router;
