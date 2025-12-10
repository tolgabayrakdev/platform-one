import pool from '../config/database.js';
import HttpException from '../exceptions/http-exception.js';

const VALID_TYPES = ['servis', 'bakim', 'yedek_parca', 'lastik', 'sigorta', 'vergiler', 'diger'];

export default class GarageNoteService {
    /**
     * Kullanıcının tüm garaj notlarını getir
     * @param {string} userId
     * @param {Object} filters - { type, startDate, endDate }
     * @param {number} page
     * @param {number} limit
     */
    async getGarageNotes(userId, filters = {}, page = 1, limit = 50) {
        const offset = (page - 1) * limit;
        const conditions = ['user_id = $1'];
        const params = [userId];
        let paramIndex = 2;

        if (filters.type && VALID_TYPES.includes(filters.type)) {
            conditions.push(`type = $${paramIndex++}`);
            params.push(filters.type);
        }

        if (filters.startDate) {
            conditions.push(`date >= $${paramIndex++}`);
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            conditions.push(`date <= $${paramIndex++}`);
            params.push(filters.endDate);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Toplam sayı
        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM garage_notes ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].total);

        // Notları getir
        const result = await pool.query(
            `SELECT 
                id,
                type,
                title,
                description,
                date,
                mileage,
                cost,
                service_location,
                images,
                created_at,
                updated_at
            FROM garage_notes
            ${whereClause}
            ORDER BY date DESC, created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...params, limit, offset]
        );

        return {
            notes: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Tek bir garaj notunu getir
     * @param {string} noteId
     * @param {string} userId
     */
    async getGarageNote(noteId, userId) {
        const result = await pool.query(
            `SELECT 
                id,
                type,
                title,
                description,
                date,
                mileage,
                cost,
                service_location,
                images,
                created_at,
                updated_at
            FROM garage_notes
            WHERE id = $1 AND user_id = $2`,
            [noteId, userId]
        );

        if (result.rows.length === 0) {
            throw new HttpException(404, 'Garaj notu bulunamadı');
        }

        return result.rows[0];
    }

    /**
     * Yeni garaj notu oluştur
     * @param {string} userId
     * @param {Object} data
     */
    async createGarageNote(userId, data) {
        const { type, title, description, date, mileage, cost, service_location, images } = data;

        // Validasyon
        if (!VALID_TYPES.includes(type)) {
            throw new HttpException(400, 'Geçersiz tip');
        }

        if (!title || title.trim().length < 3) {
            throw new HttpException(400, 'Başlık en az 3 karakter olmalıdır');
        }

        if (!date) {
            throw new HttpException(400, 'Tarih gereklidir');
        }

        const result = await pool.query(
            `INSERT INTO garage_notes (
                user_id, type, title, description, date, mileage, cost, service_location, images
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                userId,
                type,
                title.trim(),
                description?.trim() || null,
                date,
                mileage || null,
                cost || null,
                service_location?.trim() || null,
                images || []
            ]
        );

        return result.rows[0];
    }

    /**
     * Garaj notunu güncelle
     * @param {string} noteId
     * @param {string} userId
     * @param {Object} data
     */
    async updateGarageNote(noteId, userId, data) {
        // Notun kullanıcıya ait olduğunu kontrol et
        const noteCheck = await pool.query(
            'SELECT id FROM garage_notes WHERE id = $1 AND user_id = $2',
            [noteId, userId]
        );

        if (noteCheck.rows.length === 0) {
            throw new HttpException(404, 'Garaj notu bulunamadı');
        }

        const { type, title, description, date, mileage, cost, service_location, images } = data;

        // Validasyon
        if (type && !VALID_TYPES.includes(type)) {
            throw new HttpException(400, 'Geçersiz tip');
        }

        if (title && title.trim().length < 3) {
            throw new HttpException(400, 'Başlık en az 3 karakter olmalıdır');
        }

        // Güncelleme
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (type) {
            updateFields.push(`type = $${paramIndex++}`);
            updateValues.push(type);
        }

        if (title) {
            updateFields.push(`title = $${paramIndex++}`);
            updateValues.push(title.trim());
        }

        if (description !== undefined) {
            updateFields.push(`description = $${paramIndex++}`);
            updateValues.push(description?.trim() || null);
        }

        if (date) {
            updateFields.push(`date = $${paramIndex++}`);
            updateValues.push(date);
        }

        if (mileage !== undefined) {
            updateFields.push(`mileage = $${paramIndex++}`);
            updateValues.push(mileage || null);
        }

        if (cost !== undefined) {
            updateFields.push(`cost = $${paramIndex++}`);
            updateValues.push(cost || null);
        }

        if (service_location !== undefined) {
            updateFields.push(`service_location = $${paramIndex++}`);
            updateValues.push(service_location?.trim() || null);
        }

        if (images !== undefined) {
            updateFields.push(`images = $${paramIndex++}`);
            updateValues.push(images ? JSON.stringify(images) : '[]');
        }

        if (updateFields.length === 0) {
            throw new HttpException(400, 'Güncellenecek alan bulunamadı');
        }

        updateFields.push(`updated_at = NOW()`);
        updateValues.push(noteId, userId);

        const result = await pool.query(
            `UPDATE garage_notes 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
            RETURNING *`,
            updateValues
        );

        return result.rows[0];
    }

    /**
     * Garaj notunu sil
     * @param {string} noteId
     * @param {string} userId
     */
    async deleteGarageNote(noteId, userId) {
        const result = await pool.query(
            'DELETE FROM garage_notes WHERE id = $1 AND user_id = $2 RETURNING id',
            [noteId, userId]
        );

        if (result.rows.length === 0) {
            throw new HttpException(404, 'Garaj notu bulunamadı');
        }

        return true;
    }

    /**
     * Kullanıcının garaj notları istatistiklerini getir
     * @param {string} userId
     */
    async getGarageNotesStats(userId) {
        // Toplam harcama
        const totalCostResult = await pool.query(
            `SELECT COALESCE(SUM(cost), 0) as total_cost, COUNT(*) as total_notes
            FROM garage_notes
            WHERE user_id = $1 AND cost IS NOT NULL`,
            [userId]
        );

        // Kategori bazlı harcamalar
        const categoryCostResult = await pool.query(
            `SELECT type, COALESCE(SUM(cost), 0) as total_cost, COUNT(*) as count
            FROM garage_notes
            WHERE user_id = $1 AND cost IS NOT NULL
            GROUP BY type
            ORDER BY total_cost DESC`,
            [userId]
        );

        // Son bakım tarihi
        const lastMaintenanceResult = await pool.query(
            `SELECT date, mileage, type, title
            FROM garage_notes
            WHERE user_id = $1
            ORDER BY date DESC, mileage DESC NULLS LAST
            LIMIT 1`,
            [userId]
        );

        // En yüksek KM
        const maxMileageResult = await pool.query(
            `SELECT MAX(mileage) as max_mileage
            FROM garage_notes
            WHERE user_id = $1 AND mileage IS NOT NULL`,
            [userId]
        );

        return {
            total_cost: parseFloat(totalCostResult.rows[0]?.total_cost || 0),
            total_notes: parseInt(totalCostResult.rows[0]?.total_notes || 0),
            category_costs: categoryCostResult.rows.map(row => ({
                type: row.type,
                total_cost: parseFloat(row.total_cost),
                count: parseInt(row.count)
            })),
            last_maintenance: lastMaintenanceResult.rows[0] || null,
            max_mileage: maxMileageResult.rows[0]?.max_mileage || null
        };
    }
}
