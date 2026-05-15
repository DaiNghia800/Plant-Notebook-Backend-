const { messaging } = require('../config/firebase');

class NotificationService {
  static async sendReminderNotification(token, title, body, data = {}) {
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: data,
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    try {
      const response = await messaging.send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async sendToMultipleTokens(tokens, title, body, data = {}) {
    const messages = tokens.map(token => ({
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: data,
    }));

    try {
      const response = await messaging.sendAll(messages);
      console.log('Successfully sent messages:', response);
      return response;
    } catch (error) {
      console.error('Error sending messages:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;