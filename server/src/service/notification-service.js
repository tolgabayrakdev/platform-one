import pool from '../config/database.js';
import HttpException from '../exceptions/http-exception.js';

export default class NotificationService {
  /**
   * Kullanıcının bildirimlerini getir
   */
  async getNotifications(userId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        n.id,
        n.type,
        n.message,
        n.is_read,
        n.created_at,
        n.post_id,
        n.comment_id
      FROM notifications n
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1',
      [userId]
    );

    const unreadCountResult = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    const total = parseInt(countResult.rows[0].count);
    const unreadCount = parseInt(unreadCountResult.rows[0].count);

    return {
      notifications: result.rows.map((notif) => ({
        id: notif.id,
        type: notif.type,
        message: notif.message,
        is_read: notif.is_read,
        created_at: notif.created_at,
        post_id: notif.post_id,
        comment_id: notif.comment_id
      })),
      unread_count: unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Bildirimi okundu olarak işaretle
   */
  async markAsRead(notificationId, userId) {
    // Bildirim var mı ve bu kullanıcıya ait mi kontrol et
    const checkResult = await pool.query(
      'SELECT user_id FROM notifications WHERE id = $1',
      [notificationId]
    );

    if (checkResult.rows.length === 0) {
      throw new HttpException(404, 'Bildirim bulunamadı');
    }

    if (checkResult.rows[0].user_id !== userId) {
      throw new HttpException(403, 'Bu bildirimi görüntüleme yetkiniz yok');
    }

    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1',
      [notificationId]
    );

    return { message: 'Bildirim okundu olarak işaretlendi' };
  }

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  async markAllAsRead(userId) {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    return { message: 'Tüm bildirimler okundu olarak işaretlendi' };
  }

  /**
   * Okunmamış bildirim sayısını getir
   */
  async getUnreadCount(userId) {
    const result = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    return parseInt(result.rows[0].count);
  }
}
