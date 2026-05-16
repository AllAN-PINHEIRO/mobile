import express from 'express';
import userRoutes from './routes/userRoutes.js';
/* Este arquivo contém a configuração do servidor Express e a definição das rotas */
const app = express();

app.use(express.json());

app.use(userRoutes);

app.listen(3000, () => {
    console.log('Servidor rodando');
});