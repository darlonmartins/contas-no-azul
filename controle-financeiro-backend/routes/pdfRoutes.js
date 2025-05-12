const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const pdfController = require('../controllers/pdfController');

router.get('/goals/export', authMiddleware, pdfController.exportGoalsPDF);

module.exports = router;
