import pool from '../config/database.js';

export default class LocationService {
    /**
     * Tüm illeri getir
     */
    async getCities() {
        const result = await pool.query('SELECT id, name FROM cities ORDER BY name');
        return result.rows;
    }

    /**
     * Bir ile ait ilçeleri getir
     */
    async getDistricts(cityId) {
        const result = await pool.query('SELECT id, name FROM districts WHERE city_id = $1 ORDER BY name', [cityId]);
        return result.rows;
    }

    /**
     * Tüm araç markalarını getir
     */
    async getBrands() {
        const result = await pool.query('SELECT id, name FROM brands ORDER BY name');
        return result.rows;
    }

    /**
     * Bir markaya ait modelleri getir
     */
    async getModels(brandId) {
        const result = await pool.query('SELECT id, name FROM models WHERE brand_id = $1 ORDER BY name', [brandId]);
        return result.rows;
    }

    /**
     * Tüm şehirlerin post sayılarını getir (harita için)
     */
    async getCitiesWithPostCounts() {
        const result = await pool.query(`
            SELECT 
                c.id,
                c.name,
                COUNT(p.id)::INTEGER as post_count
            FROM cities c
            LEFT JOIN posts p ON c.id = p.city_id
            GROUP BY c.id, c.name
            ORDER BY c.name
        `);
        return result.rows;
    }

    /**
     * Belirli bir şehirdeki son gönderileri getir
     */
    async getRecentPostsByCity(cityId, limit = 5) {
        const result = await pool.query(`
            SELECT 
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
                m.name as model_name
            FROM posts p
            JOIN users u ON p.user_id = u.id
            JOIN cities c ON p.city_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            LEFT JOIN models m ON p.model_id = m.id
            WHERE p.city_id = $1
            ORDER BY p.created_at DESC
            LIMIT $2
        `, [cityId, limit]);

        return result.rows.map(post => ({
            id: post.id,
            category: post.category,
            content: post.content,
            images: post.images || [],
            created_at: post.created_at,
            user: {
                id: post.user_id,
                first_name: post.first_name,
                last_name: post.last_name
            },
            location: {
                city: post.city_name
            },
            vehicle: post.brand_name ? {
                brand: post.brand_name,
                model: post.model_name
            } : null
        }));
    }
}
