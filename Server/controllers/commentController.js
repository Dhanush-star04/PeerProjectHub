import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import { createNotification } from './notificationController.js';

// GET /api/projects/:projectId/comments — list comments for a project
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ project: req.params.projectId }).sort({
      createdAt: -1,
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch comments', error: error.message });
  }
};

// POST /api/projects/:projectId/comments — add a comment (protected)
export const createComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user)
      return res
        .status(404)
        .json({ message: 'User not found. Sync your account first.' });

    const comment = await Comment.create({
      project: req.params.projectId,
      author: user._id,
      authorName: user.name,
      text,
    });

    // Notify the project owner (skipped automatically if they commented on their own project)
    const project = await Project.findById(req.params.projectId);
    if (project) {
      await createNotification({
        recipientId: project.creator,
        actorId: user._id,
        actorName: user.name,
        type: 'comment',
        projectId: project._id,
        projectTitle: project.title,
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment', error: error.message });
  }
};

// DELETE /api/projects/:projectId/comments/:commentId — delete a comment (protected)
// Allowed for the comment's author OR the project's owner.
export const deleteComment = async (req, res) => {
  try {
    const { projectId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.project.toString() !== projectId) {
      return res.status(400).json({ message: 'Comment does not belong to this project' });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Sync your account first.' });
    }

    const project = await Project.findById(projectId);

    const isCommentAuthor = comment.author.toString() === user._id.toString();
    const isProjectOwner = project && project.creator.toString() === user._id.toString();

    if (!isCommentAuthor && !isProjectOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();

    res.status(200).json({ message: 'Comment deleted', commentId });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete comment', error: error.message });
  }
};