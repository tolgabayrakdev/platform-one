import UserService from '../service/user-service.js';
import HttpException from '../exceptions/http-exception.js';

export default class UserController {
  constructor() {
    this.userService = new UserService();
  }

  /**
   * Kullanıcının mahallesini güncelle
   * PUT /api/users/neighborhood
   */
  async updateNeighborhood(req, res, next) {
    try {
      const userId = req.user?.userId;
      const { neighborhoodId } = req.body;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      if (!neighborhoodId) {
        throw new HttpException(400, 'Mahalle ID zorunludur');
      }

      const user = await this.userService.updateNeighborhood(userId, neighborhoodId);

      res.status(200).json({
        message: 'Mahalle güncellendi',
        user
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Kullanıcı profilini getir
   * GET /api/users/profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      const profile = await this.userService.getProfile(userId);

      res.status(200).json({ profile });
    } catch (error) {
      next(error);
    }
  }
}
