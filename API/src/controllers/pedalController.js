import pedalService from '../services/pedalService.js';

async function create(req, res) {
    try {
        const { bikeId, km, data } = req.body;
        const resultado = await pedalService.registrarPedal({ bikeId, km, data });
        res.status(201).json(resultado);
    } catch (error) {
        console.error('Erro ao registrar pedal:', error);
        res.status(400).json({ error: error.message || 'Erro ao registrar pedal' });
    }
}

async function getByBike(req, res) {
    try {
        const pedais = await pedalService.listarPorBike(req.params.bikeId);
        res.status(200).json(pedais);
    } catch (error) {
        console.error('Erro ao listar pedais:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export default {
    create,
    getByBike
};