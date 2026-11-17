import comunidadeService from '../services/comunidadeService.js';

async function listAll(req, res) {
    try {
        const dados = await comunidadeService.listarTodas();
        res.status(200).json(dados);
    } catch (error) {
        console.error('Erro ao listar médias da comunidade:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

async function listByTipo(req, res) {
    try {
        const { tipoBike } = req.params;
        const dados = await comunidadeService.listarPorTipo(tipoBike);
        res.status(200).json(dados);
    } catch (error) {
        console.error('Erro ao buscar médias da comunidade por tipo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export default {
    listAll,
    listByTipo
};