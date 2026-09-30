import { browser } from '$app/environment';
import { getCookieJSON, setCookieJSON } from '$lib/utils/cookies';

interface Elemento {
	id: string;
}

interface PedidoEditar {
	modal: boolean;
	carrito: Elemento[];
}

const COOKIE_NAME = 'PedidoEditar';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const defaultState: PedidoEditar = {
	modal: false,
	carrito: []
};

function getInitialState(): PedidoEditar {
	if (!browser) return structuredClone(defaultState);

	return getCookieJSON<PedidoEditar>(COOKIE_NAME) ?? structuredClone(defaultState);
}

function crearPedido() {
	let state = $state<PedidoEditar>(getInitialState());

	function saveToCookie() {
		if (!browser) return;

		setCookieJSON(COOKIE_NAME, state, {
			maxAge: COOKIE_MAX_AGE
		});
	}

	function toggleModal(estado?: boolean) {
		if (estado !== undefined) {
			state.modal = estado;
		} else {
			state.modal = !state.modal;
		}

		saveToCookie();
	}

	function push(id: string) {
		const elemento = state.carrito.find((item) => item.id === id);

		if (!elemento) {
			state.carrito.push({
				id
			});
		}

		saveToCookie();
	}

	function pushLista(lista: Record<string, any>[]) {
		lista.forEach((elemento) => {
			if (!elemento.id) return;

			const existe = state.carrito.some((item) => item.id === elemento.id);

			if (!existe) {
				state.carrito.push({
					id: elemento.id
				});
			}
		});

		saveToCookie();
	}

	function pop(id: string) {
		const index = state.carrito.findIndex((item) => item.id === id);

		if (index !== -1) {
			state.carrito.splice(index, 1);
		}

		saveToCookie();
	}

	function limpiar() {
		state.carrito = [];
		saveToCookie();
	}

	function reset() {
		state.modal = false;
		state.carrito = [];

		saveToCookie();
	}

	return {
		get modal() {
			return state.modal;
		},

		get carrito() {
			return state.carrito;
		},
		push,
		pushLista,
		pop,
		toggleModal,
		limpiar,
		reset
	};
}

export const StorePedidoEditar = crearPedido();
