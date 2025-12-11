import express from 'express';
import UserController from '../controller/user-controller.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const router = express.Router();
const userController = new UserController();

// Protected routes - auth gerekli
router.get('/profile', authenticateToken, userController.getProfile.bind(userController));
router.put('/city', authenticateToken, userController.updateCity.bind(userController));
router.put('/vehicle', authenticateToken, userController.updateVehicle.bind(userController));
router.put('/change-password', authenticateToken, userController.changePassword.bind(userController));

export default router;
