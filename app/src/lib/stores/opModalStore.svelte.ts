import { browser } from '$app/environment';
import { getCookie, setCookie } from '$lib/utils/cookies';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

interface OpModalState {
    id_cliente: string;
    id_op: string;
    observaciones: string;
    index_entrada: string;
    succeded: boolean;
    onSuccess: ((id_op: string) => void) | null;
    open: (params: { index: number; observaciones: string; id_cliente?: string; onSuccess: (id_op: string) => void }) => void;
    clearStore: () => void;
}

const rawSucceded = getCookie('succeded');

export const opModalStore: OpModalState = $state({
    id_cliente: getCookie('id_cliente') || '',
    id_op: getCookie('id_op') || '',
    observaciones: getCookie('observaciones') || '',
    index_entrada: getCookie('index_entrada') || '',
    succeded: rawSucceded === 'true',
    onSuccess: null,

    open({ index, observaciones, id_cliente = '', onSuccess }) {
        this.index_entrada = String(index);
        this.observaciones = observaciones;
        this.id_cliente = id_cliente;
        this.onSuccess = onSuccess;
        this.succeded = false;
    },

    clearStore() {
        this.id_cliente = '';
        this.id_op = '';
        this.observaciones = '';
        this.index_entrada = '';
        this.succeded = false;
        this.onSuccess = null;
    }
});

const saveCookies = (store: OpModalState) => {
    if (!browser) return;
    setCookie('id_cliente', store.id_cliente, { maxAge: COOKIE_MAX_AGE });
    setCookie('id_op', store.id_op, { maxAge: COOKIE_MAX_AGE });
    setCookie('observaciones', store.observaciones, { maxAge: COOKIE_MAX_AGE });
    setCookie('index_entrada', store.index_entrada, { maxAge: COOKIE_MAX_AGE });
    setCookie('succeded', String(store.succeded), { maxAge: COOKIE_MAX_AGE });
};

$effect.root(() => {
    $effect(() => saveCookies(opModalStore));
});