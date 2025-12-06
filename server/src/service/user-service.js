import pool from '../config/database.js';
import HttpException from '../exceptions/http-exception.js';

export default class UserService {
  /**
   * Kullanıcının ilini güncelle
   */
  async updateCity(userId, cityId) {
    // İl var mı kontrol et
    const cityCheck = await pool.query(
      'SELECT id FROM cities WHERE id = $1',
      [cityId]
    );

    if (cityCheck.rows.length === 0) {
      throw new HttpException(404, 'İl bulunamadı');
    }

    // Kullanıcının ilini güncelle
    const result = await pool.query(
      `UPDATE users 
       SET city_id = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, first_name, last_name, email, city_id`,
      [cityId, userId]
    );

    if (result.rows.length === 0) {
      throw new HttpException(404, 'Kullanıcı bulunamadı');
    }

    return result.rows[0];
  }

  /**
   * Kullanıcının araç bilgisini güncelle
   */
  async updateVehicle(userId, brandId, modelId) {
    // Marka ve model var mı kontrol et
    const brandCheck = await pool.query('SELECT id FROM brands WHERE id = $1', [brandId]);
    const modelCheck = await pool.query('SELECT id FROM models WHERE id = $1 AND brand_id = $2', [modelId, brandId]);

    if (brandCheck.rows.length === 0) {
      throw new HttpException(404, 'Marka bulunamadı');
    }

    if (modelCheck.rows.length === 0) {
      throw new HttpException(404, 'Model bulunamadı veya bu markaya ait değil');
    }

    // Kullanıcının araç bilgisini güncelle
    const result = await pool.query(
      `UPDATE users 
       SET brand_id = $1, model_id = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING id, first_name, last_name, email, brand_id, model_id`,
      [brandId, modelId, userId]
    );

    if (result.rows.length === 0) {
      throw new HttpException(404, 'Kullanıcı bulunamadı');
    }

    return result.rows[0];
  }

  /**
   * Kullanıcı profilini getir (il ve araç bilgisi dahil)
   */
  async getProfile(userId) {
    const result = await pool.query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.city_id,
        c.name as city_name,
        u.brand_id,
        b.name as brand_name,
        u.model_id,
        m.name as model_name
      FROM users u
      LEFT JOIN cities c ON u.city_id = c.id
      LEFT JOIN brands b ON u.brand_id = b.id
      LEFT JOIN models m ON u.model_id = m.id
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
      city: user.city_id
        ? {
            id: user.city_id,
            name: user.city_name
          }
        : null,
      vehicle: user.brand_id && user.model_id
        ? {
            brand: {
              id: user.brand_id,
              name: user.brand_name
            },
            model: {
              id: user.model_id,
              name: user.model_name
            }
          }
        : null
    };
  }
}
