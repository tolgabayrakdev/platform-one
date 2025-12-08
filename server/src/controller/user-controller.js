import UserService from '../service/user-service.js';
import HttpException from '../exceptions/http-exception.js';

export default class UserController {
    constructor() {
        this.userService = new UserService();
    }

    /**
     * Kullanıcının ilini güncelle
     * PUT /api/users/city
     */
    async updateCity(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { cityId } = req.body;

            if (!userId) {
                throw new HttpException(401, 'Yetkilendirme gerekli');
            }

            if (!cityId) {
                throw new HttpException(400, 'İl ID zorunludur');
            }

            const user = await this.userService.updateCity(userId, cityId);

            res.status(200).json({
                message: 'İl güncellendi',
                user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Kullanıcının araç bilgisini güncelle
     * PUT /api/users/vehicle
     */
    async updateVehicle(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { brandId, modelId } = req.body;

            if (!userId) {
                throw new HttpException(401, 'Yetkilendirme gerekli');
            }

            if (!brandId) {
                throw new HttpException(400, 'Marka ID zorunludur');
            }

            if (!modelId) {
                throw new HttpException(400, 'Model ID zorunludur');
            }

            const user = await this.userService.updateVehicle(userId, brandId, modelId);

            res.status(200).json({
                message: 'Araç bilgisi güncellendi',
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
