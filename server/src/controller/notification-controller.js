import NotificationService from '../service/notification-service.js';
import notificationManager from '../service/notification-manager.js';
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

      // Bildirim sayısını güncelle
      const count = await this.notificationService.getUnreadCount(userId);
      notificationManager.sendNotification(userId, { type: 'unread_count', count });

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

      // Bildirim sayısını güncelle
      const count = await this.notificationService.getUnreadCount(userId);
      notificationManager.sendNotification(userId, { type: 'unread_count', count });

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

  /**
   * Comment ID'ye göre bildirimi okundu olarak işaretle
   * PUT /api/notifications/comment/:commentId/read
   */
  async markAsReadByCommentId(req, res, next) {
    try {
      const userId = req.user?.userId;
      const { commentId } = req.params;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      if (!commentId) {
        throw new HttpException(400, 'Yorum ID zorunludur');
      }

      const result = await this.notificationService.markAsReadByCommentId(commentId, userId);

      // Bildirim sayısını güncelle
      const count = await this.notificationService.getUnreadCount(userId);
      notificationManager.sendNotification(userId, { type: 'unread_count', count });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * SSE endpoint - Anlık bildirimler için
   * GET /api/notifications/stream
   */
  async streamNotifications(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      // SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Nginx için
      res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // İlk bağlantıda mevcut sayıyı gönder
      const initialCount = await this.notificationService.getUnreadCount(userId);
      res.write(`data: ${JSON.stringify({ type: 'unread_count', count: initialCount })}\n\n`);

      // Bağlantıyı manager'a ekle
      notificationManager.addConnection(userId, res);

      // Keep-alive ping (her 30 saniyede bir)
      const pingInterval = setInterval(() => {
        try {
          res.write(': ping\n\n');
        } catch (error) {
          clearInterval(pingInterval);
        }
      }, 30000);

      // Bağlantı kapandığında temizle
      req.on('close', () => {
        clearInterval(pingInterval);
        notificationManager.removeConnection(userId, res);
        res.end();
      });

      // Hata durumunda temizle
      res.on('error', () => {
        clearInterval(pingInterval);
        notificationManager.removeConnection(userId, res);
      });
    } catch (error) {
      next(error);
    }
  }
}
