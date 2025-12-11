import pool from '../config/database.js';
import bcrypt from 'bcrypt';
import { randomInt, randomBytes } from 'crypto';
import emailService from '../util/send-email.js';
import { getEmailVerificationTemplate, getWelcomeEmailTemplate, getPasswordResetTemplate } from '../util/email-templates.js';
import { sendSms } from '../util/send-sms.js';
import { generateAccessToken, generateRefreshToken } from '../util/jwt.js';
import HttpException from '../exceptions/http-exception.js';
import logger from '../config/logger.js';

export default class AuthService {
    /**
     * Kullanıcı kaydı oluştur ve email doğrulama kodu gönder
     */
    async register(firstName, lastName, email, phone, password) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Email ve telefon kontrolü
            const emailCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
            if (emailCheck.rows.length > 0) {
                throw new HttpException(400, 'Bu e-posta adresi zaten kullanılıyor');
            }

            const phoneCheck = await client.query('SELECT id FROM users WHERE phone = $1', [phone]);
            if (phoneCheck.rows.length > 0) {
                throw new HttpException(400, 'Bu telefon numarası zaten kullanılıyor');
            }

            // Şifreyi hashle
            const hashedPassword = await bcrypt.hash(password, 10);

            // Kullanıcıyı oluştur (email doğrulama kodu olmadan)
            const result = await client.query(
                `INSERT INTO users (first_name, last_name, email, phone, password)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING first_name, last_name, email, phone, email_verified, phone_verified`,
                [firstName, lastName, email, phone, hashedPassword]
            );

            // Hoş geldin email'i gönder
            try {
                await emailService.sendEmail(email, "Garaj Muhabbet'e Hoş Geldiniz!", getWelcomeEmailTemplate(firstName));
            } catch (emailError) {
                // Email gönderilemezse de kullanıcı oluşturulmuş olur (non-critical)
                // Log'la ama hata fırlatma
                logger.warn('Hoş geldin email gönderilemedi:', emailError);
            }

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Email doğrulama kodunu kontrol et ve telefon kodunu gönder
     */
    async verifyEmail(email, code) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Kullanıcıyı bul
            const userResult = await client.query(
                'SELECT id, email_verify_token, email_verify_token_created_at, phone, email_verified FROM users WHERE email = $1',
                [email]
            );

            if (userResult.rows.length === 0) {
                throw new HttpException(404, 'Kullanıcı bulunamadı');
            }

            const user = userResult.rows[0];

            // Email zaten doğrulanmış mı?
            if (user.email_verified) {
                throw new HttpException(400, 'E-posta zaten doğrulanmış');
            }

            // Kod kontrolü
            if (user.email_verify_token !== code) {
                throw new HttpException(400, 'Doğrulama kodu hatalı');
            }

            // Kod süresi dolmuş mu?
            const now = new Date();
            if (new Date(user.email_verify_token_created_at) < now) {
                throw new HttpException(400, 'Doğrulama kodu süresi dolmuş');
            }

            // Telefon doğrulama kodu oluştur
            const phoneCode = randomInt(100000, 999999).toString();
            const phoneCodeExpiry = new Date(Date.now() + 90 * 1000); // 90 saniye

            // Email'i doğrula ve telefon kodunu kaydet
            await client.query(
                `UPDATE users 
                 SET email_verified = true, 
                     phone_verify_token = $1, 
                     phone_verify_token_created_at = $2,
                     updated_at = NOW()
                 WHERE email = $3`,
                [phoneCode, phoneCodeExpiry, email]
            );

            // SMS gönder
            try {
                await sendSms({
                    msg: `Garaj Muhabbet doğrulama kodunuz: ${phoneCode}`,
                    no: user.phone
                });
            } catch {
                await client.query('ROLLBACK');
                throw new HttpException(500, 'SMS gönderilemedi. Lütfen tekrar deneyin.');
            }

            await client.query('COMMIT');
            return { message: 'E-posta doğrulandı. Telefon numaranıza kod gönderildi.' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Telefon doğrulama kodunu kontrol et ve hesabı aktif et
     */
    async verifyPhone(email, code) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Kullanıcıyı bul
            const userResult = await client.query(
                'SELECT id, phone_verify_token, phone_verify_token_created_at, email_verified, phone_verified FROM users WHERE email = $1',
                [email]
            );

            if (userResult.rows.length === 0) {
                throw new HttpException(404, 'Kullanıcı bulunamadı');
            }

            const user = userResult.rows[0];

            // Email doğrulanmış mı?
            if (!user.email_verified) {
                throw new HttpException(400, 'Önce e-posta adresinizi doğrulamalısınız');
            }

            // Telefon zaten doğrulanmış mı?
            if (user.phone_verified) {
                throw new HttpException(400, 'Telefon numarası zaten doğrulanmış');
            }

            // Kod kontrolü
            if (user.phone_verify_token !== code) {
                throw new HttpException(400, 'Doğrulama kodu hatalı');
            }

            // Kod süresi dolmuş mu?
            const now = new Date();
            if (new Date(user.phone_verify_token_created_at) < now) {
                throw new HttpException(400, 'Doğrulama kodu süresi dolmuş');
            }

            // Telefonu doğrula ve hesabı aktif et
            await client.query(
                `UPDATE users 
                 SET phone_verified = true, 
                     is_verified = true,
                     updated_at = NOW()
                 WHERE email = $1`,
                [email]
            );

            await client.query('COMMIT');
            return { message: 'Telefon doğrulandı. Hesabınız aktif edildi.' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Email doğrulama kodunu yeniden gönder
     */
    async resendEmailCode(email) {
        const client = await pool.connect();

        try {
            // Kullanıcıyı bul
            const userResult = await client.query('SELECT id, email_verified FROM users WHERE email = $1', [email]);

            if (userResult.rows.length === 0) {
                throw new HttpException(404, 'Kullanıcı bulunamadı');
            }

            const user = userResult.rows[0];

            if (user.email_verified) {
                throw new HttpException(400, 'E-posta zaten doğrulanmış');
            }

            // Yeni kod oluştur
            const emailCode = randomInt(100000, 999999).toString();
            const emailCodeExpiry = new Date(Date.now() + 90 * 1000); // 90 saniye

            await client.query(
                `UPDATE users 
                 SET email_verify_token = $1, 
                     email_verify_token_created_at = $2,
                     updated_at = NOW()
                 WHERE email = $3`,
                [emailCode, emailCodeExpiry, email]
            );

            // Email gönder
            await emailService.sendEmail(email, 'E-posta Doğrulama Kodu', getEmailVerificationTemplate(emailCode));

            return { message: 'Doğrulama kodu yeniden gönderildi' };
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Telefon doğrulama kodunu yeniden gönder
     */
    async resendPhoneCode(email) {
        const client = await pool.connect();

        try {
            // Kullanıcıyı bul
            const userResult = await client.query(
                'SELECT id, phone, email_verified, phone_verified FROM users WHERE email = $1',
                [email]
            );

            if (userResult.rows.length === 0) {
                throw new HttpException(404, 'Kullanıcı bulunamadı');
            }

            const user = userResult.rows[0];

            if (!user.email_verified) {
                throw new HttpException(400, 'Önce e-posta adresinizi doğrulamalısınız');
            }

            if (user.phone_verified) {
                throw new HttpException(400, 'Telefon numarası zaten doğrulanmış');
            }

            // Yeni kod oluştur
            const phoneCode = randomInt(100000, 999999).toString();
            const phoneCodeExpiry = new Date(Date.now() + 90 * 1000); // 90 saniye

            await client.query(
                `UPDATE users 
                 SET phone_verify_token = $1, 
                     phone_verify_token_created_at = $2,
                     updated_at = NOW()
                 WHERE email = $3`,
                [phoneCode, phoneCodeExpiry, email]
            );

            // SMS gönder
            await sendSms({
                msg: `Garaj Muhabbet doğrulama kodunuz: ${phoneCode}`,
                no: user.phone
            });

            return { message: 'Doğrulama kodu yeniden gönderildi' };
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Kullanıcı girişi
     */
    async login(email, password) {
        const client = await pool.connect();

        try {
            // Kullanıcıyı bul
            const userResult = await client.query(
                'SELECT id, email, phone, password, email_verified, phone_verified, is_verified, is_banned FROM users WHERE email = $1',
                [email]
            );

            if (userResult.rows.length === 0) {
                throw new HttpException(401, 'E-posta veya şifre hatalı');
            }

            const user = userResult.rows[0];

            // Ban kontrolü
            if (user.is_banned) {
                throw new HttpException(403, 'Hesabınız kapatılmıştır. Platforma erişim izniniz bulunmamaktadır.');
            }

            // Şifre kontrolü
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new HttpException(401, 'E-posta veya şifre hatalı');
            }

            // Email doğrulanmamışsa doğrulama kodu gönder
            if (!user.email_verified) {
                // Email doğrulama kodu oluştur
                const emailCode = randomInt(100000, 999999).toString();
                const emailCodeExpiry = new Date(Date.now() + 90 * 1000); // 90 saniye

                // Kodu veritabanına kaydet
                await client.query(
                    `UPDATE users 
                     SET email_verify_token = $1, 
                         email_verify_token_created_at = $2,
                         updated_at = NOW()
                     WHERE email = $3`,
                    [emailCode, emailCodeExpiry, email]
                );

                // Email doğrulama kodunu gönder
                try {
                    await emailService.sendEmail(
                        email,
                        'E-posta Doğrulama Kodu',
                        getEmailVerificationTemplate(emailCode)
                    );
                } catch (emailError) {
                    // Email gönderilemezse log'la ama devam et
                    logger.warn('Email doğrulama kodu gönderilemedi:', emailError);
                }

                throw new HttpException(
                    403,
                    'E-posta adresinizi doğrulamalısınız. Doğrulama kodu e-posta adresinize gönderildi.'
                );
            }

            // JWT token'ları oluştur
            const tokenPayload = {
                userId: user.id,
                email: user.email
            };
            const accessToken = generateAccessToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);

            // Hesap tamamen doğrulanmamışsa bilgi döndür
            if (!user.is_verified) {
                return {
                    user: {
                        email: user.email,
                        phone: user.phone,
                        email_verified: user.email_verified,
                        phone_verified: user.phone_verified,
                        is_verified: user.is_verified
                    },
                    needsPhoneVerification: !user.phone_verified,
                    accessToken: accessToken,
                    refreshToken: refreshToken
                };
            }

            return {
                user: {
                    email: user.email,
                    phone: user.phone,
                    email_verified: user.email_verified,
                    phone_verified: user.phone_verified,
                    is_verified: user.is_verified
                },
                accessToken: accessToken,
                refreshToken: refreshToken
            };
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Kullanıcı bilgilerini getir (me endpoint)
     */
    async getMe(userId) {
        const client = await pool.connect();

        try {
            const result = await client.query(
                'SELECT first_name, last_name, email, phone, email_verified, phone_verified, is_verified, is_banned, created_at FROM users WHERE id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                throw new HttpException(404, 'Kullanıcı bulunamadı');
            }

            const user = result.rows[0];

            // Ban kontrolü
            if (user.is_banned) {
                throw new HttpException(403, 'Hesabınız kapatılmıştır. Platforma erişim izniniz bulunmamaktadır.');
            }

            return user;
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Şifre sıfırlama token'ı oluştur ve email gönder
     */
    async forgotPassword(email) {
        const client = await pool.connect();

        try {
            // Kullanıcıyı bul
            const userResult = await client.query(
                'SELECT id, first_name, email FROM users WHERE email = $1',
                [email]
            );

            // Kullanıcı yoksa hata döndür
            if (userResult.rows.length === 0) {
                throw new HttpException(404, 'Bu e-posta adresine kayıtlı bir hesap bulunamadı.');
            }

            const user = userResult.rows[0];

            // Token oluştur (crypto ile güvenli token)
            const resetToken = randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

            // Token'ı veritabanına kaydet
            await client.query(
                `UPDATE users 
                 SET password_reset_token = $1, 
                     password_reset_token_expires_at = $2,
                     updated_at = NOW()
                 WHERE email = $3`,
                [resetToken, resetTokenExpiry, email]
            );

            // Frontend URL'ini environment'tan al veya varsayılan kullan
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

            // Email gönder
            try {
                await emailService.sendEmail(
                    email,
                    'Şifre Sıfırlama',
                    getPasswordResetTemplate(resetUrl, user.first_name)
                );
            } catch (emailError) {
                logger.warn('Şifre sıfırlama emaili gönderilemedi:', emailError);
                throw new HttpException(500, 'Email gönderilemedi. Lütfen tekrar deneyin.');
            }

            return { message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' };
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Token'ın geçerli olup olmadığını kontrol et
     */
    async validateResetToken(token) {
        const client = await pool.connect();

        try {
            // Token ile kullanıcıyı bul
            const userResult = await client.query(
                `SELECT id, password_reset_token_expires_at 
                 FROM users 
                 WHERE password_reset_token = $1`,
                [token]
            );

            if (userResult.rows.length === 0) {
                return { valid: false, message: 'Geçersiz şifre sıfırlama bağlantısı' };
            }

            const user = userResult.rows[0];

            // Token süresi kontrolü
            const now = new Date();
            if (!user.password_reset_token_expires_at || new Date(user.password_reset_token_expires_at) < now) {
                return { valid: false, message: 'Şifre sıfırlama bağlantısının süresi dolmuş' };
            }

            return { valid: true };
        } catch (error) {
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Token ile şifreyi sıfırla
     */
    async resetPassword(token, newPassword) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Token ile kullanıcıyı bul
            const userResult = await client.query(
                `SELECT id, email, password_reset_token_expires_at 
                 FROM users 
                 WHERE password_reset_token = $1`,
                [token]
            );

            if (userResult.rows.length === 0) {
                throw new HttpException(400, 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı');
            }

            const user = userResult.rows[0];

            // Token süresi kontrolü
            const now = new Date();
            if (!user.password_reset_token_expires_at || new Date(user.password_reset_token_expires_at) < now) {
                throw new HttpException(400, 'Şifre sıfırlama bağlantısının süresi dolmuş');
            }

            // Şifre uzunluk kontrolü
            if (newPassword.length < 6) {
                throw new HttpException(400, 'Şifre en az 6 karakter olmalıdır');
            }

            // Yeni şifreyi hashle
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Şifreyi güncelle ve token'ı temizle
            await client.query(
                `UPDATE users 
                 SET password = $1, 
                     password_reset_token = NULL,
                     password_reset_token_expires_at = NULL,
                     updated_at = NOW()
                 WHERE id = $2`,
                [hashedPassword, user.id]
            );

            await client.query('COMMIT');
            return { message: 'Şifreniz başarıyla sıfırlandı' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
