import prisma from '../lib/prisma.js';

async function createManutencao(data) {
    // Salva o histórico
    const manutencao = await prisma.historicoManutencao.create({
        data
    });

    // Bônus: Atualiza a quilometragem atual da bike se a informada na manutenção for maior
    await prisma.bike.update({
        where: { id: data.bikeId },
        data: { kmAtual: data.km }
    });

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