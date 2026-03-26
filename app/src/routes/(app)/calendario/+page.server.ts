import { type Actions } from '@sveltejs/kit';
import { invalidateCache } from '$lib/server/google/cachedQueries';

export const actions: Actions = {
	reload: async () => {
		invalidateCache('clientes');
		invalidateCache('oportunidades');
		invalidateCache('actividades');

		return { success: true };
	}
};
