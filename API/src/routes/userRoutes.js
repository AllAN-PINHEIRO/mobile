import { Router } from 'express';
import userController from '../controllers/userController.js';

/* Este arquivo define as rotas relacionadas aos usuários e as associa aos controladores correspondentes */
const router = Router();

router.post('/usuario', userController.create);

router.post('/login', userController.login);

router.get('/usuario', userController.getAll);

router.delete('/usuario/:id', userController.remove);

router.put('/usuario/:id', userController.update);

export default router;