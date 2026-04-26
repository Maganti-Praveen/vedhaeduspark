const Notification = require('../models/Notification');

// Helper to create a notification
const createNotification = async (userId, type, title, message, link = '') => {
  try {
    await Notification.create({ userId, type, title, message, link });
  } catch (err) {
    console.error('Notification create error:', err.message);
  }
};

module.exports = { createNotification };
