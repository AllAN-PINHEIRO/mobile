import manutencaoService from '../services/manutencaoService.js';

async function create(req, res) {
    try {
        const { bikeId, titulo, descricao, km, data, tipo, componenteChave } = req.body;

        if (!bikeId || !titulo || km === undefined || km === null || km === '') {
            return res.status(400).json({ error: 'Faltam dados obrigatórios' });
        }
        if (tipo === 'troca' && !componenteChave) {
            return res.status(400).json({ error: 'Informe qual componente foi trocado' });
        }

        const manutencao = await manutencaoService.createManutencao({
            bikeId,
            titulo,
            descricao: descricao ?? '',
            km: Number(km),
            data: data ? new Date(data) : new Date(),
            tipo: tipo ?? 'rotina',
            componenteChave
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
