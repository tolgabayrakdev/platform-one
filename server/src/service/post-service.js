import pool from '../config/database.js';
import HttpException from '../exceptions/http-exception.js';

const VALID_CATEGORIES = ['kayip', 'yardim', 'etkinlik', 'ucretsiz', 'soru'];

export default class PostService {
  /**
   * İlanları getir (filtreli)
   * @param {Object} filters - { cityId, districtId, neighborhoodId, category }
   * @param {number} page
   * @param {number} limit
   */
  async getPosts(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { cityId, districtId, neighborhoodId, category } = filters;

    // Dinamik WHERE koşulları
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (neighborhoodId) {
      conditions.push(`p.neighborhood_id = $${paramIndex++}`);
      params.push(neighborhoodId);
    } else if (districtId) {
      conditions.push(`n.district_id = $${paramIndex++}`);
      params.push(districtId);
    } else if (cityId) {
      conditions.push(`d.city_id = $${paramIndex++}`);
      params.push(cityId);
    }

    if (category && VALID_CATEGORIES.includes(category)) {
      conditions.push(`p.category = $${paramIndex++}`);
      params.push(category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT 
        p.id,
        p.category,
        p.content,
        p.created_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        n.name as neighborhood_name,
        d.name as district_name,
        c.name as city_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN neighborhoods n ON p.neighborhood_id = n.id
      JOIN districts d ON n.district_id = d.id
      JOIN cities c ON d.city_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    // Toplam sayı
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM posts p
       JOIN neighborhoods n ON p.neighborhood_id = n.id
       JOIN districts d ON n.district_id = d.id
       ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].count);

    return {
      posts: result.rows.map((post) => ({
        id: post.id,
        category: post.category,
        content: post.content,
        created_at: post.created_at,
        user: {
          id: post.user_id,
          first_name: post.first_name,
          last_name: post.last_name
        },
        location: {
          neighborhood: post.neighborhood_name,
          district: post.district_name,
          city: post.city_name
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Yeni ilan oluştur
   */
  async createPost(userId, neighborhoodId, category, content) {
    // Kategori kontrolü
    if (!VALID_CATEGORIES.includes(category)) {
      throw new HttpException(400, `Geçersiz kategori. Geçerli kategoriler: ${VALID_CATEGORIES.join(', ')}`);
    }

    // İçerik kontrolü
    if (!content || content.trim().length < 10) {
      throw new HttpException(400, 'İlan içeriği en az 10 karakter olmalıdır');
    }

    if (content.length > 500) {
      throw new HttpException(400, 'İlan içeriği en fazla 500 karakter olabilir');
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, neighborhood_id, category, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, category, content, created_at`,
      [userId, neighborhoodId, category, content.trim()]
    );

    return result.rows[0];
  }

  /**
   * İlanı sil (sadece kendi ilanı)
   */
  async deletePost(postId, userId) {
    // İlan var mı ve bu kullanıcıya ait mi kontrol et
    const checkResult = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);

    if (checkResult.rows.length === 0) {
      throw new HttpException(404, 'İlan bulunamadı');
    }

    if (checkResult.rows[0].user_id !== userId) {
      throw new HttpException(403, 'Bu ilanı silme yetkiniz yok');
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

    return { message: 'İlan silindi' };
  }

  /**
   * Kullanıcının kendi ilanlarını getir
   */
  async getMyPosts(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        p.id,
        p.category,
        p.content,
        p.created_at,
        n.name as neighborhood_name,
        d.name as district_name,
        c.name as city_name
      FROM posts p
      JOIN neighborhoods n ON p.neighborhood_id = n.id
      JOIN districts d ON n.district_id = d.id
      JOIN cities c ON d.city_id = c.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM posts WHERE user_id = $1', [userId]);

    const total = parseInt(countResult.rows[0].count);

    return {
      posts: result.rows.map((post) => ({
        id: post.id,
        category: post.category,
        content: post.content,
        created_at: post.created_at,
        location: {
          neighborhood: post.neighborhood_name,
          district: post.district_name,
          city: post.city_name
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Tek bir ilanı getir
   */
  async getPost(postId) {
    const result = await pool.query(
      `SELECT 
        p.id,
        p.category,
        p.content,
        p.created_at,
        p.neighborhood_id,
        u.id as user_id,
        u.first_name,
        u.last_name,
        n.name as neighborhood_name,
        n.id as neighborhood_id,
        d.name as district_name,
        c.name as city_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN neighborhoods n ON p.neighborhood_id = n.id
      JOIN districts d ON n.district_id = d.id
      JOIN cities c ON d.city_id = c.id
      WHERE p.id = $1`,
      [postId]
    );

    if (result.rows.length === 0) {
      throw new HttpException(404, 'İlan bulunamadı');
    }

    const post = result.rows[0];

    return {
      id: post.id,
      category: post.category,
      content: post.content,
      created_at: post.created_at,
      neighborhood_id: post.neighborhood_id,
      user: {
        id: post.user_id,
        first_name: post.first_name,
        last_name: post.last_name
      },
      location: {
        neighborhood: post.neighborhood_name,
        district: post.district_name,
        city: post.city_name
      }
    };
  }

  /**
   * Benzer ilanları getir (aynı mahallede, mevcut ilan hariç)
   */
  async getRelatedPosts(postId, neighborhoodId, limit = 3) {
    const result = await pool.query(
      `SELECT 
        p.id,
        p.category,
        p.content,
        p.created_at,
        u.id as user_id,
        u.first_name,
        u.last_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.neighborhood_id = $1 AND p.id != $2
      ORDER BY p.created_at DESC
      LIMIT $3`,
      [neighborhoodId, postId, limit]
    );

    return result.rows.map((post) => ({
      id: post.id,
      category: post.category,
      content: post.content,
      created_at: post.created_at,
      user: {
        id: post.user_id,
        first_name: post.first_name,
        last_name: post.last_name
      }
    }));
  }
}
