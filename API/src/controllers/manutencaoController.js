import manutencaoService from '../services/manutencaoService.js';

async function create(req, res) {
    try {
        const { bikeId, titulo, descricao, km, data, tipo } = req.body;
        
        if (!bikeId || !titulo || !km) {
            return res.status(400).json({ error: 'Faltam dados obrigatórios' });
        }

        const manutencao = await manutencaoService.createManutencao({
            bikeId,
            titulo,
            descricao,
            km,
            data: new Date(data),
            tipo
        });

        res.status(201).json(manutencao);
    } catch (error) {
        console.error('Erro ao criar manutenção:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

async function getByBike(req, res) {
    try {
        const { bikeId } = req.params;
        const manutencoes = await manutencaoService.getManutencoesByBike(bikeId);
        res.status(200).json(manutencoes);
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export default {
    create,
    getByBike
};