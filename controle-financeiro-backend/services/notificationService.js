const { Notification } = require('../models');

const createNotification = async (data, userId) => {
  return await Notification.create({ ...data, userId });
};

const getNotifications = async (userId) => {
  return await Notification.findAll({ where: { userId } });
};

const markAsRead = async (id, userId) => {
  const notification = await Notification.findOne({ where: { id, userId } });
  if (!notification) return null;

  notification.read = true;
  await notification.save();
  return notification;
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
};
