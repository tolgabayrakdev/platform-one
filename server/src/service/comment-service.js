import pool from '../config/database.js';
import HttpException from '../exceptions/http-exception.js';

export default class CommentService {
  /**
   * Bir gönderiye yorum ekle veya yoruma cevap ver
   */
  async createComment(postId, userId, content, parentCommentId = null) {
    // Gönderi var mı kontrol et
    const postCheck = await pool.query('SELECT id FROM posts WHERE id = $1', [postId]);
    if (postCheck.rows.length === 0) {
      throw new HttpException(404, 'Gönderi bulunamadı');
    }

    // Eğer parent comment varsa, kontrol et
    if (parentCommentId) {
      const parentCheck = await pool.query(
        'SELECT id, post_id FROM comments WHERE id = $1',
        [parentCommentId]
      );
      if (parentCheck.rows.length === 0) {
        throw new HttpException(404, 'Yorum bulunamadı');
      }
      if (parentCheck.rows[0].post_id !== postId) {
        throw new HttpException(400, 'Yorum bu gönderiye ait değil');
      }
    }

    // İçerik kontrolü
    if (!content || content.trim().length < 3) {
      throw new HttpException(400, 'Yorum en az 3 karakter olmalıdır');
    }

    if (content.length > 500) {
      throw new HttpException(400, 'Yorum en fazla 500 karakter olabilir');
    }

    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, content, parent_comment_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, created_at, user_id, parent_comment_id`,
      [postId, userId, content.trim(), parentCommentId]
    );

    const comment = result.rows[0];

    // Kullanıcı bilgilerini çek
    const userResult = await pool.query(
      'SELECT id, first_name, last_name FROM users WHERE id = $1',
      [comment.user_id]
    );

    const commenter = userResult.rows[0];

    // Bildirim oluştur
    const postOwnerResult = await pool.query(
      'SELECT user_id FROM posts WHERE id = $1',
      [postId]
    );

    if (postOwnerResult.rows.length > 0) {
      const postOwnerId = postOwnerResult.rows[0].user_id;
      
      if (parentCommentId) {
        // Reply ise: Yorum sahibine bildirim gönder
        const parentCommentResult = await pool.query(
          'SELECT user_id FROM comments WHERE id = $1',
          [parentCommentId]
        );
        
        if (parentCommentResult.rows.length > 0) {
          const parentCommentOwnerId = parentCommentResult.rows[0].user_id;
          
          // Kendi yorumuna cevap vermiyorsa bildirim oluştur
          if (parentCommentOwnerId !== userId) {
            const message = `${commenter.first_name} ${commenter.last_name} yorumunuza cevap verdi`;
            await pool.query(
              `INSERT INTO notifications (user_id, type, post_id, comment_id, message)
               VALUES ($1, 'comment', $2, $3, $4)`,
              [parentCommentOwnerId, postId, comment.id, message]
            );
          }
        }
      } else {
        // Normal yorum ise: Gönderi sahibine bildirim gönder (kendi gönderisine yorum yapmıyorsa)
        if (postOwnerId !== userId) {
          const message = `${commenter.first_name} ${commenter.last_name} gönderinize yorum yaptı`;
          await pool.query(
            `INSERT INTO notifications (user_id, type, post_id, comment_id, message)
             VALUES ($1, 'comment', $2, $3, $4)`,
            [postOwnerId, postId, comment.id, message]
          );
        }
      }
    }

    return {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      parent_comment_id: comment.parent_comment_id,
      user: {
        id: commenter.id,
        first_name: commenter.first_name,
        last_name: commenter.last_name
      }
    };
  }

  /**
   * Recursive olarak bir yorumun tüm reply'lerini getir
   */
  async getRepliesRecursive(parentCommentId) {
    const repliesResult = await pool.query(
      `SELECT 
        c.id,
        c.content,
        c.created_at,
        c.parent_comment_id,
        u.id as user_id,
        u.first_name,
        u.last_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.parent_comment_id = $1
      ORDER BY c.created_at ASC`,
      [parentCommentId]
    );

    const replies = await Promise.all(
      repliesResult.rows.map(async (reply) => {
        const nestedReplies = await this.getRepliesRecursive(reply.id);
        return {
          id: reply.id,
          content: reply.content,
          created_at: reply.created_at,
          parent_comment_id: reply.parent_comment_id,
          user: {
            id: reply.user_id,
            first_name: reply.first_name,
            last_name: reply.last_name
          },
          replies: nestedReplies
        };
      })
    );

    return replies;
  }

  /**
   * Bir gönderiye ait yorumları getir (nested replies ile)
   */
  async getCommentsByPostId(postId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;

    // Ana yorumları getir (parent_comment_id NULL olanlar)
    const mainCommentsResult = await pool.query(
      `SELECT 
        c.id,
        c.content,
        c.created_at,
        u.id as user_id,
        u.first_name,
        u.last_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1 AND c.parent_comment_id IS NULL
      ORDER BY c.created_at ASC
      LIMIT $2 OFFSET $3`,
      [postId, limit, offset]
    );

    // Her ana yorum için recursive olarak reply'leri getir
    const commentsWithReplies = await Promise.all(
      mainCommentsResult.rows.map(async (comment) => {
        const replies = await this.getRepliesRecursive(comment.id);

        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          user: {
            id: comment.user_id,
            first_name: comment.first_name,
            last_name: comment.last_name
          },
          replies: replies
        };
      })
    );

    // Toplam ana yorum sayısı
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM comments WHERE post_id = $1 AND parent_comment_id IS NULL',
      [postId]
    );

    const total = parseInt(countResult.rows[0].count);

    return {
      comments: commentsWithReplies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Yorumu sil (sadece kendi yorumu)
   */
  async deleteComment(commentId, userId) {
    // Yorum var mı ve bu kullanıcıya ait mi kontrol et
    const checkResult = await pool.query(
      'SELECT user_id FROM comments WHERE id = $1',
      [commentId]
    );

    if (checkResult.rows.length === 0) {
      throw new HttpException(404, 'Yorum bulunamadı');
    }

    if (checkResult.rows[0].user_id !== userId) {
      throw new HttpException(403, 'Bu yorumu silme yetkiniz yok');
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [commentId]);

    return { message: 'Yorum silindi' };
  }
}
