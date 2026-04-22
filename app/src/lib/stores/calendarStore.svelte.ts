import { browser } from '$app/environment';
import { getCookie, setCookie } from '$lib/utils/cookies';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const saveCookies = (filters: typeof calendarStore) => {
	if (!browser) return;
	setCookie('weekOffset', String(filters.weekOffset), { maxAge: COOKIE_MAX_AGE });
};

export const calendarStore = $state({
	weekOffset: Number(getCookie('weekOffset') || 0)
});

$effect.root(() => {
	$effect(() => saveCookies(calendarStore));
});