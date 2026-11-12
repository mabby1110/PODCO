import { getCookieJSON, setCookieJSON } from '$lib/utils/cookies';
import { browser } from '$app/environment';

export interface AppState {
    controles: boolean;
}

const COOKIE_NAME = 'appState';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

const defaultState: AppState = {
    controles: false,
};

function getInitialState(): AppState {
    if (!browser) return defaultState;
    return getCookieJSON<AppState>(COOKIE_NAME) ?? defaultState;
}

class EstadoAplicacion {
    // Runa $state para hacer toda la lista reactiva
    #state = $state<AppState>(getInitialState());

    // Getter principal: se usa en los componentes para leer el estado (ej: appState.value.dnd)
    get value() {
        return this.#state;
    }

    // Método privado para sincronizar con la cookie cada vez que cambie algo
    #save() {
        if (browser) {
            setCookieJSON(COOKIE_NAME, this.#state, { maxAge: COOKIE_MAX_AGE });
        }
    }

    // --- Lógica de Exclusividad para Modales ---
    
    #closeAllModals() {
        this.#state.controles = false;
    }

    // Un método unificado más limpio (Opcional, pero recomendado)
    toggleModal(modalName: keyof AppState) {
        const isCurrentlyOpen = this.#state[modalName];
        this.#closeAllModals(); // Apagamos todos
        
        // Si estaba cerrado, lo abrimos. Si estaba abierto, ya se cerró en la línea anterior.
        if (!isCurrentlyOpen) {
            // @ts-ignore
            this.#state[modalName] = true;
        }
        
        this.#save();
    }
    
    reset() {
        // Restauramos los valores uno por uno en lugar de reemplazar la referencia de #state
        Object.assign(this.#state, defaultState);
        this.#save();
    }
}

// Exportamos el Singleton
export const StoreAplicacion = new EstadoAplicacion();