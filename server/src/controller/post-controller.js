import PostService from '../service/post-service.js';
import UserService from '../service/user-service.js';
import HttpException from '../exceptions/http-exception.js';

export default class PostController {
  constructor() {
    this.postService = new PostService();
    this.userService = new UserService();
  }

  /**
   * İlanları getir (filtreli)
   * GET /api/posts
   * Query params: cityId, districtId, neighborhoodId, category, scope, page, limit
   * scope: 'my' (kendi mahallem), 'all' (tüm Türkiye)
   */
  async getPosts(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      // Kullanıcının mahalle bilgisini al
      const profile = await this.userService.getProfile(userId);

      if (!profile.neighborhood) {
        throw new HttpException(400, 'Önce mahalle seçmelisiniz');
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const scope = req.query.scope || 'my'; // 'my' veya 'all'

      // Filtreler
      const filters = {};

      if (scope === 'my') {
        // Kendi mahallesi
        filters.neighborhoodId = profile.neighborhood.id;
      } else {
        // Tüm Türkiye veya filtreli
        if (req.query.neighborhoodId) {
          filters.neighborhoodId = parseInt(req.query.neighborhoodId);
        } else if (req.query.districtId) {
          filters.districtId = parseInt(req.query.districtId);
        } else if (req.query.cityId) {
          filters.cityId = parseInt(req.query.cityId);
        }
        // Filtre yoksa tüm Türkiye
      }

      // Kategori filtresi
      if (req.query.category) {
        filters.category = req.query.category;
      }

      const result = await this.postService.getPosts(filters, page, limit);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Yeni ilan oluştur
   * POST /api/posts
   */
  async createPost(req, res, next) {
    try {
      const userId = req.user?.userId;
      const { category, content } = req.body;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      // Kullanıcının mahalle bilgisini al
      const profile = await this.userService.getProfile(userId);

      if (!profile.neighborhood) {
        throw new HttpException(400, 'Önce mahalle seçmelisiniz');
      }

      if (!category) {
        throw new HttpException(400, 'Kategori zorunludur');
      }

      if (!content) {
        throw new HttpException(400, 'İçerik zorunludur');
      }

      const post = await this.postService.createPost(userId, profile.neighborhood.id, category, content);

      res.status(201).json({
        message: 'İlan oluşturuldu',
        post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * İlanı sil
   * DELETE /api/posts/:id
   */
  async deletePost(req, res, next) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      if (!id) {
        throw new HttpException(400, 'İlan ID zorunludur');
      }

      const result = await this.postService.deletePost(id, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tek bir ilanı getir
   * GET /api/posts/:id
   */
  async getPost(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new HttpException(400, 'İlan ID zorunludur');
      }

      const post = await this.postService.getPost(id);

      res.status(200).json({ post });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Kullanıcının kendi ilanlarını getir
   * GET /api/posts/my
   */
  async getMyPosts(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await this.postService.getMyPosts(userId, page, limit);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
