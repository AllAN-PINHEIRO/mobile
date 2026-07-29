import prisma from '../lib/prisma.js';
/* Este arquivo contém os serviços relacionados ao catálogo de modelos de bike, compartilhado entre todos os usuários */

async function searchModelos(termo) {
    return await prisma.modeloBike.findMany({
        where: {
            modelo: { contains: termo, mode: 'insensitive' }
        },
        take: 10
    });
}

async function findModeloByNome(nome) {
    return await prisma.modeloBike.findFirst({
        where: {
            modelo: { equals: nome, mode: 'insensitive' }
        }
    });
}

async function findOrCreateModelo({ modelo, marca, tipo }) {
    const existente = await findModeloByNome(modelo);
    if (existente) return existente;

    if (!marca || !tipo) {
        throw new Error('marca e tipo são obrigatórios para cadastrar um novo modelo');
    }

    return await prisma.modeloBike.create({
        data: { modelo, marca, tipo }
    });
}

export default {
    searchModelos,
    findModeloByNome,
    findOrCreateModelo
};
