import express from 'express';
import NotificationController from '../controller/notification-controller.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const router = express.Router();
const notificationController = new NotificationController();

// Protected routes - auth gerekli
router.get('/', authenticateToken, notificationController.getNotifications.bind(notificationController));
// SSE endpoint - rate limiter'dan muaf (uzun süreli bağlantı)
router.get('/stream', authenticateToken, notificationController.streamNotifications.bind(notificationController));
router.get('/unread-count', authenticateToken, notificationController.getUnreadCount.bind(notificationController));
router.put('/:id/read', authenticateToken, notificationController.markAsRead.bind(notificationController));
router.put('/comment/:commentId/read', authenticateToken, notificationController.markAsReadByCommentId.bind(notificationController));
router.put('/read-all', authenticateToken, notificationController.markAllAsRead.bind(notificationController));

export default router;
