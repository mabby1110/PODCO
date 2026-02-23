import { writable } from 'svelte/store';
import { getCookieJSON, setCookieJSON } from '$lib/utils/cookies';
import { browser } from '$app/environment';

interface ViewState {
    calendar: boolean;
    op: boolean;
    clients: boolean;
    activities: boolean;
}

const COOKIE_NAME = 'viewState';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

const defaultState: ViewState = {
    calendar: false,
    op: false,
    activities: false,
    clients: true,
};

function getInitialState(): ViewState {
    if (!browser) return defaultState;
    return getCookieJSON<ViewState>(COOKIE_NAME) ?? defaultState;
}

function createViewState() {
    const { subscribe, set, update } = writable<ViewState>(getInitialState());

    function saveToCookie(state: ViewState) {
        if (browser) {
            setCookieJSON(COOKIE_NAME, state, { maxAge: COOKIE_MAX_AGE });
        }
    }

    // Helper para asegurar que solo una vista esté activa
    function setActiveView(view: keyof ViewState) {
        update((state) => {
            const newState: ViewState = {
                calendar: view === 'calendar',
                op: view === 'op',
                activities: view === 'activities',
                clients: view === 'clients'
            };
            saveToCookie(newState);
            return newState;
        });
    }

    return {
        subscribe,
        setCalendar: () => setActiveView('calendar'),
        setOp: () => setActiveView('op'),
        setClients: () => setActiveView('clients'),
        setActivities: () => setActiveView('activities'),
        // Método genérico para toggle
        toggle: (view: keyof ViewState) => setActiveView(view),
        // Método para obtener el estado actual sin suscribirse
        getCurrent: (): ViewState => {
            let currentState = defaultState;
            subscribe(state => currentState = state)();
            return currentState;
        },
        reset: () => {
            saveToCookie(defaultState);
            set(defaultState);
        }
    };
}

export const viewState = createViewState();