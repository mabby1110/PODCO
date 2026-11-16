import { browser } from '$app/environment';
import { getCookieJSON, setCookieJSON } from '$lib/utils/cookies';

interface ElementoCarrito {
	id: string;
	cantidad: number;
}

interface PedidoNuevo {
	carrito: ElementoCarrito[];
	id_agrupacion?: string;
}

const COOKIE_NAME = 'PedidoNuevo';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const defaultState: PedidoNuevo = {
	carrito: []
};

function getInitialState(): PedidoNuevo {
	if (!browser) return structuredClone(defaultState);

	return getCookieJSON<PedidoNuevo>(COOKIE_NAME) ?? structuredClone(defaultState);
}

function crearPedido() {
	let state = $state<PedidoNuevo>(getInitialState());

	function saveToCookie() {
		if (!browser) return;

		setCookieJSON(COOKIE_NAME, state, {
			maxAge: COOKIE_MAX_AGE
		});
	}

	function push(id: string) {
		const elemento = state.carrito.find((item) => item.id === id);

		if (elemento) {
			elemento.cantidad += 1;
		} else {
			state.carrito.push({
				id,
				cantidad: 1
			});
		}

		saveToCookie();
	}

	function pop(id: string, cantidad?: number) {
		const index = state.carrito.findIndex((item) => item.id === id);

		if (index === -1) return;

		const elemento = state.carrito[index];

		if (cantidad) {
			elemento.cantidad == cantidad;
		} else {
			if (elemento.cantidad > 1) {
				elemento.cantidad -= 1;
			} else {
				state.carrito.splice(index, 1);
			}
		}

		saveToCookie();
	}
	function limpiar() {
		state.carrito = [];
		saveToCookie();
	}

	function reset() {
		state.carrito = [];

		saveToCookie();
	}

	return {
		get carrito() {
			return state.carrito;
		},

		push,
		pop,
		limpiar,
		reset
	};
}

export const StorePedidoNuevo = crearPedido();
