import express from 'express';
import LocationController from '../controller/location-controller.js';

const router = express.Router();
const locationController = new LocationController();

// Public routes - auth gerektirmez
router.get('/cities', locationController.getCities.bind(locationController));
router.get('/districts/:cityId', locationController.getDistricts.bind(locationController));
router.get('/neighborhoods/:districtId', locationController.getNeighborhoods.bind(locationController));

export default router;
