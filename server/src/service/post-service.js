import pool from '../config/database.js';
import HttpException from '../exceptions/http-exception.js';

const VALID_CATEGORIES = ['satilik', 'kiralik', 'yedek_parca', 'aksesuar', 'servis'];

export default class PostService {
  /**
   * Gönderileri getir (filtreli)
   * @param {Object} filters - { cityId, brandId, modelId, category }
   * @param {number} page
   * @param {number} limit
   */
  async getPosts(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { cityId, brandId, modelId, category } = filters;

    // Dinamik WHERE koşulları
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (modelId) {
      conditions.push(`p.model_id = $${paramIndex++}`);
      params.push(modelId);
    } else if (brandId) {
      conditions.push(`p.brand_id = $${paramIndex++}`);
      params.push(brandId);
    }

    if (cityId) {
      conditions.push(`p.city_id = $${paramIndex++}`);
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
        c.name as city_name,
        b.name as brand_name,
        m.name as model_name,
        COALESCE(COUNT(cm.id), 0)::INTEGER as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN cities c ON p.city_id = c.id
      JOIN brands b ON p.brand_id = b.id
      JOIN models m ON p.model_id = m.id
      LEFT JOIN comments cm ON p.id = cm.post_id
      ${whereClause}
      GROUP BY p.id, u.id, u.first_name, u.last_name, c.name, b.name, m.name
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    // Toplam sayı
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM posts p
       JOIN brands b ON p.brand_id = b.id
       JOIN models m ON p.model_id = m.id
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
        comment_count: post.comment_count || 0,
        user: {
          id: post.user_id,
          first_name: post.first_name,
          last_name: post.last_name
        },
        location: {
          city: post.city_name
        },
        vehicle: {
          brand: post.brand_name,
          model: post.model_name
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
   * Yeni gönderi oluştur
   */
  async createPost(userId, cityId, brandId, modelId, category, content) {
    // Kategori kontrolü
    if (!VALID_CATEGORIES.includes(category)) {
      throw new HttpException(400, `Geçersiz kategori. Geçerli kategoriler: ${VALID_CATEGORIES.join(', ')}`);
    }

    // İçerik kontrolü
    if (!content || content.trim().length < 10) {
      throw new HttpException(400, 'Gönderi içeriği en az 10 karakter olmalıdır');
    }

    if (content.length > 500) {
      throw new HttpException(400, 'Gönderi içeriği en fazla 500 karakter olabilir');
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, city_id, brand_id, model_id, category, content)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, category, content, created_at`,
      [userId, cityId, brandId, modelId, category, content.trim()]
    );

    return result.rows[0];
  }

  /**
   * Gönderiyi sil (sadece kendi gönderisi)
   */
  async deletePost(postId, userId) {
    // Gönderi var mı ve bu kullanıcıya ait mi kontrol et
    const checkResult = await pool.query('SELECT user_id FROM posts WHERE id = $1', [postId]);

    if (checkResult.rows.length === 0) {
      throw new HttpException(404, 'Gönderi bulunamadı');
    }

    if (checkResult.rows[0].user_id !== userId) {
      throw new HttpException(403, 'Bu gönderiyi silme yetkiniz yok');
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [postId]);

    return { message: 'Gönderi silindi' };
  }

  /**
   * Kullanıcının kendi gönderilerini getir
   */
  async getMyPosts(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        p.id,
        p.category,
        p.content,
        p.created_at,
        c.name as city_name,
        b.name as brand_name,
        m.name as model_name,
        COALESCE(COUNT(cm.id), 0)::INTEGER as comment_count
      FROM posts p
      JOIN cities c ON p.city_id = c.id
      JOIN brands b ON p.brand_id = b.id
      JOIN models m ON p.model_id = m.id
      LEFT JOIN comments cm ON p.id = cm.post_id
      WHERE p.user_id = $1
      GROUP BY p.id, c.name, b.name, m.name
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
        comment_count: post.comment_count || 0,
        location: {
          city: post.city_name
        },
        vehicle: {
          brand: post.brand_name,
          model: post.model_name
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
   * Tek bir gönderiyi getir
   */
  async getPost(postId) {
    const result = await pool.query(
      `SELECT 
        p.id,
        p.category,
        p.content,
        p.created_at,
        p.city_id,
        p.brand_id,
        p.model_id,
        u.id as user_id,
        u.first_name,
        u.last_name,
        c.name as city_name,
        b.name as brand_name,
        m.name as model_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN cities c ON p.city_id = c.id
      JOIN brands b ON p.brand_id = b.id
      JOIN models m ON p.model_id = m.id
      WHERE p.id = $1`,
      [postId]
    );

    if (result.rows.length === 0) {
      throw new HttpException(404, 'Gönderi bulunamadı');
    }

    const post = result.rows[0];

    return {
      id: post.id,
      category: post.category,
      content: post.content,
      created_at: post.created_at,
      city_id: post.city_id,
      brand_id: post.brand_id,
      model_id: post.model_id,
      user: {
        id: post.user_id,
        first_name: post.first_name,
        last_name: post.last_name
      },
      location: {
        city: post.city_name
      },
      vehicle: {
        brand: post.brand_name,
        model: post.model_name
      }
    };
  }

  /**
   * Benzer gönderileri getir (aynı marka-model, mevcut gönderi hariç)
   */
  async getRelatedPosts(postId, brandId, modelId, limit = 3) {
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
      WHERE p.brand_id = $1 AND p.model_id = $2 AND p.id != $3
      ORDER BY p.created_at DESC
      LIMIT $4`,
      [brandId, modelId, postId, limit]
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
