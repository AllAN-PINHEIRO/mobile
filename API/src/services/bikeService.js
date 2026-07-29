import prisma from '../lib/prisma.js';
import modeloBikeService from './modeloBikeService.js';
/* Este arquivo contém os serviços relacionados às bikes dos usuários */

async function getBikesByUserId(userId) {
    return await prisma.bike.findMany({
        where: { userId },
        include: { modeloBike: true, pecas: true }
    });
}

/*crio a bike do usuário reaproveitando ou cadastrando o modelo no catálogo, e já registro as peças com manutenção recente informadas no onboarding*/
async function createBike({ userId, apelido, ano, modelo, marca, tipo, manutencoes }) {
    const modeloBike = await modeloBikeService.findOrCreateModelo({ modelo, marca, tipo });

    return await prisma.bike.create({
        data: {
            apelido,
            ano,
            userId,
            modeloBikeId: modeloBike.id,
            pecas: manutencoes?.length
                ? {
                      create: manutencoes.map((m) => ({
                          nome: m.peca,
                          ultimaManutencao: new Date(m.data)
                      }))
                  }
                : undefined
        },
        include: { modeloBike: true, pecas: true }
    });
}

export default {
    getBikesByUserId,
    createBike
};
