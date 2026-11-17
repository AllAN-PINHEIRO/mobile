import prisma from '../lib/prisma.js';

async function registrarPedal({ bikeId, km, data }) {
    const distancia = Number(km);
    if (!bikeId || isNaN(distancia) || distancia <= 0) {
        throw new Error('Informe uma bike válida e uma distância maior que zero');
    }

    const bike = await prisma.bike.findUnique({ where: { id: bikeId } });
    if (!bike) {
        throw new Error('Bicicleta não encontrada');
    }

    const pedal = await prisma.pedal.create({
        data: {
            bikeId,
            km: Math.round(distancia * 100) / 100, // arredonda para 2 casas decimais
            data: data ? new Date(data) : new Date()
        }
    });

    const bikeAtualizada = await prisma.bike.update({
        where: { id: bikeId },
        data: {
            kmAtual: { increment: pedal.km }
        }
    });

    return { pedal, kmAtual: bikeAtualizada.kmAtual };
}

async function listarPorBike(bikeId) {
    return await prisma.pedal.findMany({
        where: { bikeId },
        orderBy: { data: 'desc' }
    });
}

export default {
    registrarPedal,
    listarPorBike
};