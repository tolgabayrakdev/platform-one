import express from 'express';
import PostController from '../controller/post-controller.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const router = express.Router();
const postController = new PostController();

// Protected routes - auth gerekli
router.get('/', authenticateToken, postController.getPosts.bind(postController));
router.get('/my', authenticateToken, postController.getMyPosts.bind(postController)); // Kendi gönderilerim
router.post('/', authenticateToken, postController.createPost.bind(postController));
router.delete('/:id', authenticateToken, postController.deletePost.bind(postController));

// Public routes - SEO için auth gerektirmez
router.get('/:id/related', postController.getRelatedPosts.bind(postController)); // Benzer gönderiler
router.get('/:id', postController.getPost.bind(postController)); // Tek gönderi (en sonda - :id parametrik)

export default router;
