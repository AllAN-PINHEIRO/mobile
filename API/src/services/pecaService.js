import prisma from '../lib/prisma.js';
import { normalizarTipo } from '../constants/tiposBike.js';
/* Este arquivo calcula o estado (bom, médio, ruim) das peças de uma bike cruzando o desgaste com o catálogo de referência */

/* Nomes usados no onboarding antigo, para ligar peças já cadastradas ao catálogo */
const NOMES_LEGADOS = {
    'Corrente': 'corrente',
    'Cassete/Coroa': 'cassete',
    'Pastilhas de Freio': 'pastilhas',
    'Pneus/Câmaras': 'pneus',
    'Amortecedor/Suspensão': 'suspensao',
    'Rolamentos (Movimento Central)': 'movimento-central'
};

/*garante que a bike tenha uma peça para cada componente do catálogo (cobre bikes cadastradas antes do catálogo)*/
async function sincronizarPecas(bikeId) {
    const [bike, componentes, pecas] = await Promise.all([
        prisma.bike.findUnique({ where: { id: bikeId } }),
        prisma.componenteReferencia.findMany(),
        prisma.peca.findMany({ where: { bikeId } })
    ]);
    if (!bike) return;

    for (const peca of pecas.filter((p) => !p.componenteId)) {
        const componente = componentes.find((c) => c.chave === NOMES_LEGADOS[peca.nome]);
        if (!componente) continue;

        const data = { componenteId: componente.id, nome: componente.nome };
        // peça com manutenção informada e sem km de instalação: assume que foi feita no km atual
        if (peca.ultimaManutencao && peca.kmInstalacao === 0) {
            data.kmInstalacao = bike.kmAtual;
        }
        await prisma.peca.update({ where: { id: peca.id }, data });
        peca.componenteId = componente.id;
    }

    const existentes = new Set(pecas.map((p) => p.componenteId).filter(Boolean));
    const faltando = componentes.filter((c) => !existentes.has(c.id));
    if (faltando.length > 0) {
        await prisma.peca.createMany({
            data: faltando.map((c) => ({
                nome: c.nome,
                bikeId,
                componenteId: c.id,
                kmInstalacao: 0,
                criadaEm: new Date()
            }))
        });
    }
}

/*escolho a faixa de vida útil conforme o tipo da bike: MTB e Road têm faixa própria, os demais usam a genérica*/
function limitesDoComponente(componente, tipo) {
    let min = componente.vidaMin;
    let max = componente.vidaMax;

    if (tipo === 'mtb' && componente.vidaMaxMtb != null) {
        min = componente.vidaMinMtb ?? min;
        max = componente.vidaMaxMtb;
    } else if (tipo === 'road' && componente.vidaMaxRoad != null) {
        min = componente.vidaMinRoad ?? min;
        max = componente.vidaMaxRoad;
    }

    if (max == null) return null;
    if (min == null) min = max * 0.75;
    return { min, max };
}

function mesesDesde(data) {
    return (Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
}

/*bom: abaixo de min | medio: entre min e max | ruim: a partir de max*/
function calcularStatus(peca, bike, componente) {
    const tipo = normalizarTipo(bike.modeloBike?.tipo);
    const limites = limitesDoComponente(componente, tipo);

    let desgaste;
    if (componente.unidade === 'meses') {
        const base = peca.ultimaManutencao ?? peca.criadaEm;
        desgaste = base ? mesesDesde(base) : 0;
    } else {
        desgaste = Math.max(0, bike.kmAtual - peca.kmInstalacao);
    }

    let status = 'bom';
    let vidaRestante = 100;
    if (limites) {
        vidaRestante = Math.max(0, Math.round(100 - (desgaste / limites.max) * 100));
        if (desgaste >= limites.max) status = 'ruim';
        else if (desgaste >= limites.min) status = 'medio';
    }

    return {
        id: peca.id,
        chave: componente.chave,
        nome: componente.nome,
        unidade: componente.unidade,
        desgaste: Math.round(desgaste * 10) / 10,
        limiteMin: limites?.min ?? null,
        limiteMax: limites?.max ?? null,
        vidaRestante,
        status,
        sinaisDesgaste: componente.sinaisDesgaste,
        observacao: componente.observacao ?? null,
        fonte: componente.fonte
    };
}

async function getStatusByBike(bikeId) {
    await sincronizarPecas(bikeId);

    const bike = await prisma.bike.findUnique({
        where: { id: bikeId },
        include: { modeloBike: true }
    });
    if (!bike) return null;

    const pecas = await prisma.peca.findMany({
        where: { bikeId, componenteId: { not: null } },
        include: { componente: true }
    });

    const status = pecas
        .filter((p) => p.componente)
        .sort((a, b) => a.componente.ordem - b.componente.ordem)
        .map((p) => calcularStatus(p, bike, p.componente));

    return {
        bike: {
            id: bike.id,
            apelido: bike.apelido,
            kmAtual: bike.kmAtual,
            tipo: normalizarTipo(bike.modeloBike?.tipo)
        },
        pecas: status
    };
}

/*registro a troca: a peça passa a contar o desgaste a partir do km e da data informados*/
async function registrarTroca({ bikeId, componenteChave, km, data }) {
    await sincronizarPecas(bikeId);

    const componente = await prisma.componenteReferencia.findUnique({ where: { chave: componenteChave } });
    if (!componente) return null;

    const peca = await prisma.peca.findFirst({ where: { bikeId, componenteId: componente.id } });
    if (!peca) return null;

    return await prisma.peca.update({
        where: { id: peca.id },
        data: { kmInstalacao: km, ultimaManutencao: data }
    });
}

export default {
    sincronizarPecas,
    getStatusByBike,
    registrarTroca
};
