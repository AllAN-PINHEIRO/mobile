import prisma from '../src/lib/prisma.js';

const fonte = "The Beam - Cycling Equipment Durability Factors: A Cyclist's Guide";
const fonteUrl = 'https://thebeamofficial.com/blogs/news/cycling-equipment-durability-factors-a-cyclists-guide';

const componentes = [
  { chave: 'corrente', nome: 'Corrente', ordem: 1, unidade: 'km',
    vidaMin: 1500, vidaMax: 5000, vidaMinMtb: 1500, vidaMaxMtb: 3000, vidaMinRoad: 2000, vidaMaxRoad: 5000,
    sinaisDesgaste: 'Alongamento de 0,5% (11/12v) ou 0,75% (até 10v)' },
  { chave: 'cassete', nome: 'Cassete', ordem: 2, unidade: 'km', vidaMin: 4500, vidaMax: 15000,
    observacao: 'Equivale a 2 ou 3 correntes',
    sinaisDesgaste: 'Dentes pontiagudos ("barbatana de tubarão") ou falha na troca' },
  { chave: 'coroas', nome: 'Coroas (Pedivela)', ordem: 3, unidade: 'km', vidaMin: 6000, vidaMax: 15000,
    observacao: 'Equivale a 2 cassetes',
    sinaisDesgaste: 'Desgaste visível nos dentes e queda de corrente' },
  { chave: 'pneus', nome: 'Pneus', ordem: 4, unidade: 'km',
    vidaMin: 1000, vidaMax: 6000, vidaMinMtb: 1000, vidaMaxMtb: 3000, vidaMinRoad: 3000, vidaMaxRoad: 6000,
    sinaisDesgaste: 'Sumiço dos indicadores TWI, cortes na carcaça ou ressecamento' },
  { chave: 'pastilhas', nome: 'Pastilhas de Freio', ordem: 5, unidade: 'km', vidaMin: 800, vidaMax: 5600,
    observacao: 'Pode cair para menos de 100 km na lama',
    sinaisDesgaste: 'Material de atrito abaixo de 0,5 mm (Shimano/SRAM)' },
  { chave: 'discos', nome: 'Discos de Freio (Rotores)', ordem: 6, unidade: 'km', vidaMin: 6000, vidaMax: 15000,
    sinaisDesgaste: 'Espessura mínima de 1,5 mm (Shimano) ou 1,55 mm (SRAM)' },
  { chave: 'movimento-central', nome: 'Movimento Central', ordem: 7, unidade: 'km', vidaMin: 5000, vidaMax: 16000,
    sinaisDesgaste: 'Folga axial, rangidos ou rolamentos travando' },
  // Sem vidaMin na fonte: o app usa 75% de vidaMax como início da faixa de atenção
  { chave: 'suspensao', nome: 'Suspensão (Revisão)', ordem: 8, unidade: 'meses', vidaMax: 12,
    observacao: 'A fonte também indica 50 a 125 horas de uso',
    sinaisDesgaste: 'Perda de sensibilidade, vazamento de óleo ou ressecamento' },
  { chave: 'quadro', nome: 'Quadro (Estrutura)', ordem: 9, unidade: 'meses', vidaMin: 60, vidaMax: 120,
    observacao: '5 a 10 anos para alumínio; aço, titânio e carbono têm vida útil vitalícia',
    sinaisDesgaste: 'Fadiga estrutural (norma ISO 4210-6, 500.000 ciclos)' },
];

for (const c of componentes) {
  await prisma.componenteReferencia.upsert({
    where: { chave: c.chave },
    update: { ...c, fonte, fonteUrl },
    create: { ...c, fonte, fonteUrl },
  });
}

console.log(`Seed concluído: ${componentes.length} componentes`);
process.exit(0);
