import PollService from '../service/poll-service.js';
import HttpException from '../exceptions/http-exception.js';

export default class PollController {
    constructor() {
        this.pollService = new PollService();
    }

    /**
     * Oy ver
     * POST /api/polls/:postId/vote
     */
    async vote(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { postId } = req.params;
            const { optionId } = req.body;

            if (!userId) {
                throw new HttpException(401, 'Yetkilendirme gerekli');
            }

            if (!postId) {
                throw new HttpException(400, 'Post ID gerekli');
            }

            if (!optionId) {
                throw new HttpException(400, 'Seçenek ID gerekli');
            }

            // Post ID'den poll ID'yi al
            const poll = await this.pollService.getPollByPostId(postId);

            if (!poll) {
                throw new HttpException(404, 'Bu gönderide anket bulunamadı');
            }

            const result = await this.pollService.vote(poll.id, optionId, userId);

            res.status(200).json({
                message: 'Oyunuz kaydedildi',
                poll: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Anket sonuçlarını getir
     * GET /api/polls/:postId
     */
    async getPoll(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { postId } = req.params;

            if (!postId) {
                throw new HttpException(400, 'Post ID gerekli');
            }

            const poll = await this.pollService.getPollByPostId(postId, userId);

            if (!poll) {
                throw new HttpException(404, 'Bu gönderide anket bulunamadı');
            }

            res.status(200).json({ poll });
        } catch (error) {
            next(error);
        }
    }
}
