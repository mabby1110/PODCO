import { getRange } from '$lib/server/google/sheets';

// Configuración de caché
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutos en milisegundos

interface CacheEntry {
    data: any[] | null;
    lastFetch: number;
}

const cache: Record<string, CacheEntry> = {
    clientes: { data: null, lastFetch: 0 },
    oportunidades: { data: null, lastFetch: 0 },
    actividades: { data: null, lastFetch: 0 }
};

async function getCachedData(key: 'clientes' | 'oportunidades' | 'actividades', sheetRange: string) {
    const now = Date.now();
    const entry = cache[key];

    if (!entry.data || (now - entry.lastFetch) > CACHE_DURATION) {
        console.log(`[Cache] Fetching fresh ${key} from Google Sheets...`);
        entry.data = await getRange(sheetRange);
        entry.lastFetch = now;
    } else {
        console.log(`[Cache] Serving ${key} from memory`);
    }

    return entry.data;
}

// Funciones exportadas
export const getClientes = () => getCachedData('clientes', 'clientes!A:Z');
export const getOportunidades = () => getCachedData('oportunidades', 'oportunidades!A:Z');
export const getActividades = () => getCachedData('actividades', 'actividades!A:Z');

/**
 * Función opcional para forzar la actualización de la caché 
 * (úsala después de un POST/Action exitoso)
 */
export const invalidateCache = (key: keyof typeof cache) => {
    cache[key].data = null;
    cache[key].lastFetch = 0;
};