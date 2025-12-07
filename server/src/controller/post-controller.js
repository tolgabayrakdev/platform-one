import PostService from '../service/post-service.js';
import UserService from '../service/user-service.js';
import HttpException from '../exceptions/http-exception.js';

export default class PostController {
  constructor() {
    this.postService = new PostService();
    this.userService = new UserService();
  }

  /**
   * Gönderileri getir (filtreli)
   * GET /api/posts
   * Query params: cityId, brandId, modelId, category, scope, page, limit
   * scope: 'my' (kendi ilim), 'all' (tüm Türkiye)
   */
  async getPosts(req, res, next) {
    try {
      const userId = req.user?.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      // Filtreler
      const filters = {};

      // Auth varsa kullanıcı bilgilerini al
      if (userId) {
        const profile = await this.userService.getProfile(userId);
        const scope = req.query.scope || 'my'; // 'my' veya 'all'

      if (scope === 'my') {
          // Kendi ili - ama city yoksa all'a geç
          if (profile.city) {
        filters.cityId = profile.city.id;
          } else {
            // City yoksa tüm Türkiye göster
            // Filtre yoksa tüm Türkiye
          }
        } else {
          // Tüm Türkiye veya filtreli
          if (req.query.cityId) {
            filters.cityId = parseInt(req.query.cityId);
          }
          // Filtre yoksa tüm Türkiye
        }
      } else {
        // Auth yoksa her zaman 'all' scope
        if (req.query.cityId) {
          filters.cityId = parseInt(req.query.cityId);
        }
        // Filtre yoksa tüm Türkiye
      }

      // Marka ve model filtreleri
      if (req.query.modelId) {
        filters.modelId = parseInt(req.query.modelId);
      } else if (req.query.brandId) {
        filters.brandId = parseInt(req.query.brandId);
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
   * Yeni gönderi oluştur
   * POST /api/posts
   */
  async createPost(req, res, next) {
    try {
      const userId = req.user?.userId;
      const { category, content, brandId, modelId } = req.body;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      // Kullanıcının il bilgisini al
      const profile = await this.userService.getProfile(userId);

      if (!profile.city) {
        throw new HttpException(400, 'Önce il seçmelisiniz');
      }

      if (!category) {
        throw new HttpException(400, 'Kategori zorunludur');
      }

      if (!brandId) {
        throw new HttpException(400, 'Marka seçimi zorunludur');
      }

      if (!modelId) {
        throw new HttpException(400, 'Model seçimi zorunludur');
      }

      if (!content) {
        throw new HttpException(400, 'İçerik zorunludur');
      }

      const images = req.body.images || [];

      const post = await this.postService.createPost(userId, profile.city.id, brandId, modelId, category, content, images);

      res.status(201).json({
        message: 'Gönderi oluşturuldu',
        post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gönderiyi sil
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
        throw new HttpException(400, 'Gönderi ID zorunludur');
      }

      const result = await this.postService.deletePost(id, userId);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tek bir gönderiyi getir
   * GET /api/posts/:id
   */
  async getPost(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new HttpException(400, 'Gönderi ID zorunludur');
      }

      const post = await this.postService.getPost(id);

      res.status(200).json({ post });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Benzer gönderileri getir (aynı marka-model)
   * GET /api/posts/:id/related
   */
  async getRelatedPosts(req, res, next) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit) || 3;

      if (!id) {
        throw new HttpException(400, 'Gönderi ID zorunludur');
      }

      // Önce gönderiyi al - marka ve model bilgisi için
      const post = await this.postService.getPost(id);
      
      // Benzer gönderileri getir
      const relatedPosts = await this.postService.getRelatedPosts(id, post.brand_id, post.model_id, limit);

      res.status(200).json({ posts: relatedPosts });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Kullanıcının kendi gönderilerini getir
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

  /**
   * Trend verilerini getir
   * GET /api/posts/trends
   * Query params: cityId (opsiyonel - home sayfası için)
   */
  async getTrends(req, res, next) {
    try {
      const userId = req.user?.userId;
      let cityId = null;

      // Eğer cityId query param olarak gelmişse kullan
      if (req.query.cityId) {
        cityId = parseInt(req.query.cityId);
      } else if (userId) {
        // Auth varsa kullanıcının şehrini al
        const profile = await this.userService.getProfile(userId);
        if (profile?.city) {
          cityId = profile.city.id;
        }
      }

      const [trendingBrands, trendingCities, trendingCategories] = await Promise.all([
        this.postService.getTrendingBrands(cityId, 3),
        cityId ? [] : this.postService.getTrendingCities(3), // Sadece tüm Türkiye için şehirler
        this.postService.getTrendingCategories(3)
      ]);

      res.status(200).json({
        brands: trendingBrands,
        cities: trendingCities,
        categories: trendingCategories
      });
    } catch (error) {
      next(error);
    }
  }
}
