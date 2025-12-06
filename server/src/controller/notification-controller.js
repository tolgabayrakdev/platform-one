import NotificationService from '../service/notification-service.js';
import HttpException from '../exceptions/http-exception.js';

export default class NotificationController {
  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Kullanıcının bildirimlerini getir
   * GET /api/notifications
   */
  async getNotifications(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await this.notificationService.getNotifications(userId, page, limit);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bildirimi okundu olarak işaretle
   * PUT /api/notifications/:id/read
   */
  async markAsRead(req, res, next) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      if (!id) {
        throw new HttpException(400, 'Bildirim ID zorunludur');
      }

      const result = await this.notificationService.markAsRead(id, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tüm bildirimleri okundu olarak işaretle
   * PUT /api/notifications/read-all
   */
  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      const result = await this.notificationService.markAllAsRead(userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Okunmamış bildirim sayısını getir
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      const count = await this.notificationService.getUnreadCount(userId);

      res.status(200).json({ unread_count: count });
    } catch (error) {
      next(error);
    }
  }
}
