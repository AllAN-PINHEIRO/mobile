import { Router } from 'express';
import modeloBikeController from '../controllers/modeloBikeController.js';

/* Este arquivo define as rotas relacionadas ao catálogo de modelos de bike */
const router = Router();

router.get('/modelos', modeloBikeController.search);

export default router;
