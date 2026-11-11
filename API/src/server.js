import express from 'express';
import userRoutes from './routes/userRoutes.js';
import modeloBikeRoutes from './routes/modeloBikeRoutes.js';
import bikeRoutes from './routes/bikeRoutes.js';
import manutencaoRoutes from './routes/manutencaoRoutes.js';
const app = express();

app.use(express.json());

app.use(userRoutes);
app.use(modeloBikeRoutes);
app.use(bikeRoutes);
app.use('/manutencoes', manutencaoRoutes);

app.listen(3000, () => {
    console.log('Servidor rodando');
});