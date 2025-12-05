import express from 'express';
import UserController from '../controller/user-controller.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const router = express.Router();
const userController = new UserController();

// Protected routes - auth gerekli
router.get('/profile', authenticateToken, userController.getProfile.bind(userController));
router.put('/neighborhood', authenticateToken, userController.updateNeighborhood.bind(userController));

export default router;
