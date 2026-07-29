import bikeService from '../services/bikeService.js';
/* Este arquivo contém os controladores relacionados às bikes dos usuários */

/*busco as bikes de um usuário, usado para saber se ele já passou pelo onboarding*/
async function getByUser(req, res) {
    const bikes = await bikeService.getBikesByUserId(req.params.userId);
    res.status(200).json(bikes);
}

/*crio a primeira bike do usuário, com o modelo e a manutenção inicial informados no onboarding*/
async function create(req, res) {
    const { userId, apelido, ano, modelo, marca, tipo, manutencoes } = req.body;
    if (!userId || !apelido || !ano || !modelo) {
        return res.status(400).json({ error: 'userId, apelido, ano e modelo são obrigatórios' });
    }

    try {
        const bike = await bikeService.createBike({ userId, apelido, ano, modelo, marca, tipo, manutencoes });
        res.status(201).json(bike);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export default {
    getByUser,
    create
};
