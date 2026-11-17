import prisma from '../lib/prisma.js';
import { normalizarTipo } from '../constants/tiposBike.js';
import comunidadeService from './comunidadeService.js';

/* Nomes usados no onboarding antigo, para ligar peças já cadastradas ao catálogo */
const NOMES_LEGADOS = {
    'Corrente': 'corrente',
    'Cassete/Coroa': 'cassete',
    'Pastilhas de Freio': 'pastilhas',
    'Pneus/Câmaras': 'pneus',
    'Amortecedor/Suspensão': 'suspensao',
    'Rolamentos (Movimento Central)': 'movimento-central'
};

/* Garante que a bike tenha uma peça para cada componente do catálogo */
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

/* Escolhe a faixa de vida útil oficial conforme o tipo da bike */
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

function mesesEntre(dataInicio, dataFim = new Date()) {
    return (new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
}

/* Calcula o status oficial e o status pela média dinâmica da comunidade usando os mesmos critérios */
function calcularStatus(peca, bike, componente, mediaComunidade) {
    const tipo = normalizarTipo(bike.modeloBike?.tipo);
    const limites = limitesDoComponente(componente, tipo);

    let desgaste;
    if (componente.unidade === 'meses') {
        const base = peca.ultimaManutencao ?? peca.criadaEm;
        desgaste = base ? mesesEntre(base) : 0;
    } else {
        desgaste = Math.max(0, bike.kmAtual - peca.kmInstalacao);
    }

    // 1. Cálculo Padrão (Referência Oficial)
    let status = 'bom';
    let vidaRestante = 100;
    if (limites) {
        vidaRestante = Math.max(0, Math.round(100 - (desgaste / limites.max) * 100));
        if (desgaste >= limites.max) status = 'ruim';
        else if (desgaste >= limites.min) status = 'medio';
    }

    // 2. Cálculo Comunidade (Média dinâmica dos usuários para o mesmo tipo de bike)
    let comunidade = null;
    if (mediaComunidade && mediaComunidade.totalTrocas > 0 && mediaComunidade.mediaVidaUtil > 0) {
        const comMax = mediaComunidade.mediaVidaUtil;
        const comMin = comMax * 0.75; // Mesmo critério de 75% para faixa de atenção
        const comVidaRestante = Math.max(0, Math.round(100 - (desgaste / comMax) * 100));

        let comStatus = 'bom';
        if (desgaste >= comMax) comStatus = 'ruim';
        else if (desgaste >= comMin) comStatus = 'medio';

        comunidade = {
            tipoBike: tipo,
            totalTrocas: mediaComunidade.totalTrocas,
            limiteMin: Math.round(comMin * 10) / 10,
            limiteMax: Math.round(comMax * 10) / 10,
            menorDuracao: mediaComunidade.menorDuracao != null ? Math.round(mediaComunidade.menorDuracao * 10) / 10 : null,
            maiorDuracao: mediaComunidade.maiorDuracao != null ? Math.round(mediaComunidade.maiorDuracao * 10) / 10 : null,
            vidaRestante: comVidaRestante,
            status: comStatus
        };
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
        comunidade,
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

    const tipoBike = normalizarTipo(bike.modeloBike?.tipo);

    const [pecas, mediasComunidade] = await Promise.all([
        prisma.peca.findMany({
            where: { bikeId, componenteId: { not: null } },
            include: { componente: true }
        }),
        prisma.mediaComunidade.findMany({
            where: { tipoBike }
        })
    ]);

    const mapaComunidade = new Map(mediasComunidade.map((m) => [m.componenteId, m]));

    const status = pecas
        .filter((p) => p.componente)
        .sort((a, b) => a.componente.ordem - b.componente.ordem)
        .map((p) => calcularStatus(p, bike, p.componente, mapaComunidade.get(p.componenteId)));

    return {
        bike: {
            id: bike.id,
            apelido: bike.apelido,
            kmAtual: bike.kmAtual,
            tipo: tipoBike
        },
        pecas: status
    };
}

/* Registra a troca: calcula quanto a peça anterior durou para a média da comunidade e reinicia o desgaste */
async function registrarTroca({ bikeId, componenteChave, km, data }) {
    await sincronizarPecas(bikeId);

    const [bike, componente] = await Promise.all([
        prisma.bike.findUnique({
            where: { id: bikeId },
            include: { modeloBike: true }
        }),
        prisma.componenteReferencia.findUnique({
            where: { chave: componenteChave }
        })
    ]);

    if (!bike || !componente) return null;

    const peca = await prisma.peca.findFirst({
        where: { bikeId, componenteId: componente.id }
    });
    if (!peca) return null;

    // Calcula quanto a peça substituída durou antes de zerar os contadores
    let duracaoReal = 0;
    if (componente.unidade === 'meses') {
        const base = peca.ultimaManutencao ?? peca.criadaEm;
        if (base) {
            duracaoReal = mesesEntre(base, data);
        }
    } else {
        duracaoReal = Number(km) - peca.kmInstalacao;
    }

    if (duracaoReal > 0) {
        await comunidadeService.registrarAmostra({
            componenteId: componente.id,
            tipoBike: bike.modeloBike?.tipo,
            unidade: componente.unidade,
            duracao: duracaoReal
        });
    }

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