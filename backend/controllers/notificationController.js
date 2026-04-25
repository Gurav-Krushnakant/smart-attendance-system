const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    let query = { user: req.user.id };
    
    if (unreadOnly === 'true') {
        query.readStatus = false;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { readStatus: true },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
