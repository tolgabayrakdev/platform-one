import pool from '../config/database.js';
import HttpException from '../exceptions/http-exception.js';

export default class UserService {
  /**
   * Kullanıcının mahallesini güncelle
   */
  async updateNeighborhood(userId, neighborhoodId) {
    // Mahalle var mı kontrol et
    const neighborhoodCheck = await pool.query(
      'SELECT id FROM neighborhoods WHERE id = $1',
      [neighborhoodId]
    );

    if (neighborhoodCheck.rows.length === 0) {
      throw new HttpException(404, 'Mahalle bulunamadı');
    }

    // Kullanıcının mahallesini güncelle
    const result = await pool.query(
      `UPDATE users 
       SET neighborhood_id = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, first_name, last_name, email, neighborhood_id`,
      [neighborhoodId, userId]
    );

    if (result.rows.length === 0) {
      throw new HttpException(404, 'Kullanıcı bulunamadı');
    }

    return result.rows[0];
  }

  /**
   * Kullanıcı profilini getir (mahalle bilgisi dahil)
   */
  async getProfile(userId) {
    const result = await pool.query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.neighborhood_id,
        n.name as neighborhood_name,
        d.id as district_id,
        d.name as district_name,
        c.id as city_id,
        c.name as city_name
      FROM users u
      LEFT JOIN neighborhoods n ON u.neighborhood_id = n.id
      LEFT JOIN districts d ON n.district_id = d.id
      LEFT JOIN cities c ON d.city_id = c.id
      WHERE u.id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new HttpException(404, 'Kullanıcı bulunamadı');
    }

    const user = result.rows[0];

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      neighborhood: user.neighborhood_id
        ? {
            id: user.neighborhood_id,
            name: user.neighborhood_name,
            district: {
              id: user.district_id,
              name: user.district_name
            },
            city: {
              id: user.city_id,
              name: user.city_name
            }
          }
        : null
    };
  }
}
