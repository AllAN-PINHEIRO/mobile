import prisma from '../lib/prisma.js';
import pecaService from './pecaService.js';

async function createManutencao({ componenteChave, ...data }) {
    // Salva o histórico
    const manutencao = await prisma.historicoManutencao.create({
        data
    });

    // Atualiza a quilometragem atual da bike se a informada na manutenção for maior
    const bike = await prisma.bike.findUnique({ where: { id: data.bikeId } });
    if (bike && data.km > bike.kmAtual) {
        await prisma.bike.update({
            where: { id: data.bikeId },
            data: { kmAtual: data.km }
        });
    }

    // Em uma troca, a peça passa a contar o desgaste a partir deste km e desta data
    if (data.tipo === 'troca' && componenteChave) {
        await pecaService.registrarTroca({
            bikeId: data.bikeId,
            componenteChave,
            km: data.km,
            data: data.data
        });
    }

    return manutencao;
}

async function getManutencoesByBike(bikeId) {
    // Busca todas as manutenções da bike ordenadas da mais recente para a mais antiga
    return await prisma.historicoManutencao.findMany({
        where: { bikeId },
        orderBy: { data: 'desc' }
    });
}

export default {
    createManutencao,
    getManutencoesByBike
};
