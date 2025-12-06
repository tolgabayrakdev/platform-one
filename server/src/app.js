import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';

import pool from './config/database.js';
import authRoutes from './routes/auth-routes.js';
import locationRoutes from './routes/location-routes.js';
import userRoutes from './routes/user-routes.js';
import postRoutes from './routes/post-routes.js';
import commentRoutes from './routes/comment-routes.js';
import notificationRoutes from './routes/notification-routes.js';
import errorHandler from './middleware/error-handler.js';
import logger from './config/logger.js';
import { generalLimiter } from './middleware/rate-limiter.js';

const app = express();
const PORT = process.env.PORT || 1234;

// Trust proxy - Reverse proxy/load balancer arkasında çalışırken gerekli
app.set('trust proxy', 1);

// CORS ayarları
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Cookie'ler için gerekli
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Genel rate limiter - SSE endpoint'i hariç
app.use((req, res, next) => {
  // SSE endpoint'i rate limiter'dan muaf (uzun süreli bağlantı)
  if (req.path === '/api/notifications/stream') {
    return next();
  }
  generalLimiter(req, res, next);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', commentRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

app.get('/', (_req, res) => {
  res.json({
    message: 'PlatformOne API',
    version: '1.0.0'
  });
});

// Database bağlantı kontrolü
async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection successfully');
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
}

// Server'ı başlat
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  await checkDatabaseConnection();
});
