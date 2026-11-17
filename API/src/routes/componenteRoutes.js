import { Router } from 'express';
import componenteController from '../controllers/componenteController.js';

/* Este arquivo define as rotas do catálogo de componentes */
const router = Router();

router.get('/componentes', componenteController.list);

export default router;
