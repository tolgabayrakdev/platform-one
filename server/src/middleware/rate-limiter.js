import rateLimit from 'express-rate-limit';

/**
 * Genel rate limiter - tüm istekler için
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 250, // IP başına 250 istek
  message: { message: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Auth işlemleri için sıkı rate limiter (login, register)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // IP başına 5 deneme
  message: { message: 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.' },
  skipSuccessfulRequests: true, // Başarılı istekleri sayma
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Kod gönderme için rate limiter (resend-email-code, resend-phone-code)
 */
export const codeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 dakika
  max: 1, // Dakikada 1 kod
  message: { message: 'Çok sık kod isteği. 1 dakika bekleyin.' },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Doğrulama işlemleri için rate limiter (verify-email, verify-phone)
 */
export const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // IP başına 10 deneme
  message: { message: 'Çok fazla doğrulama denemesi. 15 dakika sonra tekrar deneyin.' },
  standardHeaders: true,
  legacyHeaders: false
});
