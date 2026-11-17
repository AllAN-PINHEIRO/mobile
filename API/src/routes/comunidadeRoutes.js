import { Router } from 'express';
import comunidadeController from '../controllers/comunidadeController.js';

const router = Router();

router.get('/comunidade', comunidadeController.listAll);
router.get('/comunidade/:tipoBike', comunidadeController.listByTipo);

export default router;