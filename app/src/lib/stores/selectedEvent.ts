import { writable } from 'svelte/store';
import { getCookieJSON, setCookieJSON, deleteCookie } from '$lib/utils/cookies';

export type EventItem = {
	id: string;
	id_cliente: string;
	id_agente: string;
	inicio: string;
	fin: string;
	motivo: string;
	historia: string;
	cotizaciones: string;
	requisitos: string;
	fase: string;
	fecha_creacion: string;
	fecha_cierre: string;
};

const COOKIE_NAME = 'selectedEvent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

const { subscribe, set, update } = writable<EventItem | null>(
	getCookieJSON<EventItem>(COOKIE_NAME)
);

export const selectedEvent = {
	subscribe,
	
	set: (event: EventItem | null) => {
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