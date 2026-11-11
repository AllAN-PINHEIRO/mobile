import { Router } from 'express';
import manutencaoController from '../controllers/manutencaoController.js';

const router = Router();
router.post('/', manutencaoController.create);
router.get('/:bikeId', manutencaoController.getByBike);

export default router;