import BadgeService from '../service/badge-service.js';
import HttpException from '../exceptions/http-exception.js';

export default class BadgeController {
    constructor() {
        this.badgeService = new BadgeService();
    }

    /**
     * Kendi rozetlerimi getir
     * GET /api/users/badges
     */
    async getMyBadges(req, res, next) {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                throw new HttpException(401, 'Yetkilendirme gerekli');
            }

            const badges = await this.badgeService.getUserBadges(userId);
            const nextBadges = await this.badgeService.getNextBadgeProgress(userId);

            res.status(200).json({
                ...badges,
                next: nextBadges
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Belirli kullanıcının rozetlerini getir
     * GET /api/users/:userId/badges
     */
    async getUserBadges(req, res, next) {
        try {
            const { userId } = req.params;

            if (!userId) {
                throw new HttpException(400, 'Kullanıcı ID gerekli');
            }

            const badges = await this.badgeService.getUserBadges(userId);

            res.status(200).json(badges);
        } catch (error) {
            next(error);
        }
    }
}
