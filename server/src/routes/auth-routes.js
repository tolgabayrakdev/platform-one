import express from 'express';
import AuthController from '../controller/auth-controller.js';
import { authenticateToken } from '../middleware/auth-middleware.js';
import { authLimiter, codeLimiter, verifyLimiter } from '../middleware/rate-limiter.js';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', authLimiter, authController.register.bind(authController));
router.post('/verify-email', verifyLimiter, authController.verifyEmail.bind(authController));
router.post('/verify-phone', verifyLimiter, authController.verifyPhone.bind(authController));
router.post('/resend-email-code', codeLimiter, authController.resendEmailCode.bind(authController));
router.post('/resend-phone-code', codeLimiter, authController.resendPhoneCode.bind(authController));
router.post('/login', authLimiter, authController.login.bind(authController));

// Protected routes
router.get('/me', authenticateToken, authController.me.bind(authController));
router.post('/logout', authenticateToken, authController.logout.bind(authController));

export default router;
