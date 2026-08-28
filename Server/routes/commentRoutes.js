import express from 'express';
import { getComments, createComment, deleteComment } from '../controllers/commentController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router({ mergeParams: true }); // needed to access :projectId from parent route

router.get('/', getComments);
router.post('/', verifyToken, createComment);
router.delete('/:commentId', verifyToken, deleteComment);

export default router;