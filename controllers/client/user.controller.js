const { json } = require('sequelize');
const { User } = require('../../models');
const NotificationService = require('../../services/client/notification.service');

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.updateFcmToken = async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.fcmToken = fcmToken;
    await user.save();
    return res.status(200).json({ message: 'FCM token updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.sendTestNotification = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByPk(userId);
    if (!user || !user.fcmToken) {
      return res.status(404).json({ message: 'User or FCM token not found' });
    }

    await NotificationService.sendReminderNotification(
      user.fcmToken,
      'Thông báo thử nghiệm',
      'Đây là một thông báo kiểm tra từ backend.',
      { type: 'test' },
    );

    return res.status(200).json({ message: 'Test notification sent successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

