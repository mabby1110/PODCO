import { writable } from 'svelte/store';
import { getCookieJSON, setCookieJSON, deleteCookie } from '$lib/utils/cookies';

export type Profile = {
	id: string;
	email: string;
	nombre: string;
	isAdmin: boolean;
	isOper: boolean;
};

const COOKIE_NAME = 'profile';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

const { subscribe, set } = writable<Profile | null>(
	getCookieJSON<Profile>(COOKIE_NAME)
);

export const profile = {
	subscribe,

	set: (value: Profile | null) => {
		if (value) {
			setCookieJSON(COOKIE_NAME, value, { maxAge: COOKIE_MAX_AGE });
			set(value);
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
