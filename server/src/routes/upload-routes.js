import express from 'express';
import UploadController, { uploadMiddleware } from '../controller/upload-controller.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const router = express.Router();
const uploadController = new UploadController();

// Protected route - auth gerekli
router.post('/images', authenticateToken, uploadMiddleware, uploadController.uploadImages.bind(uploadController));

export default router;
