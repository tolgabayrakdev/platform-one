import LocationService from '../service/location-service.js';
import HttpException from '../exceptions/http-exception.js';

export default class LocationController {
    constructor() {
        this.locationService = new LocationService();
    }

    /**
     * Tüm illeri getir
     * GET /api/locations/cities
     */
    async getCities(req, res, next) {
        try {
            const cities = await this.locationService.getCities();
            res.status(200).json({ cities });
        } catch (error) {
            next(error);
        }
    }

    /**
     * İlçeleri getir
     * GET /api/locations/districts/:cityId
     */
    async getDistricts(req, res, next) {
        try {
            const { cityId } = req.params;

            if (!cityId) {
                throw new HttpException(400, 'İl ID zorunludur');
            }

            const districts = await this.locationService.getDistricts(cityId);
            res.status(200).json({ districts });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Tüm araç markalarını getir
     * GET /api/locations/brands
     */
    async getBrands(req, res, next) {
        try {
            const brands = await this.locationService.getBrands();
            res.status(200).json({ brands });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Bir markaya ait modelleri getir
     * GET /api/locations/models/:brandId
     */
    async getModels(req, res, next) {
        try {
            const { brandId } = req.params;

            if (!brandId) {
                throw new HttpException(400, 'Marka ID zorunludur');
            }

            const models = await this.locationService.getModels(brandId);
            res.status(200).json({ models });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Tüm şehirlerin post sayılarını getir (harita için)
     * GET /api/locations/cities/stats
     */
    async getCitiesWithStats(req, res, next) {
        try {
            const cities = await this.locationService.getCitiesWithPostCounts();
            res.status(200).json({ cities });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Belirli bir şehirdeki son gönderileri getir
     * GET /api/locations/cities/:cityId/posts
     */
    async getRecentPostsByCity(req, res, next) {
        try {
            const { cityId } = req.params;
            const limit = parseInt(req.query.limit) || 5;

            if (!cityId) {
                throw new HttpException(400, 'Şehir ID zorunludur');
            }

            const posts = await this.locationService.getRecentPostsByCity(cityId, limit);
            res.status(200).json({ posts });
        } catch (error) {
            next(error);
        }
    }
}
