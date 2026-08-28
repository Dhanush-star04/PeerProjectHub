import express from 'express';

import {
  syncUser,
  getMyProfile,
  getUserById,
  updateProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from '../controllers/userController.js';

import verifyToken from '../middleware/verifyToken.js';

import multer from 'multer';

const router = express.Router();

// =========================================================
// MULTER
// =========================================================

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Only JPG, PNG and WEBP images are allowed'
        )
      );
    }
  },
});

// =========================================================
// SYNC
// =========================================================

router.post(
  '/sync',
  verifyToken,
  syncUser
);

// =========================================================
// MY PROFILE
// =========================================================

router.get(
  '/me',
  verifyToken,
  getMyProfile
);

// =========================================================
// UPDATE PROFILE
// =========================================================

router.patch(
  '/profile',
  verifyToken,
  updateProfile
);

// =========================================================
// UPLOAD PROFILE PHOTO
// =========================================================

router.post(
  '/profile/photo',
  verifyToken,
  upload.single('profileImage'),
  uploadProfilePhoto
);

// =========================================================
// DELETE PROFILE PHOTO
// =========================================================

router.delete(
  '/profile/photo',
  verifyToken,
  deleteProfilePhoto
);

// =========================================================
// USER PROFILE BY ID
// IMPORTANT: KEEP THIS LAST
// =========================================================

router.get(
  '/:id',
  verifyToken,
  getUserById
);

export default router;