import pool from '../config/database.js';
import HttpException from '../exceptions/http-exception.js';
import BadgeService from './badge-service.js';
import PollService from './poll-service.js';

const VALID_CATEGORIES = ['soru', 'yedek_parca', 'servis', 'bakim', 'deneyim', 'yardim', 'anket'];

export default class PostService {
    constructor() {
        this.pollService = new PollService();
    }

    /**
     * Gönderileri getir (filtreli)
     * @param {Object} filters - { cityId, brandId, modelId, category }
     * @param {number} page
     * @param {number} limit
     * @param {string|null} userId - Oy durumunu kontrol için
     */
    async getPosts(filters = {}, page = 1, limit = 20, userId = null) {
        const offset = (page - 1) * limit;
        // Dinamik WHERE koşulları
        const conditions = [];
        const params = [];
        let paramIndex = 1;

        if (filters.modelId) {
            conditions.push(`p.model_id = $${paramIndex++}`);
            params.push(filters.modelId);
        } else if (filters.brandId) {
            conditions.push(`p.brand_id = $${paramIndex++}`);
            params.push(filters.brandId);
        }

        if (filters.cityId) {
            conditions.push(`p.city_id = $${paramIndex++}`);
            params.push(filters.cityId);
        }

        if (filters.category) {
            conditions.push(`p.category = $${paramIndex++}`);
            params.push(filters.category);
        }

        // Arama filtresi - içerik, kullanıcı adı, şehir, marka, model alanlarında arama
        if (filters.search) {
            conditions.push(`(
                p.content ILIKE $${paramIndex} OR
                u.first_name ILIKE $${paramIndex} OR
                u.last_name ILIKE $${paramIndex} OR
                c.name ILIKE $${paramIndex} OR
                b.name ILIKE $${paramIndex} OR
                m.name ILIKE $${paramIndex}
            )`);
            params.push(`%${filters.search}%`);
            paramIndex++;
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        const result = await pool.query(
            `SELECT 
        p.id,
        p.category,
        p.content,
        p.images,
        p.created_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        c.name as city_name,
        b.name as brand_name,
        m.name as model_name,
        COALESCE(COUNT(cm.id), 0)::INTEGER as comment_count,
        (SELECT badge_level FROM user_badges WHERE user_id = u.id AND badge_type = 'comment' ORDER BY 
          CASE badge_level WHEN 'diamond' THEN 5 WHEN 'platinum' THEN 4 WHEN 'gold' THEN 3 WHEN 'silver' THEN 2 WHEN 'bronze' THEN 1 END DESC LIMIT 1) as comment_badge,
        (SELECT badge_level FROM user_badges WHERE user_id = u.id AND badge_type = 'post' ORDER BY 
          CASE badge_level WHEN 'diamond' THEN 5 WHEN 'platinum' THEN 4 WHEN 'gold' THEN 3 WHEN 'silver' THEN 2 WHEN 'bronze' THEN 1 END DESC LIMIT 1) as post_badge
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN cities c ON p.city_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN models m ON p.model_id = m.id
      LEFT JOIN comments cm ON p.id = cm.post_id
      ${whereClause}
      GROUP BY p.id, u.id, u.first_name, u.last_name, c.name, b.name, m.name, p.images
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
            [...params, limit, offset]
        );

        // Toplam sayı
        const countQuery = filters.search
            ? `SELECT COUNT(DISTINCT p.id) FROM posts p
       JOIN users u ON p.user_id = u.id
       JOIN cities c ON p.city_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN models m ON p.model_id = m.id
       ${whereClause}`
            : `SELECT COUNT(*) FROM posts p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN models m ON p.model_id = m.id
       ${whereClause}`;
        
        const countResult = await pool.query(countQuery, params);

        const total = parseInt(countResult.rows[0].count);

        // Anket postları için poll verilerini çek
        const postsWithPolls = await Promise.all(
            result.rows.map(async (post) => {
                const basePost = {
                    id: post.id,
                    category: post.category,
                    content: post.content,
                    images: post.images || [],
                    created_at: post.created_at,
                    comment_count: post.comment_count || 0,
                    user: {
                        id: post.user_id,
                        first_name: post.first_name,
                        last_name: post.last_name,
                        badges: {
                            comment: post.comment_badge || null,
                            post: post.post_badge || null
                        }
                    },
                    location: {
                        city: post.city_name
                    },
                    vehicle: post.brand_name ? {
                        brand: post.brand_name,
                        model: post.model_name
                    } : null,
                    poll: null
                };

                // Anket kategorisi ise poll verisini çek
                if (post.category === 'anket') {
                    try {
                        const pollData = await this.pollService.getPollByPostId(post.id, userId);
                        basePost.poll = pollData;
                    } catch {
                        // Poll bulunamazsa null kalır
                    }
                }

                return basePost;
            })
        );

        return {
            posts: postsWithPolls,
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
    async createPost(userId, cityId, brandId, modelId, category, content, images = []) {
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

        // Resim kontrolü
        if (images && images.length > 2) {
            throw new HttpException(400, 'En fazla 2 resim ekleyebilirsiniz');
        }

        // Resimleri JSON formatına çevir
        const imagesJson = JSON.stringify(images || []);

        const result = await pool.query(
            `INSERT INTO posts (user_id, city_id, brand_id, model_id, category, content, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, category, content, images, created_at`,
            [userId, cityId, brandId, modelId, category, content.trim(), imagesJson]
        );

        // Rozet kontrolü yap
        const badgeService = new BadgeService();
        const newBadges = await badgeService.checkAndAwardBadges(userId);

        return {
            ...result.rows[0],
            new_badges: newBadges
        };
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
        p.images,
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
      GROUP BY p.id, c.name, b.name, m.name, p.images
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
                images: post.images || [],
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
     * @param {string|null} userId - Oy durumunu kontrol için
     */
    async getPost(postId, userId = null) {
        const result = await pool.query(
            `SELECT 
        p.id,
        p.category,
        p.content,
        p.images,
        p.created_at,
        p.city_id,
        p.brand_id,
        p.model_id,
        u.id as user_id,
        u.first_name,
        u.last_name,
        c.name as city_name,
        b.name as brand_name,
        m.name as model_name,
        (SELECT badge_level FROM user_badges WHERE user_id = u.id AND badge_type = 'comment' ORDER BY 
          CASE badge_level WHEN 'diamond' THEN 5 WHEN 'platinum' THEN 4 WHEN 'gold' THEN 3 WHEN 'silver' THEN 2 WHEN 'bronze' THEN 1 END DESC LIMIT 1) as comment_badge,
        (SELECT badge_level FROM user_badges WHERE user_id = u.id AND badge_type = 'post' ORDER BY 
          CASE badge_level WHEN 'diamond' THEN 5 WHEN 'platinum' THEN 4 WHEN 'gold' THEN 3 WHEN 'silver' THEN 2 WHEN 'bronze' THEN 1 END DESC LIMIT 1) as post_badge
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN cities c ON p.city_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN models m ON p.model_id = m.id
      WHERE p.id = $1`,
            [postId]
        );

        if (result.rows.length === 0) {
            throw new HttpException(404, 'Gönderi bulunamadı');
        }

        const post = result.rows[0];

        const basePost = {
            id: post.id,
            category: post.category,
            content: post.content,
            images: post.images || [],
            created_at: post.created_at,
            city_id: post.city_id,
            brand_id: post.brand_id,
            model_id: post.model_id,
            user: {
                id: post.user_id,
                first_name: post.first_name,
                last_name: post.last_name,
                badges: {
                    comment: post.comment_badge || null,
                    post: post.post_badge || null
                }
            },
            location: {
                city: post.city_name
            },
            vehicle: post.brand_name ? {
                brand: post.brand_name,
                model: post.model_name
            } : null,
            poll: null
        };

        // Anket kategorisi ise poll verisini çek
        if (post.category === 'anket') {
            try {
                const pollData = await this.pollService.getPollByPostId(post.id, userId);
                basePost.poll = pollData;
            } catch {
                // Poll bulunamazsa null kalır
            }
        }

        return basePost;
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
        p.images,
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
            images: post.images || [],
            created_at: post.created_at,
            user: {
                id: post.user_id,
                first_name: post.first_name,
                last_name: post.last_name
            }
        }));
    }

    /**
     * Trend markaları getir
     * @param {number|null} cityId - Şehir ID (null ise tüm Türkiye)
     * @param {number} limit - Kaç tane döndürülecek
     */
    async getTrendingBrands(cityId = null, limit = 3) {
        let query = `
      SELECT 
        b.id,
        b.name,
        COUNT(p.id) as post_count
      FROM posts p
      JOIN brands b ON p.brand_id = b.id
    `;

        const params = [];
        if (cityId) {
            query += ` WHERE p.city_id = $1`;
            params.push(cityId);
        }

        query += `
      GROUP BY b.id, b.name
      ORDER BY post_count DESC
      LIMIT $${params.length + 1}
    `;
        params.push(limit);

        const result = await pool.query(query, params);
        return result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            post_count: parseInt(row.post_count)
        }));
    }

    /**
     * Trend şehirleri getir
     * @param {number} limit - Kaç tane döndürülecek
     */
    async getTrendingCities(limit = 3) {
        const result = await pool.query(
            `
      SELECT 
        c.id,
        c.name,
        COUNT(p.id) as post_count
      FROM posts p
      JOIN cities c ON p.city_id = c.id
      GROUP BY c.id, c.name
      ORDER BY post_count DESC
      LIMIT $1
      `,
            [limit]
        );

        return result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            post_count: parseInt(row.post_count)
        }));
    }

    /**
     * Platform istatistiklerini getir
     */
    async getPlatformStats() {
        const [postsResult, usersResult, citiesResult, brandsResult] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM posts'),
            pool.query('SELECT COUNT(*) FROM users'),
            pool.query('SELECT COUNT(*) FROM cities'),
            pool.query('SELECT COUNT(*) FROM brands')
        ]);

        return {
            totalPosts: parseInt(postsResult.rows[0].count),
            totalUsers: parseInt(usersResult.rows[0].count),
            totalCities: parseInt(citiesResult.rows[0].count),
            totalBrands: parseInt(brandsResult.rows[0].count)
        };
    }

    /**
     * Trend kategorileri getir
     * @param {number} limit - Kaç tane döndürülecek
     */
    async getTrendingCategories(limit = 3) {
        const result = await pool.query(
            `
      SELECT 
        p.category,
        COUNT(p.id) as post_count
      FROM posts p
      GROUP BY p.category
      ORDER BY post_count DESC
      LIMIT $1
      `,
            [limit]
        );

        return result.rows.map((row) => ({
            category: row.category,
            post_count: parseInt(row.post_count)
        }));
    }
}
