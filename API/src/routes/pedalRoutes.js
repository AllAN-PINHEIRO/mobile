import { Router } from 'express';
import pedalController from '../controllers/pedalController.js';

const router = Router();

router.post('/pedais', pedalController.create);
router.get('/pedais/:bikeId', pedalController.getByBike);

export default router;