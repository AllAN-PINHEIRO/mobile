import prisma from '../lib/prisma.js';
import { normalizarTipo } from '../constants/tiposBike.js';

/* Registra uma amostra real de durabilidade quando um usuário troca uma peça */
async function registrarAmostra({ componenteId, tipoBike, unidade, duracao }) {
    if (!componenteId || !duracao || duracao <= 0) return null;

    const tipoNormalizado = normalizarTipo(tipoBike);

    const existente = await prisma.mediaComunidade.findUnique({
        where: {
            componenteId_tipoBike: {
                componenteId,
                tipoBike: tipoNormalizado
            }
        }
    });

    if (!existente) {
        return await prisma.mediaComunidade.create({
            data: {
                componenteId,
                tipoBike: tipoNormalizado,
                unidade,
                somaDuracao: duracao,
                totalTrocas: 1,
                mediaVidaUtil: duracao,
                menorDuracao: duracao,
                maiorDuracao: duracao
            }
        });
    }

    const novoTotal = existente.totalTrocas + 1;
    const novaSoma = existente.somaDuracao + duracao;
    const novaMedia = novaSoma / novoTotal;
    const menorDuracao = existente.menorDuracao != null
        ? Math.min(existente.menorDuracao, duracao)
        : duracao;
    const maiorDuracao = existente.maiorDuracao != null
        ? Math.max(existente.maiorDuracao, duracao)
        : duracao;

    return await prisma.mediaComunidade.update({
        where: { id: existente.id },
        data: {
            somaDuracao: novaSoma,
            totalTrocas: novoTotal,
            mediaVidaUtil: novaMedia,
            menorDuracao,
            maiorDuracao
        }
    });
}

/* Lista a tabela dinâmica da comunidade filtrada por tipo de bike */
async function listarPorTipo(tipoBike) {
    const tipoNormalizado = normalizarTipo(tipoBike);

    const registros = await prisma.mediaComunidade.findMany({
        where: { tipoBike: tipoNormalizado },
        include: { componente: true }
    });

    return registros
        .sort((a, b) => (a.componente?.ordem ?? 0) - (b.componente?.ordem ?? 0))
        .map((r) => ({
            id: r.id,
            tipoBike: r.tipoBike,
            chave: r.componente.chave,
            nome: r.componente.nome,
            unidade: r.unidade,
            mediaVidaUtil: Math.round(r.mediaVidaUtil * 10) / 10,
            totalTrocas: r.totalTrocas,
            menorDuracao: r.menorDuracao != null ? Math.round(r.menorDuracao * 10) / 10 : null,
            maiorDuracao: r.maiorDuracao != null ? Math.round(r.maiorDuracao * 10) / 10 : null,
            atualizadoEm: r.atualizadoEm
        }));
}

/* Lista toda a tabela dinâmica da comunidade (todos os tipos de bike) */
async function listarTodas() {
    const registros = await prisma.mediaComunidade.findMany({
        include: { componente: true }
    });

    return registros.sort((a, b) => {
        if (a.tipoBike !== b.tipoBike) return a.tipoBike.localeCompare(b.tipoBike);
        return (a.componente?.ordem ?? 0) - (b.componente?.ordem ?? 0);
    });
}

export default {
    registrarAmostra,
    listarPorTipo,
    listarTodas
};