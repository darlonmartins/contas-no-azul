const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authenticateToken = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', notificationController.getNotifications);
router.post('/mark-as-read', notificationController.markAsRead);

module.exports = router;
