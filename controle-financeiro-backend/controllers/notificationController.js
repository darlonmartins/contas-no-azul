const notificationService = require('../services/notificationService');

const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationService.getNotifications(req.user.id);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ message: 'Notificação marcada como lida.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getNotifications, markAsRead };
