import { Router } from 'express';
import PollController from '../controller/poll-controller.js';
import { verifyToken, optionalAuth } from '../middleware/auth-middleware.js';

const router = Router();
const pollController = new PollController();

// Oy ver (auth gerekli)
router.post('/polls/:postId/vote', verifyToken, (req, res, next) => pollController.vote(req, res, next));

// Anket sonuçlarını getir (public, ama auth varsa user_vote döner)
router.get('/polls/:postId', optionalAuth, (req, res, next) => pollController.getPoll(req, res, next));

export default router;
