import express from 'express';
import userRoutes from './routes/userRoutes.js';
import modeloBikeRoutes from './routes/modeloBikeRoutes.js';
import bikeRoutes from './routes/bikeRoutes.js';
/* Este arquivo contém a configuração do servidor Express e a definição das rotas */
const app = express();

app.use(express.json());

app.use(userRoutes);
app.use(modeloBikeRoutes);
app.use(bikeRoutes);

app.listen(3000, () => {
    console.log('Servidor rodando');
});