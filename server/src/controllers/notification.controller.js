const Notification = require('../models/Notification');
const catchAsync = require('../utils/catchAsync');

/**
 * Get all notifications for the current user
 */
exports.getMyNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    data: notifications
  });
});

/**
 * Get unread notification count
 */
exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await Notification.countDocuments({ 
    recipient: req.user._id, 
    read: false 
  });

  res.json({
    success: true,
    count
  });
});

/**
 * Mark a notification as read
 */
exports.markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.json({
    success: true,
    data: notification
  });
});

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, read: false },
    { read: true }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});
