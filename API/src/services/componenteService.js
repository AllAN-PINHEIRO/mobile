import prisma from '../lib/prisma.js';
/* Este arquivo contém os serviços do catálogo de referência de componentes (vida útil de cada peça) */

async function listar() {
    return await prisma.componenteReferencia.findMany({
        orderBy: { ordem: 'asc' }
    });
}

export default {
    listar
};
