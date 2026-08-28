import Project from '../models/Project.js';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import cloudinary from '../config/cloudinary.js';
import { createNotification } from './notificationController.js';

// ======================================================
// GET /api/projects
// Get all projects with search, filter and pagination
// ======================================================

export const getProjects = async (req, res) => {
  try {
    const { search, tag, page = 1, limit = 6 } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);

    const projectsPerPage = Math.max(parseInt(limit, 10) || 6, 1);

    const skip = (currentPage - 1) * projectsPerPage;

    const query = {};

    // Search title, description, tags or creator name
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');

      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { creatorName: searchRegex },
      ];
    }

    // Filter by tag
    if (tag && tag.trim()) {
      query.tags = {
        $regex: new RegExp(`^${tag.trim()}$`, 'i'),
      };
    }

    const totalProjects = await Project.countDocuments(query);

    const totalPages = Math.ceil(totalProjects / projectsPerPage);

    const projects = await Project.find(query)
      .populate('creator', 'profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(projectsPerPage);

    res.status(200).json({
      projects,
      currentPage,
      totalPages,
      totalProjects,
    });
  } catch (error) {
    console.error('Get projects error:', error);

    res.status(500).json({
      message: 'Failed to fetch projects',
      error: error.message,
    });
  }
};

// ======================================================
// GET /api/projects/:id
// Get single project
// Also returns userLiked and userRating
// ======================================================

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      'creator',
      'profileImage'
    );

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    let userLiked = false;
    let userRating = 0;

    if (req.user?.uid) {
      const user = await User.findOne({
        firebaseUid: req.user.uid,
      });

      if (user) {
        userLiked = project.likedBy.some(
          (userId) => userId.toString() === user._id.toString()
        );

        const existingRating = project.ratings.find(
          (item) => item.user.toString() === user._id.toString()
        );

        if (existingRating) {
          userRating = existingRating.rating;
        }
      }
    }

    res.status(200).json({
      ...project.toObject(),
      userLiked,
      userRating,
    });
  } catch (error) {
    console.error('Error fetching project:', error);

    res.status(500).json({
      message: 'Failed to fetch project',
      error: error.message,
    });
  }
};

// ======================================================
// POST /api/projects
// Create project - protected
// ======================================================

export const createProject = async (req, res) => {
  try {
    const { title, description, tags, githubLink, demoLink } = req.body;

    const { uid } = req.user;

    const user = await User.findOne({
      firebaseUid: uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    const newProject = await Project.create({
      title,
      description,
      tags: tags || [],
      githubLink,
      demoLink: demoLink || '',
      creator: user._id,
      creatorName: user.name,
      likedBy: [],
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Create project error:', error);

    res.status(500).json({
      message: 'Failed to create project',
      error: error.message,
    });
  }
};

// ======================================================
// PATCH /api/projects/:id
// Update project - owner only
// ======================================================

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user || project.creator.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to edit this project',
      });
    }

    const { title, description, tags, githubLink, demoLink } = req.body;

    Object.assign(project, {
      title: title ?? project.title,
      description: description ?? project.description,
      tags: tags ?? project.tags,
      githubLink: githubLink ?? project.githubLink,
      demoLink: demoLink ?? project.demoLink,
    });

    await project.save();

    res.status(200).json(project);
  } catch (error) {
    console.error('Update project error:', error);

    res.status(500).json({
      message: 'Failed to update project',
      error: error.message,
    });
  }
};

// ======================================================
// DELETE /api/projects/:id
// Delete project - owner only
// ======================================================

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user || project.creator.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to delete this project',
      });
    }

    // Delete project cover from Cloudinary
    if (project.coverImage) {
      try {
        const uploadIndex = project.coverImage.indexOf('/upload/');

        if (uploadIndex !== -1) {
          let publicId = project.coverImage.substring(uploadIndex + '/upload/'.length);

          publicId = publicId.replace(/^v\d+\//, '');

          publicId = publicId.replace(/\.[^/.]+$/, '');

          await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image',
          });
        }
      } catch (cleanupError) {
        console.error('Project cover cleanup error:', cleanupError);
      }
    }

    await project.deleteOne();

    // Remove deleted project from bookmarks
    await User.updateMany(
      {
        bookmarkedProjects: project._id,
      },
      {
        $pull: {
          bookmarkedProjects: project._id,
        },
      }
    );

    // Remove comments left on the deleted project
    await Comment.deleteMany({
      project: project._id,
    });

    res.status(200).json({
      message: 'Project deleted',
    });
  } catch (error) {
    console.error('Delete project error:', error);

    res.status(500).json({
      message: 'Failed to delete project',
      error: error.message,
    });
  }
};

// ======================================================
// POST /api/projects/:id/bookmark
// Bookmark project
// ======================================================

export const bookmarkProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    if (user.bookmarkedProjects.includes(project._id)) {
      return res.status(400).json({
        message: 'Project already bookmarked',
      });
    }

    user.bookmarkedProjects.push(project._id);

    await user.save();

    res.status(200).json({
      message: 'Project bookmarked successfully',
      projectId: project._id,
    });
  } catch (error) {
    console.error('Bookmark error:', error);

    res.status(500).json({
      message: 'Failed to bookmark project',
      error: error.message,
    });
  }
};

// ======================================================
// DELETE /api/projects/:id/bookmark
// Remove bookmark
// ======================================================

export const removeBookmark = async (req, res) => {
  try {
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    user.bookmarkedProjects = user.bookmarkedProjects.filter(
      (projectId) => projectId.toString() !== req.params.id
    );

    await user.save();

    res.status(200).json({
      message: 'Bookmark removed successfully',
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);

    res.status(500).json({
      message: 'Failed to remove bookmark',
      error: error.message,
    });
  }
};

// ======================================================
// GET /api/projects/bookmarks
// Get logged-in user's bookmarks
// ======================================================

export const getBookmarkedProjects = async (req, res) => {
  try {
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    }).populate('bookmarkedProjects');

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    res.status(200).json(user.bookmarkedProjects);
  } catch (error) {
    console.error('Get bookmarks error:', error);

    res.status(500).json({
      message: 'Failed to fetch bookmarked projects',
      error: error.message,
    });
  }
};

// ======================================================
// POST /api/projects/:id/rating
// Rate a project
// ======================================================

export const rateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const numericRating = Number(rating);

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const existingRating = project.ratings.find(
      (item) => item.user.toString() === user._id.toString()
    );

    if (existingRating) {
      existingRating.rating = numericRating;
    } else {
      project.ratings.push({
        user: user._id,
        rating: numericRating,
      });
    }

    const totalRating = project.ratings.reduce((sum, item) => sum + item.rating, 0);

    project.averageRating = totalRating / project.ratings.length;

    await project.save();

    await createNotification({
      recipientId: project.creator,
      actorId: user._id,
      actorName: user.name,
      type: 'rating',
      projectId: project._id,
      projectTitle: project.title,
    });

    res.status(200).json({
      message: 'Rating submitted successfully',
      averageRating: project.averageRating,
      totalRatings: project.ratings.length,
      userRating: numericRating,
    });
  } catch (error) {
    console.error('Error rating project:', error);

    res.status(500).json({
      message: 'Server error',
    });
  }
};

// ======================================================
// POST /api/projects/:id/like
// Like a project
// ======================================================

export const likeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    if (!project.likedBy) {
      project.likedBy = [];
    }

    const alreadyLiked = project.likedBy.some(
      (userId) => userId.toString() === user._id.toString()
    );

    if (alreadyLiked) {
      return res.status(400).json({
        message: 'Project already liked',
      });
    }

    project.likedBy.push(user._id);

    await project.save();

    await createNotification({
      recipientId: project.creator,
      actorId: user._id,
      actorName: user.name,
      type: 'like',
      projectId: project._id,
      projectTitle: project.title,
    });

    res.status(200).json({
      message: 'Project liked successfully',
      projectId: project._id,
      likeCount: project.likedBy.length,
    });
  } catch (error) {
    console.error('Error liking project:', error);

    res.status(500).json({
      message: 'Failed to like project',
      error: error.message,
    });
  }
};

// ======================================================
// DELETE /api/projects/:id/like
// Unlike a project
// ======================================================

export const unlikeProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found. Sync your account first.',
      });
    }

    if (!project.likedBy) {
      project.likedBy = [];
    }

    project.likedBy = project.likedBy.filter(
      (userId) => userId.toString() !== user._id.toString()
    );

    await project.save();

    res.status(200).json({
      message: 'Project unliked successfully',
      projectId: project._id,
      likeCount: project.likedBy.length,
    });
  } catch (error) {
    console.error('Error unliking project:', error);

    res.status(500).json({
      message: 'Failed to unlike project',
      error: error.message,
    });
  }
};

// ======================================================
// GET /api/projects/analytics
// Analytics
// ======================================================

export const getAnalytics = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments();

    const totalUsers = await User.countDocuments();

    // Most liked project
    const mostLikedAgg = await Project.aggregate([
      {
        $addFields: {
          likeCount: {
            $size: {
              $ifNull: ['$likedBy', []],
            },
          },
        },
      },
      {
        $sort: {
          likeCount: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          title: 1,
          likeCount: 1,
          averageRating: 1,
        },
      },
    ]);

    const mostLikedProject = mostLikedAgg[0] || {
      title: 'N/A',
      likeCount: 0,
    };

    // Most rated project
    const mostRatedAgg = await Project.aggregate([
      {
        $addFields: {
          ratingCount: {
            $size: {
              $ifNull: ['$ratings', []],
            },
          },
        },
      },
      {
        $sort: {
          ratingCount: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          title: 1,
          ratingCount: 1,
          averageRating: 1,
        },
      },
    ]);

    const mostRatedProject = mostRatedAgg[0] || {
      title: 'N/A',
      ratingCount: 0,
    };

    const totalComments = await Comment.countDocuments();

    const projects = await Project.find().select('averageRating');

    const avgRating =
      projects.length > 0
        ? (
            projects.reduce((sum, project) => sum + (project.averageRating || 0), 0) /
            projects.length
          ).toFixed(2)
        : 0;

    res.status(200).json({
      totalProjects,
      totalUsers,
      totalComments,
      averageRating: avgRating,
      mostLikedProject,
      mostRatedProject,
    });
  } catch (error) {
    console.error('Analytics error:', error);

    res.status(500).json({
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};

// ======================================================
// UPLOAD PROJECT COVER
// POST /api/projects/:id/cover-photo
// ======================================================

const uploadCoverToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'peerprojecthub/project-covers',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cover upload error:', error);

          return reject(error);
        }

        console.log('COVER UPLOAD SUCCESS:', result.secure_url);

        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
};

// ======================================================
// POST /api/projects/:id/cover-photo
// Upload / replace project cover
// ======================================================

export const uploadProjectCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No image file provided',
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found',
      });
    }

    // Confirm ownership
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user || project.creator.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: 'Not authorized to edit this project',
      });
    }

    // =====================================================
    // DELETE OLD COVER
    // =====================================================

    if (project.coverImage) {
      try {
        const uploadIndex = project.coverImage.indexOf('/upload/');

        if (uploadIndex !== -1) {
          let publicId = project.coverImage.substring(uploadIndex + '/upload/'.length);

          // Remove version
          publicId = publicId.replace(/^v\d+\//, '');

          // Remove extension
          publicId = publicId.replace(/\.[^/.]+$/, '');

          console.log('Deleting old cover:', publicId);

          await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image',
          });
        }
      } catch (cleanupError) {
        console.error('Old cover cleanup error:', cleanupError);
      }
    }

    // =====================================================
    // UPLOAD NEW COVER
    // =====================================================

    const result = await uploadCoverToCloudinary(req.file.buffer);

    project.coverImage = result.secure_url;

    await project.save();

    res.status(200).json({
      message: 'Cover image uploaded successfully',
      coverImage: project.coverImage,
    });
  } catch (error) {
    console.error('Project cover upload error:', error);

    res.status(500).json({
      message: 'Failed to upload cover image',
      error: error.message,
    });
  }
};