import User from '../models/User.js';
import Project from '../models/Project.js';
import cloudinary from '../config/cloudinary.js';

// =========================================================
// UPLOAD BUFFER TO CLOUDINARY
// =========================================================

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'peerprojecthub/profile-images',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('FULL CLOUDINARY ERROR:', error);
          reject(error);
          return;
        }

        console.log('CLOUDINARY UPLOAD SUCCESS:', result.secure_url);

        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

// =========================================================
// SYNC USER
// POST /api/users/sync
// =========================================================

export const syncUser = async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    const displayName = name || req.body.name || email.split('@')[0];

    let user = await User.findOne({
      firebaseUid: uid,
    });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        name: displayName,
        email,
      });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Sync user error:', error);

    res.status(500).json({
      message: 'Failed to sync user',
      error: error.message,
    });
  }
};

// =========================================================
// GET MY PROFILE
// GET /api/users/me
// =========================================================

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    const projects = await Project.find({
      creator: user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      user,
      projects,
    });
  } catch (error) {
    console.error('Get my profile error:', error);

    res.status(500).json({
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
};

// =========================================================
// GET USER BY ID
// GET /api/users/:id
// =========================================================

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const projects = await Project.find({
      creator: user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      user,
      projects,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);

    res.status(500).json({
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

// =========================================================
// UPDATE MY PROFILE
// PATCH /api/users/profile
// =========================================================

export const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;

    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    // =====================================================
    // NAME VALIDATION
    // =====================================================

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        message: 'Name cannot be empty',
      });
    }

    // =====================================================
    // UPDATE NAME
    // =====================================================

    if (name !== undefined) {
      user.name = name.trim();
    }

    // =====================================================
    // UPDATE BIO
    // =====================================================

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    await user.save();

    const projects = await Project.find({
      creator: user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
      projects,
    });
  } catch (error) {
    console.error('Update profile error:', error);

    res.status(500).json({
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};

// =========================================================
// UPLOAD PROFILE PHOTO
// POST /api/users/profile/photo
// =========================================================

export const uploadProfilePhoto = async (req, res) => {
  try {
    // =====================================================
    // CHECK FILE
    // =====================================================

    if (!req.file) {
      return res.status(400).json({
        message: 'Please select an image',
      });
    }

    // =====================================================
    // FIND USER
    // =====================================================

    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    // =====================================================
    // UPLOAD TO CLOUDINARY
    // =====================================================

    const result = await uploadToCloudinary(req.file.buffer);

    // =====================================================
    // DELETE OLD PROFILE IMAGE
    // =====================================================

    if (user.profileImage) {
      try {
        const oldPublicId = extractCloudinaryPublicId(user.profileImage);

        if (oldPublicId) {
          console.log('Deleting old profile image:', oldPublicId);

          await cloudinary.uploader.destroy(oldPublicId, {
            resource_type: 'image',
          });
        }
      } catch (cleanupError) {
        console.error('Old profile image cleanup error:', cleanupError);
      }
    }

    // =====================================================
    // SAVE NEW URL
    // =====================================================

    user.profileImage = result.secure_url;

    await user.save();

    // =====================================================
    // RESPONSE
    // =====================================================

    res.status(200).json({
      message: 'Profile photo updated successfully',

      profileImage: user.profileImage,

      user,
    });
  } catch (error) {
    console.error('Profile photo upload error:', error);

    res.status(500).json({
      message: 'Failed to upload profile photo',

      error: error.message,
    });
  }
};

// =========================================================
// EXTRACT CLOUDINARY PUBLIC ID
// =========================================================

const extractCloudinaryPublicId = (imageUrl) => {
  try {
    if (!imageUrl) {
      return '';
    }

    const uploadIndex = imageUrl.indexOf('/upload/');

    if (uploadIndex === -1) {
      return '';
    }

    let publicId = imageUrl.substring(uploadIndex + '/upload/'.length);

    // =====================================================
    // REMOVE TRANSFORMATION SEGMENTS
    // Example:
    // /upload/c_fill,w_200/v123456/...
    // =====================================================

    const parts = publicId.split('/');

    if (
      parts[0] &&
      (parts[0].startsWith('c_') ||
        parts[0].startsWith('w_') ||
        parts[0].startsWith('h_') ||
        parts[0].startsWith('q_') ||
        parts[0].startsWith('f_'))
    ) {
      parts.shift();
    }

    publicId = parts.join('/');

    // =====================================================
    // REMOVE VERSION
    // Example:
    // v123456/peerprojecthub/profile-images/photo.jpg
    // becomes:
    // peerprojecthub/profile-images/photo.jpg
    // =====================================================

    publicId = publicId.replace(/^v\d+\//, '');

    // =====================================================
    // REMOVE FILE EXTENSION
    // =====================================================

    publicId = publicId.replace(/\.[^/.]+$/, '');

    return publicId;
  } catch (error) {
    console.error('Cloudinary public ID extraction error:', error);

    return '';
  }
};

// =========================================================
// DELETE PROFILE PHOTO
// DELETE /api/users/profile/photo
// =========================================================

export const deleteProfilePhoto = async (req, res) => {
  try {
    // =====================================================
    // FIND USER
    // =====================================================

    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    // =====================================================
    // NO IMAGE
    // =====================================================

    if (!user.profileImage) {
      return res.status(200).json({
        message: 'No profile photo to remove',

        profileImage: '',
      });
    }

    // =====================================================
    // GET CLOUDINARY URL
    // =====================================================

    const imageUrl = user.profileImage;

    // =====================================================
    // EXTRACT PUBLIC ID
    // =====================================================

    const publicId = extractCloudinaryPublicId(imageUrl);

    console.log('Cloudinary image URL:', imageUrl);

    console.log('Deleting Cloudinary public ID:', publicId);

    // =====================================================
    // DELETE FROM CLOUDINARY
    // =====================================================

    if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: 'image',
        });

        console.log('Cloudinary delete result:', result);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);

        // We continue clearing MongoDB
        // even if Cloudinary deletion fails.
      }
    }

    // =====================================================
    // CLEAR MONGODB
    // =====================================================

    user.profileImage = '';

    await user.save();

    // =====================================================
    // RESPONSE
    // =====================================================

    res.status(200).json({
      message: 'Profile photo removed successfully',

      profileImage: '',

      user,
    });
  } catch (error) {
    console.error('Delete profile photo error:', error);

    res.status(500).json({
      message: 'Failed to remove profile photo',

      error: error.message,
    });
  }
};