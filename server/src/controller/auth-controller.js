import AuthService from '../service/auth-service.js';
import HttpException from '../exceptions/http-exception.js';

export default class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Kullanıcı kaydı
     * POST /api/auth/register
     */
    async register(req, res, next) {
        try {
            const { name, email, phone, password } = req.body;

            // Validasyon
            if (!name || !email || !phone || !password) {
                throw new HttpException(400, 'Tüm alanlar zorunludur');
            }

            // İsim kontrolü (ad ve soyad ayrı)
            const nameParts = name.trim().split(' ');
            if (nameParts.length < 2) {
                throw new HttpException(400, 'Ad ve soyad giriniz');
            }

            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(' ');

            // Email format kontrolü
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new HttpException(400, 'Geçerli bir e-posta adresi giriniz');
            }

            // Telefon format kontrolü (sadece rakam, 10 haneli)
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                throw new HttpException(400, 'Geçerli bir telefon numarası giriniz (10 haneli)');
            }

            // Şifre uzunluk kontrolü
            if (password.length < 6) {
                throw new HttpException(400, 'Şifre en az 6 karakter olmalıdır');
            }

            const user = await this.authService.register(firstName, lastName, email, `+90${phone}`, password);

            res.status(201).json({
                message: 'Kayıt başarılı. E-posta adresinize doğrulama kodu gönderildi.',
                user: {
                    id: user.id,
                    email: user.email,
                    email_verified: user.email_verified,
                    phone_verified: user.phone_verified
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Email doğrulama
     * POST /api/auth/verify-email
     */
    async verifyEmail(req, res, next) {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                throw new HttpException(400, 'E-posta ve kod zorunludur');
            }

            const result = await this.authService.verifyEmail(email, code);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Telefon doğrulama
     * POST /api/auth/verify-phone
     */
    async verifyPhone(req, res, next) {
        try {
            const { email, code } = req.body;

            if (!email || !code) {
                throw new HttpException(400, 'E-posta ve kod zorunludur');
            }

            const result = await this.authService.verifyPhone(email, code);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Email kodunu yeniden gönder
     * POST /api/auth/resend-email-code
     */
    async resendEmailCode(req, res, next) {
        try {
            const { email } = req.body;

            if (!email) {
                throw new HttpException(400, 'E-posta zorunludur');
            }

            const result = await this.authService.resendEmailCode(email);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Telefon kodunu yeniden gönder
     * POST /api/auth/resend-phone-code
     */
    async resendPhoneCode(req, res, next) {
        try {
            const { email } = req.body;

            if (!email) {
                throw new HttpException(400, 'E-posta zorunludur');
            }

            const result = await this.authService.resendPhoneCode(email);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Kullanıcı girişi
     * POST /api/auth/login
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                throw new HttpException(400, 'E-posta ve şifre zorunludur');
            }

            const result = await this.authService.login(email, password);

            // Cookie'lere token'ları ekle
            res.cookie("access_token", result.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 6 * 60 * 60 * 1000 // 6 saat (jwt.js'deki expiresIn ile uyumlu)
            });

            res.cookie("refresh_token", result.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün (jwt.js'deki expiresIn ile uyumlu)
            });

            res.status(200).json({
                message: 'Giriş başarılı',
                user: result.user,
                needsPhoneVerification: result.needsPhoneVerification || false,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Kullanıcı bilgilerini getir
     * GET /api/auth/me
     */
    async me(req, res, next) {
        try {
            // Token'dan userId al (middleware'den gelecek)
            const userId = req.user?.userId;

            if (!userId) {
                throw new HttpException(401, 'Yetkilendirme gerekli');
            }

            const user = await this.authService.getMe(userId);

            res.status(200).json({
                message: 'Kullanıcı bilgileri',
                user: {
                    user: {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        email: user.email,
                        phone: user.phone
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Çıkış yap
     * POST /api/auth/logout
     */
    async logout(req, res, next) {
        try {
            res.clearCookie('access_token', {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });
            res.clearCookie('refresh_token', {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });
            res.status(200).json({ message: 'Çıkış başarılı' });
        } catch (error) {
            next(error);
        }
    }
}
