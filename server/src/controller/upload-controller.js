import UploadService from '../service/upload-service.js';
import HttpException from '../exceptions/http-exception.js';
import multer from 'multer';

const uploadService = new UploadService();

// Multer config - memory storage (Cloudinary'ye yüklenecek)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Sadece resim dosyaları
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new HttpException(400, 'Sadece resim dosyaları yüklenebilir'), false);
    }
  }
});

export const uploadMiddleware = upload.array('images', 2); // Max 2 resim

/**
 * Resim yükleme controller
 */
export default class UploadController {
  /**
   * Resimleri yükle
   * POST /api/upload/images
   */
  async uploadImages(req, res, next) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        throw new HttpException(401, 'Yetkilendirme gerekli');
      }

      if (!req.files || req.files.length === 0) {
        throw new HttpException(400, 'En az bir resim seçmelisiniz');
      }

      if (req.files.length > 2) {
        throw new HttpException(400, 'En fazla 2 resim yükleyebilirsiniz');
      }

      // Resimleri Cloudinary'ye yükle
      const fileBuffers = req.files.map(file => file.buffer);
      const uploadResults = await uploadService.uploadMultipleImages(fileBuffers);

      res.status(200).json({
        message: 'Resimler yüklendi',
        images: uploadResults
      });
    } catch (error) {
      next(error);
    }
  }
}
