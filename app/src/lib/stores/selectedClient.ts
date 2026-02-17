import { writable } from 'svelte/store';
import { getCookieJSON, setCookieJSON, deleteCookie } from '$lib/utils/cookies';

export type ClientItem = {
    id: string;
    id_contpaqi: string;
    id_agente: string;
    razon_social: string;
    ubicacion: string;
    tipo_prospeccion: string;
    fecha_creacion: string;
    fecha_sync: string;
    oportunidades: string;
    contactos: string;
    ultima_actualizacion: string;
};

const COOKIE_NAME = 'selectedClient';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

const { subscribe, set, update } = writable<ClientItem | null>(
    getCookieJSON<ClientItem>(COOKIE_NAME)
);

export const selectedClient = {
    subscribe,
    
    set: (event: ClientItem | null) => {
        if (event) {
            setCookieJSON(COOKIE_NAME, event, { maxAge: COOKIE_MAX_AGE });
            set(event);
        } else {
            deleteCookie(COOKIE_NAME);
            set(null);
        }
    },
    
    clear: () => {
        deleteCookie(COOKIE_NAME);
        set(null);
    }
};