import CommentService from '../service/comment-service.js';
import HttpException from '../exceptions/http-exception.js';

export default class CommentController {
  constructor() {
    this.commentService = new CommentService();
  }

  /**
   * Bir gönderiye yorum ekle veya yoruma cevap ver
   * POST /api/posts/:postId/comments
   */
  async createComment(req, res, next) {
    try {
      const userId = req.user?.userId;
      const { postId } = req.params;
      const { content, parent_comment_id } = req.body;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      if (!postId) {
        throw new HttpException(400, 'Gönderi ID zorunludur');
      }

      if (!content) {
        throw new HttpException(400, 'Yorum içeriği zorunludur');
      }

      const comment = await this.commentService.createComment(postId, userId, content, parent_comment_id || null);

      res.status(201).json({
        message: parent_comment_id ? 'Cevap eklendi' : 'Yorum eklendi',
        comment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bir gönderiye ait yorumları getir
   * GET /api/posts/:postId/comments
   */
  async getComments(req, res, next) {
    try {
      const { postId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      if (!postId) {
        throw new HttpException(400, 'Gönderi ID zorunludur');
      }

      const result = await this.commentService.getCommentsByPostId(postId, page, limit);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Yorumu sil
   * DELETE /api/comments/:id
   */
  async deleteComment(req, res, next) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      if (!id) {
        throw new HttpException(400, 'Yorum ID zorunludur');
      }

      const result = await this.commentService.deleteComment(id, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
