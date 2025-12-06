import express from 'express';
import CommentController from '../controller/comment-controller.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const router = express.Router();
const commentController = new CommentController();

// Protected routes - auth gerekli
router.post('/posts/:postId/comments', authenticateToken, commentController.createComment.bind(commentController));
router.get('/posts/:postId/comments', commentController.getComments.bind(commentController)); // Public - yorumları herkes görebilir
router.delete('/comments/:id', authenticateToken, commentController.deleteComment.bind(commentController));

export default router;
