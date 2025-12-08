import jwt from 'jsonwebtoken';
import HttpException from '../exceptions/http-exception.js';

const accessTokenSecret = process.env.JWT_SECRET_KEY || 'your-secret-key';
const refreshTokenSecret = process.env.JWT_SECRET_KEY || 'your-secret-key';

export function generateAccessToken(payload) {
    return jwt.sign(payload, accessTokenSecret, { expiresIn: '6h' });
}

export function generateRefreshToken(payload) {
    return jwt.sign(payload, refreshTokenSecret, { expiresIn: '7d' });
}

export function verifyToken(token, type = 'access') {
    if (!token) {
        throw new HttpException(401, 'Oturum açılmamış');
    }

    const secret = type === 'access' ? accessTokenSecret : refreshTokenSecret;
    try {
        return jwt.verify(token, secret);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new HttpException(403, 'Oturum süresi dolmuş');
        }
        if (err.name === 'JsonWebTokenError') {
            throw new HttpException(401, 'Oturum açılmamış');
        }
        throw err;
    }
}
