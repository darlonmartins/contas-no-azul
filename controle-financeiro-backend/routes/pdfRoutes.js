const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const pdfController = require('../controllers/pdfController');

// todas protegidas
router.get('/monthly-report', authenticate, pdfController.monthlyReport);

module.exports = router;
