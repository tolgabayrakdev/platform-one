import AuthService from '../service/auth-service.js';

export default class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    async login(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async register(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {

        } catch (error) {
            next(error);
        }
     }



}   