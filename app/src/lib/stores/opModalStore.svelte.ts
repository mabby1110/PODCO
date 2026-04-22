import { browser } from '$app/environment';
import { getCookie, setCookie } from '$lib/utils/cookies';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const saveCookies = (filters: typeof opModalStore) => {
	if (!browser) return;
	setCookie('objetivo', filters.objetivo, { maxAge: COOKIE_MAX_AGE });
	// setCookie('atributo', filters.atributo, { maxAge: COOKIE_MAX_AGE });
	// setCookie('weekOffset', String(filters.weekOffset), { maxAge: COOKIE_MAX_AGE });
};

export const opModalStore = $state({
	objetivo: getCookie('objetivo') || '',
	// atributo: getCookie('atributo') || '',
	// weekOffset: Number(getCookie('weekOffset') || 0)
});

$effect.root(() => {
	$effect(() => saveCookies(opModalStore));
});