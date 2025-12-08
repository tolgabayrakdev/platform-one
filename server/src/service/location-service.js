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
}
