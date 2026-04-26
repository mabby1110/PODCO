import { writable } from 'svelte/store';
import { getCookieJSON, setCookieJSON } from '$lib/utils/cookies';
import { browser } from '$app/environment';

interface AppState {
	dnd: boolean;
	panelMinimized: boolean;
	calendarCards: boolean;
	ModalActivity: boolean;
	ModalOp: boolean;
	ModalClient: boolean;
	pageActions: boolean;
	min: boolean;
}

const COOKIE_NAME = 'appState';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

const defaultState: AppState = {
	dnd: false,
	panelMinimized: false,
	calendarCards: false,
	ModalActivity: false,
	ModalOp: false,
	ModalClient: false,
	pageActions: false,
	min: false,
};

function getInitialState(): AppState {
	if (!browser) return defaultState;
	return getCookieJSON<AppState>(COOKIE_NAME) ?? defaultState;
}

function createAppState() {
	const { subscribe, set, update } = writable<AppState>(getInitialState());

	function saveToCookie(state: AppState) {
		setCookieJSON(COOKIE_NAME, state, { maxAge: COOKIE_MAX_AGE });
	}

	return {
		subscribe,
		toggleDnd: () =>
			update((state) => {
				const newState = { ...state, dnd: !state.dnd };
				saveToCookie(newState);
				return newState;
			}),
		setDnd: (value: boolean) =>
			update((state) => {
				const newState = { ...state, dnd: value };
				saveToCookie(newState);
				return newState;
			}),
		toggleMinimizedCalendarCards: () =>
			update((state) => {
				const newState = { ...state, calendarCards: !state.calendarCards };
				saveToCookie(newState);
				return newState;
			}),
		toggleModalActivity: () =>
			update((state) => {
				const newState = { ...state, ModalActivity: !state.ModalActivity };
				saveToCookie(newState);
				return newState;
			}),
		toggleModalOp: () =>
			update((state) => {
				const newState = { ...state, ModalOp: !state.ModalOp };
				saveToCookie(newState);
				return newState;
			}),
		toggleModalClient: () =>
			update((state) => {
				const newState = { ...state, ModalClient: !state.ModalClient };
				saveToCookie(newState);
				return newState;
			}),
		togglePageActions: () =>
			update((state) => {
				const newState = { ...state, pageActions: !state.pageActions };
				saveToCookie(newState);
				return newState;
			}),
		toggleMin: () =>
			update((state) => {
				const newState = { ...state, min: !state.min };
				saveToCookie(newState);
				return newState;
			}),
		reset: () => {
			saveToCookie(defaultState);
			set(defaultState);
		}
	};
}

export const appState = createAppState();