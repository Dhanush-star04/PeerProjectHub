import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ======================================================
// CREATE NOTIFICATION
// ======================================================

export const createNotification = async ({
  recipientId,
  actorId,
  actorName,
  type,
  projectId,
  projectTitle,
}) => {
  try {
    // Don't notify yourself
    if (recipientId?.toString() === actorId?.toString()) {
      console.log('Notification skipped: actor and recipient are the same user');
      return null;
    }

    // Make sure all required values exist
    if (!recipientId || !actorId || !actorName || !type || !projectId || !projectTitle) {
      console.error('Notification creation failed: missing required data', {
        recipientId,
        actorId,
        actorName,
        type,
        projectId,
        projectTitle,
      });

      return null;
    }

    const notification = await Notification.create({
      recipient: recipientId,
      actor: actorId,
      actorName,
      type,
      project: projectId,
      projectTitle,
      read: false,
    });

    console.log('NOTIFICATION CREATED:', notification._id);

    return notification;
  } catch (error) {
    console.error('CREATE NOTIFICATION ERROR:', error);

    return null;
  }
};

// ======================================================
// GET NOTIFICATIONS
// GET /api/notifications
// ======================================================

export const getNotifications = async (req, res) => {
  try {
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    const notifications = await Notification.find({
      recipient: user._id,
    })
      .populate('actor', 'name email profileImage')
      .populate('project', 'title coverImage')
      .sort({
        createdAt: -1,
      });

    const unreadCount = await Notification.countDocuments({
      recipient: user._id,
      read: false,
    });

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);

    res.status(500).json({
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

// ======================================================
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read
// ======================================================

export const markAllAsRead = async (req, res) => {
  try {
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    await Notification.updateMany(
      {
        recipient: user._id,
        read: false,
      },
      {
        $set: {
          read: true,
        },
      }
    );

    res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark notifications as read error:', error);

    res.status(500).json({
      message: 'Failed to mark notifications as read',
      error: error.message,
    });
  }
};