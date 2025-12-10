import GarageNoteService from '../service/garage-note-service.js';
import HttpException from '../exceptions/http-exception.js';

export default class GarageNoteController {
    constructor() {
        this.garageNoteService = new GarageNoteService();
    }

    /**
     * Kullanıcının garaj notlarını getir
     * GET /api/garage-notes
     */
    async getGarageNotes(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new HttpException(401, 'Yetkilendirme gerekli');
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const filters = {
                type: req.query.type || null,
                startDate: req.query.startDate || null,
                endDate: req.query.endDate || null
            };

            const result = await this.garageNoteService.getGarageNotes(userId, filters, page, limit);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Tek bir garaj notunu getir
     * GET /api/garage-notes/:id
     */
    async getGarageNote(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new HttpException(401, 'Yetkilendirme gerekli');
            }

            const { id } = req.params;
            const note = await this.garageNoteService.getGarageNote(id, userId);

            res.status(200).json({ note });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Yeni garaj notu oluştur
     * POST /api/garage-notes
     */
    async createGarageNote(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new HttpException(401, 'Yetkilendirme gerekli');
            }

            const note = await this.garageNoteService.createGarageNote(userId, req.body);

            res.status(201).json({
                message: 'Garaj notu oluşturuldu',
                note
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Garaj notunu güncelle
     * PUT /api/garage-notes/:id
     */
    async updateGarageNote(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new HttpException(401, 'Yetkilendirme gerekli');
            }

            const { id } = req.params;
            const note = await this.garageNoteService.updateGarageNote(id, userId, req.body);

            res.status(200).json({
                message: 'Garaj notu güncellendi',
                note
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Garaj notunu sil
     * DELETE /api/garage-notes/:id
     */
    async deleteGarageNote(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new HttpException(401, 'Yetkilendirme gerekli');
            }

            const { id } = req.params;
            await this.garageNoteService.deleteGarageNote(id, userId);

            res.status(200).json({
                message: 'Garaj notu silindi'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Garaj notları istatistiklerini getir
     * GET /api/garage-notes/stats
     */
    async getGarageNotesStats(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw new HttpException(401, 'Yetkilendirme gerekli');
            }

            const stats = await this.garageNoteService.getGarageNotesStats(userId);

            res.status(200).json(stats);
        } catch (error) {
            next(error);
        }
    }
}
