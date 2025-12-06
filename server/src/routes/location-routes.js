import express from 'express';
import LocationController from '../controller/location-controller.js';

const router = express.Router();
const locationController = new LocationController();

// Public routes - auth gerektirmez
router.get('/cities', locationController.getCities.bind(locationController));
router.get('/districts/:cityId', locationController.getDistricts.bind(locationController));
router.get('/brands', locationController.getBrands.bind(locationController));
router.get('/models/:brandId', locationController.getModels.bind(locationController));

export default router;
