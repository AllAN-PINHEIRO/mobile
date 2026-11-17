import componenteService from '../services/componenteService.js';
/* Este arquivo contém os controladores do catálogo de componentes */

/*listo o catálogo inteiro, usado no onboarding e no registro de troca*/
async function list(req, res) {
    try {
        const componentes = await componenteService.listar();
        res.status(200).json(componentes);
    } catch (error) {
        console.error('Erro ao listar componentes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

export default {
    list
};
