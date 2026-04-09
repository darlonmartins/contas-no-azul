const express = require('express');
const router = express.Router();
const { listFixedExpenses, cancelFutureFixed, deleteAllFixed } = require('../controllers/fixedExpenseController');

// authenticate já aplicado globalmente no index.js para /api/fixed-expenses
router.get('/',                          listFixedExpenses);
router.delete('/:fixedGroupId/future',   cancelFutureFixed);
router.delete('/:fixedGroupId/all',      deleteAllFixed);

module.exports = router;
