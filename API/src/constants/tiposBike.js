/* Tipos de bike padronizados. O app envia sempre um destes valores. */
export const TIPOS_BIKE = ['mtb', 'road', 'gravel', 'urbana', 'outra'];

/* Converte valores antigos (texto livre, ex: "Speed", "MTB ") para o padrão */
export function normalizarTipo(tipo) {
    const t = String(tipo ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

    if (['mtb', 'mountain', 'mountain bike'].includes(t)) return 'mtb';
    if (['road', 'speed', 'estrada', 'strada'].includes(t)) return 'road';
    if (t === 'gravel') return 'gravel';
    if (['urbana', 'urban', 'city', 'cidade'].includes(t)) return 'urbana';
    return 'outra';
}
