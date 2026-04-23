import { browser } from '$app/environment';
import { getCookie, setCookie } from '$lib/utils/cookies';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface OpModalState {
	objetivo: string;
	id_op: string;
	succeded: boolean;
	clearStore: () => void;
}

const rawSucceded = getCookie('succeded');

export const opModalStore: OpModalState = $state({
	objetivo: getCookie('objetivo') || '',
	id_op: getCookie('id_op') || '',
	succeded: rawSucceded === 'true',
	clearStore() {
		this.objetivo = '';
		this.id_op = '';
		this.succeded = false;
	}
});

const saveCookies = (store: OpModalState) => {
	if (!browser) return;
	setCookie('objetivo', store.objetivo, { maxAge: COOKIE_MAX_AGE });
	setCookie('id_op', store.id_op, { maxAge: COOKIE_MAX_AGE });
	setCookie('succeded', String(store.succeded), { maxAge: COOKIE_MAX_AGE });
};

$effect.root(() => {
	$effect(() => saveCookies(opModalStore));
});