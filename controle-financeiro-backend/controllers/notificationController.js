const notificationService = require('../services/notificationService');

const getNotifications = async (req, res) => {
  try {
    // Gera notificações automáticas antes de retornar
    await notificationService.generateAutoNotifications(req.user.id);
    const notifications = await notificationService.getNotifications(req.user.id);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
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

const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ message: 'Todas as notificações foram marcadas como lidas.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRead = async (req, res) => {
  try {
    await notificationService.deleteRead(req.user.id);
    res.status(200).json({ message: 'Notificações lidas removidas.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteRead };
