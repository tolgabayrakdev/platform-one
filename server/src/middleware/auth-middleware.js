import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

/**
 * JWT token doğrulama middleware'i
 */
export const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.access_token || req.query.token;

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET_KEY || 'your-secret-key', (error, user) => {
                if (error) {
                    return res.status(403).json({ message: 'Token geçerli değil!' });
                }
                req.user = user;
                next();
            });
        } else {
            res.status(401).json({ message: 'Kimlik doğrulaması yapılmadı' });
        }
    } catch (error) {
        logger.error('Token verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Backward compatibility için eski isim
export const authenticateToken = verifyToken;

/**
 * Optional auth middleware - token varsa doğrula, yoksa devam et
 */
export const optionalAuth = (req, res, next) => {
    try {
        const token = req.cookies.access_token || req.query.token;

        if (token) {
            jwt.verify(token, process.env.JWT_SECRET_KEY || 'your-secret-key', (error, user) => {
                if (!error) {
                    req.user = user;
                }
                // Hata olsa bile devam et (auth optional)
                next();
            });
        } else {
            // Token yoksa da devam et
            next();
        }
    } catch (error) {
        // Hata olsa bile devam et
        next();
    }
};
