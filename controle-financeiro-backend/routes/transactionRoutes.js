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
  getForecastByCard, // ✅ importação existente
  getMonthlyForecastByCard, // ✅ NOVA importação que faltou
} = require('../controllers/transactionController');
const authenticate = require('../middlewares/authMiddleware');

router.use(authenticate);

router.post('/', createTransaction);
router.get('/', getAllTransactions);
router.get('/by-month/:month', getTransactionsByMonth);
router.get('/by-day/:date', getTransactionsByDay);
router.get('/summary', getTransactionSummary);
router.get('/by-card/:cardId', getTransactionsByCardAndMonth);
router.get('/card/:cardId/forecast', getForecastByCard); // ✅ rota correta
router.get('/card/:cardId/forecast-monthly', getMonthlyForecastByCard); // ✅ rota nova para gráfico
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
