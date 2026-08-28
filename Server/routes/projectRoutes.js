import express from 'express';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  bookmarkProject,
  removeBookmark,
  getBookmarkedProjects,
  rateProject,
  likeProject,
  unlikeProject,
  getAnalytics,
  uploadProjectCover,
} from '../controllers/projectController.js';

import commentRoutes from './commentRoutes.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// ======================================================
// STATIC ROUTES FIRST
// ======================================================

// GET /api/projects
router.get(
  '/',
  getProjects
);

// GET /api/projects/bookmarks
router.get(
  '/bookmarks',
  verifyToken,
  getBookmarkedProjects
);

// GET /api/projects/analytics
router.get(
  '/analytics',
  verifyToken,
  getAnalytics
);

// ======================================================
// CREATE PROJECT
// ======================================================

// POST /api/projects
router.post(
  '/',
  verifyToken,
  createProject
);

// ======================================================
// PROJECT BY ID
// ======================================================

// GET /api/projects/:id
router.get(
  '/:id',
  verifyToken,
  getProjectById
);

// PATCH /api/projects/:id
router.patch(
  '/:id',
  verifyToken,
  updateProject
);

// DELETE /api/projects/:id
router.delete(
  '/:id',
  verifyToken,
  deleteProject
);

// ======================================================
// BOOKMARK
// ======================================================

// POST /api/projects/:id/bookmark
router.post(
  '/:id/bookmark',
  verifyToken,
  bookmarkProject
);

// DELETE /api/projects/:id/bookmark
router.delete(
  '/:id/bookmark',
  verifyToken,
  removeBookmark
);

// ======================================================
// RATING
// ======================================================

// POST /api/projects/:id/rating
router.post(
  '/:id/rating',
  verifyToken,
  rateProject
);

// ======================================================
// LIKE
// ======================================================

// POST /api/projects/:id/like
router.post(
  '/:id/like',
  verifyToken,
  likeProject
);

// DELETE /api/projects/:id/like
router.delete(
  '/:id/like',
  verifyToken,
  unlikeProject
);

// ======================================================
// COVER PHOTO
// ======================================================

// POST /api/projects/:id/cover-photo
router.post('/:id/cover-photo', verifyToken, upload.single('coverImage'), uploadProjectCover);

// ======================================================
// COMMENTS
// ======================================================

router.use(
  '/:projectId/comments',
  commentRoutes
);

export default router;