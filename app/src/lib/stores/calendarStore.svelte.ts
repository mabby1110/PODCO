import { browser } from '$app/environment';
import { getCookie, setCookie } from '$lib/utils/cookies';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const saveCookies = (filters: typeof calendarStore) => {
	if (!browser) return;
	setCookie('weekOffset', String(filters.weekOffset), { maxAge: COOKIE_MAX_AGE });
	setCookie('monthOffset', String(filters.monthOffset), { maxAge: COOKIE_MAX_AGE });
	setCookie('yearOffset', String(filters.yearOffset), { maxAge: COOKIE_MAX_AGE });
	setCookie('zoom', String(filters.zoom), { maxAge: COOKIE_MAX_AGE });
};

export const calendarStore = $state({
	weekOffset: Number(getCookie('weekOffset') || 0),
	monthOffset: Number(getCookie('monthOffset') || 0),
	yearOffset: Number(getCookie('yearOffset') || 0),
	zoom: Number(getCookie('zoom') || 1),

});

$effect.root(() => {
	$effect(() => saveCookies(calendarStore));
});