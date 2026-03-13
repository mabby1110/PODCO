import { writable } from 'svelte/store';
import { getCookieJSON, setCookieJSON, deleteCookie } from '$lib/utils/cookies';
import type { Cliente } from '$lib';


const COOKIE_NAME = 'selectedClient';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

const { subscribe, set, update } = writable<Cliente | null>(
    getCookieJSON<Cliente>(COOKIE_NAME)
);

export const selectedClient = {
    subscribe,
    
    set: (event: Cliente | null) => {
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