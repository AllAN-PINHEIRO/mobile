import prisma from '../lib/prisma.js';
import modeloBikeService from './modeloBikeService.js';
/* Este arquivo contém os serviços relacionados às bikes dos usuários */

async function getBikesByUserId(userId) {
    return await prisma.bike.findMany({
        where: { userId },
        include: { modeloBike: true, pecas: true }
    });
}

/*crio a bike reaproveitando ou cadastrando o modelo no catálogo, e já crio uma peça para cada componente do catálogo.
  pecas = componentes com manutenção recente informada no onboarding: { chave, data, kmInstalacao? }
  - componente informado sem km de instalação: assume o km atual da bike
  - componente não informado: conta o desgaste desde o km 0 da bike*/
async function createBike({ userId, apelido, ano, modelo, marca, tipo, kmAtual, pecas }) {
    const modeloBike = await modeloBikeService.findOrCreateModelo({ modelo, marca, tipo });
    const componentes = await prisma.componenteReferencia.findMany();

    const km = Number(kmAtual) || 0;
    const informadas = new Map((pecas ?? []).map((p) => [p.chave, p]));

    return await prisma.bike.create({
        data: {
            apelido,
            ano,
            kmAtual: km,
            userId,
            modeloBikeId: modeloBike.id,
            pecas: {
                create: componentes.map((c) => {
                    const info = informadas.get(c.chave);
                    const kmInstalacao = info
                        ? (info.kmInstalacao != null && info.kmInstalacao !== '' ? Number(info.kmInstalacao) : km)
                        : 0;
                    return {
                        nome: c.nome,
                        componenteId: c.id,
                        kmInstalacao,
                        ultimaManutencao: info ? new Date(info.data) : undefined,
                        criadaEm: new Date()
                    };
                })
            }
        },
        include: { modeloBike: true, pecas: true }
    });
}

export default {
    getBikesByUserId,
    createBike
};
