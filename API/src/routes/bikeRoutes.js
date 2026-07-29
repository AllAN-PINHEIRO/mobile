import { Router } from 'express';
import bikeController from '../controllers/bikeController.js';

/* Este arquivo define as rotas relacionadas às bikes dos usuários */
const router = Router();

router.get('/bikes/usuario/:userId', bikeController.getByUser);

router.post('/bikes', bikeController.create);

export default router;
