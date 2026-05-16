const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const admin = require('firebase-admin');

// Initialize Firebase Admin if credentials are provided
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    logger.info('Firebase Admin initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin:', error);
  }
} else {
  logger.warn('Firebase credentials missing. Push notifications will be simulated.');
}

/**
 * NotificationService
 * Unified system for In-App and Push Notifications
 */
class NotificationService {
  /**
   * Send notification to a specific user
   * @param {Object} params - { recipientId, gymId, title, message, type, data, pushToken }
   */
  static async send(params) {
    try {
      const { recipientId, gymId, title, message, type, data, pushToken } = params;

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

      // 2. Trigger FCM (Push)
      if (pushToken) {
         await this._sendPush(pushToken, title, message, data);
      }

      return notification;
    } catch (error) {
      logger.error('NotificationService Error:', error);
      throw error;
    }
  }

  /**
   * Internal method for FCM
   */
  static async _sendPush(token, title, body, data = {}) {
    if (!admin.apps.length) {
      logger.info(`[FCM SIMULATION] Push to ${token}: ${title} - ${body}`);
      return;
    }

    try {
      const message = {
        notification: { title, body },
        data: {
          ...data,
          // FCM data payloads must be string maps
          type: data.type || 'general',
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        token,
      };

      const response = await admin.messaging().send(message);
      logger.info(`Successfully sent message: ${response}`);
      return response;
    } catch (error) {
      logger.error('Error sending push notification:', error);
      // Don't throw, let the in-app notification succeed even if push fails
    }
  }
}

module.exports = NotificationService;
