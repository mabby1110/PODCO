import { browser } from "$app/environment";
import { getCookieJSON, setCookieJSON } from "$lib/utils/cookies";

interface ElementoCarrito {
  id: string;
  cantidad: number;
}

interface EntradaInventario {
  modal: boolean;
  carrito: ElementoCarrito[];
}

const COOKIE_NAME = "EntradaInventario";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const defaultState: EntradaInventario = {
  modal: false,
  carrito: [],
};

function getInitialState(): EntradaInventario {
  if (!browser) return structuredClone(defaultState);

  return (
    getCookieJSON<EntradaInventario>(COOKIE_NAME) ??
    structuredClone(defaultState)
  );
}

function createEntradaInventario() {
  let state = $state<EntradaInventario>(getInitialState());

  function saveToCookie() {
    if (!browser) return;

    setCookieJSON(COOKIE_NAME, state, {
      maxAge: COOKIE_MAX_AGE,
    });
  }

  function push(id: string) {
    const elemento = state.carrito.find((item) => item.id === id);

    if (elemento) {
      elemento.cantidad += 1;
    } else {
      state.carrito.push({
        id,
        cantidad: 1,
      });
    }

    saveToCookie();
  }

  function pop(id: string) {
    const index = state.carrito.findIndex((item) => item.id === id);

    if (index === -1) return;

    const elemento = state.carrito[index];

    if (elemento.cantidad > 1) {
      elemento.cantidad -= 1;
    } else {
      state.carrito.splice(index, 1);
    }

    saveToCookie();
  }

  function toggleModal() {
    state.modal = !state.modal;
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
    pop,
    toggleModal,
    reset,
  };
}

export const StoreEntradaInventario = createEntradaInventario();
