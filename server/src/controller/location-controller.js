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
   * Mahalleleri getir
   * GET /api/locations/neighborhoods/:districtId
   */
  async getNeighborhoods(req, res, next) {
    try {
      const { districtId } = req.params;

      if (!districtId) {
        throw new HttpException(400, 'İlçe ID zorunludur');
      }

      const neighborhoods = await this.locationService.getNeighborhoods(districtId);
      res.status(200).json({ neighborhoods });
    } catch (error) {
      next(error);
    }
  }
}
