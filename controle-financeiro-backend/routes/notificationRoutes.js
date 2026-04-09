const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// authenticate já aplicado globalmente no index.js para /api/notifications
router.get('/',           notificationController.getNotifications);
router.put('/:id/read',   notificationController.markAsRead);
router.put('/read-all',   notificationController.markAllAsRead);
router.delete('/read',    notificationController.deleteRead);

module.exports = router;
