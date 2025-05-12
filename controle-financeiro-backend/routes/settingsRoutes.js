const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const settingsController = require('../controllers/settingsController');

router.get('/', authMiddleware, settingsController.getSettings);
router.put('/', authMiddleware, settingsController.updateSettings);

module.exports = router;
