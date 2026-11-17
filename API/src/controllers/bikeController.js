import bikeService from '../services/bikeService.js';
import pecaService from '../services/pecaService.js';
/* Este arquivo contém os controladores relacionados às bikes dos usuários */

/*busco as bikes de um usuário, usado para saber se ele já passou pelo onboarding*/
async function getByUser(req, res) {
    const bikes = await bikeService.getBikesByUserId(req.params.userId);
    res.status(200).json(bikes);
}

/*crio a bike do usuário, com o modelo, o km atual e as manutenções recentes informadas no onboarding*/
async function create(req, res) {
    const { userId, apelido, ano, modelo, marca, tipo, kmAtual, pecas } = req.body;
    if (!userId || !apelido || !ano || !modelo) {
        return res.status(400).json({ error: 'userId, apelido, ano e modelo são obrigatórios' });
    }

    try {
        const bike = await bikeService.createBike({ userId, apelido, ano, modelo, marca, tipo, kmAtual, pecas });
        res.status(201).json(bike);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

/*retorno o estado (bom, médio, ruim) de cada peça da bike*/
async function getPecasStatus(req, res) {
    try {
        const resultado = await pecaService.getStatusByBike(req.params.bikeId);
        if (!resultado) {
            return res.status(404).json({ error: 'Bike não encontrada' });
        }
        res.status(200).json(resultado);
    } catch (error) {
        console.error('Erro ao calcular status das peças:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export default {
    getByUser,
    create,
    getPecasStatus
};
