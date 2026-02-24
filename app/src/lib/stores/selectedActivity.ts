import { writable } from 'svelte/store';
import { getCookieJSON, setCookieJSON, deleteCookie } from '$lib/utils/cookies';
import type { Actividad } from '$lib';

const COOKIE_NAME = 'selectedActivity';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

const { subscribe, set, update } = writable<Actividad | null>(
    getCookieJSON<Actividad>(COOKIE_NAME)
);

export const selectedActivity = {
    subscribe,
    
    set: (event: Actividad | null) => {
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