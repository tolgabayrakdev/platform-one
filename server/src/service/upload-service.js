import cloudinary from '../config/cloudinary.js';
import HttpException from '../exceptions/http-exception.js';
import { Readable } from 'stream';

export default class UploadService {
  /**
   * Resmi Cloudinary'ye yükle
   * @param {Buffer} fileBuffer - Resim buffer'ı
   * @param {string} folder - Cloudinary folder (opsiyonel)
   * @returns {Promise<{url: string, public_id: string}>}
   */
  async uploadImage(fileBuffer, folder = 'platform-one/posts') {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // Max 1200x1200
            { quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(new HttpException(500, 'Resim yüklenemedi: ' + error.message));
          } else {
            resolve({
              url: result.secure_url,
              public_id: result.public_id
            });
          }
        }
      );

      // Buffer'ı stream'e çevir
      const readableStream = new Readable();
      readableStream.push(fileBuffer);
      readableStream.push(null);
      readableStream.pipe(uploadStream);
    });
  }

  /**
   * Cloudinary'den resim sil
   * @param {string} publicId - Cloudinary public_id
   */
  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      // Hata olsa bile devam et (resim zaten silinmiş olabilir)
      console.error('Cloudinary delete error:', error);
    }
  }

  /**
   * Birden fazla resmi yükle
   * @param {Array<Buffer>} fileBuffers - Resim buffer'ları
   * @param {string} folder - Cloudinary folder
   * @returns {Promise<Array<{url: string, public_id: string}>>}
   */
  async uploadMultipleImages(fileBuffers, folder = 'platform-one/posts') {
    const uploadPromises = fileBuffers.map((buffer) => this.uploadImage(buffer, folder));
    return Promise.all(uploadPromises);
  }
}
