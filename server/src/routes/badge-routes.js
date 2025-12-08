import { Router } from 'express';
import BadgeController from '../controller/badge-controller.js';
import { verifyToken, optionalAuth } from '../middleware/auth-middleware.js';

const router = Router();
const badgeController = new BadgeController();

// Kendi rozetlerimi getir (auth gerekli)
router.get('/users/badges', verifyToken, (req, res, next) => badgeController.getMyBadges(req, res, next));

// Belirli kullanıcının rozetlerini getir (public)
router.get('/users/:userId/badges', optionalAuth, (req, res, next) =>
    badgeController.getUserBadges(req, res, next)
);

export default router;
