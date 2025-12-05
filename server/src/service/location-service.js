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
    const result = await pool.query(
      'SELECT id, name FROM districts WHERE city_id = $1 ORDER BY name',
      [cityId]
    );
    return result.rows;
  }

  /**
   * Bir ilçeye ait mahalleleri getir
   */
  async getNeighborhoods(districtId) {
    const result = await pool.query(
      'SELECT id, name FROM neighborhoods WHERE district_id = $1 ORDER BY name',
      [districtId]
    );
    return result.rows;
  }

  /**
   * Mahalle detayını getir (il, ilçe, mahalle bilgisi ile)
   */
  async getNeighborhoodDetail(neighborhoodId) {
    const result = await pool.query(
      `SELECT 
        n.id as neighborhood_id,
        n.name as neighborhood_name,
        d.id as district_id,
        d.name as district_name,
        c.id as city_id,
        c.name as city_name
      FROM neighborhoods n
      JOIN districts d ON n.district_id = d.id
      JOIN cities c ON d.city_id = c.id
      WHERE n.id = $1`,
      [neighborhoodId]
    );
    return result.rows[0] || null;
  }
}
