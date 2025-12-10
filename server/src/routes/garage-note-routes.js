import express from 'express';
import GarageNoteController from '../controller/garage-note-controller.js';
import { authenticateToken } from '../middleware/auth-middleware.js';

const router = express.Router();
const garageNoteController = new GarageNoteController();

// Tüm route'lar authentication gerektirir
router.get('/', authenticateToken, garageNoteController.getGarageNotes.bind(garageNoteController));
router.get('/stats', authenticateToken, garageNoteController.getGarageNotesStats.bind(garageNoteController));
router.get('/:id', authenticateToken, garageNoteController.getGarageNote.bind(garageNoteController));
router.post('/', authenticateToken, garageNoteController.createGarageNote.bind(garageNoteController));
router.put('/:id', authenticateToken, garageNoteController.updateGarageNote.bind(garageNoteController));
router.delete('/:id', authenticateToken, garageNoteController.deleteGarageNote.bind(garageNoteController));

export default router;
