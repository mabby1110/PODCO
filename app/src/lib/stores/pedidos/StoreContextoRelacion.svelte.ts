import { browser } from '$app/environment';
import { getCookieJSON, setCookieJSON } from '$lib/utils/cookies';

interface ContextoRelacion {
    id_oportunidad: string | null;
}

const COOKIE_NAME = 'ContextoRelacion';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 horas

const defaultState: ContextoRelacion = {
    id_oportunidad: null
};

function getInitialState(): ContextoRelacion {
    if (!browser) return structuredClone(defaultState);

    return getCookieJSON<ContextoRelacion>(COOKIE_NAME) ?? structuredClone(defaultState);
}

function crearContextoRelacion() {
    let state = $state<ContextoRelacion>(getInitialState());

    function saveToCookie() {
        if (!browser) return;

        setCookieJSON(COOKIE_NAME, state, {
            maxAge: COOKIE_MAX_AGE
        });
    }

    function setOportunidad(id: string) {
        state.id_oportunidad = id;

        saveToCookie();
    }

    function limpiar() {
        state.id_oportunidad = null;

        saveToCookie();
    }

    function reset() {
        state.id_oportunidad = null;

        saveToCookie();
    }

    return {
        get id_oportunidad() {
            return state.id_oportunidad;
        },

        setOportunidad,
        limpiar,
        reset
    };
}

export const StoreContextoRelacion = crearContextoRelacion();