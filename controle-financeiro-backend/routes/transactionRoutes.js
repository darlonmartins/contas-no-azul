const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getAllTransactions,
  getTransactionsByMonth,
  getTransactionsByDay,
  getTransactionSummary,
  deleteTransaction,
  updateTransaction,
  getTransactionsByCardAndMonth,
  getForecastByCard,
  getMonthlyForecastByCard,
} = require('../controllers/transactionController');

// Autenticação já aplicada globalmente em index.js para /api/transactions
// Não duplicar o middleware aqui.

router.post('/',                              createTransaction);
router.get('/',                               getAllTransactions);
router.get('/by-month/:month',                getTransactionsByMonth);
router.get('/by-day/:date',                   getTransactionsByDay);
router.get('/summary',                        getTransactionSummary);
router.get('/by-card/:cardId',                getTransactionsByCardAndMonth);
router.get('/card/:cardId/forecast',          getForecastByCard);
router.get('/card/:cardId/forecast-monthly',  getMonthlyForecastByCard);
router.put('/:id',                            updateTransaction);
router.delete('/:id',                         deleteTransaction);

module.exports = router;
