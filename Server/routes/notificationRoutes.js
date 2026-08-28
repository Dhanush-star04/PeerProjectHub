import express from 'express';

import {
  getNotifications,
  markAllAsRead,
} from '../controllers/notificationController.js';

import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// ======================================================
// GET NOTIFICATIONS
// GET /api/notifications
// ======================================================

router.get(
  '/',
  verifyToken,
  getNotifications
);

// ======================================================
// MARK ALL AS READ
// PATCH /api/notifications/read
// ======================================================

router.patch(
  '/read',
  verifyToken,
  markAllAsRead
);

export default router;