const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * NotificationService
 * Unified system for In-App and Push Notifications
 */
class NotificationService {
  /**
   * Send notification to a specific user
   * @param {Object} params - { recipientId, gymId, title, message, type, data }
   */
  static async send(params) {
    try {
      const { recipientId, gymId, title, message, type, data } = params;

      // 1. Persist to Database (In-App)
      const notification = await Notification.create({
        recipientId,
        gymId,
        title,
        message,
        type,
        data,
        read: false
      });

      // 2. Future: Trigger FCM (Push)
      // if (userHasPushToken) {
      //   await this._sendPush(userPushToken, title, message, data);
      // }

      return notification;
    } catch (error) {
      logger.error('NotificationService Error:', error);
      throw error;
    }
  }

  /**
   * Internal method for FCM (Placeholder)
   */
  static async _sendPush(token, title, body, data) {
    // Implement firebase-admin logic here
    logger.info(`[FCM Placeholder] Sending push to ${token}: ${title}`);
  }
}

module.exports = NotificationService;
