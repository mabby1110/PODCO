import {
	appendRow,
	mapFormDataToColumns,
	updateRowById,
	type FieldColumnMap
} from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
import { invalidateCache } from '$lib/server/google/cachedQueries';
import { actualizarActividad, crearActividad } from '$lib/server/actions';

export const actions: Actions = {
	add: async ({ request }) => {
		console.log('Actividad nueva');
		const formData = await request.formData();

		const actId = await crearActividad(formData);

		invalidateCache('actividades');
		return { success: true, act: actId };
	},
	update: async ({ request }) => {
		console.log('\nActividad actualizanda\n');
		const formData = await request.formData();

		// 1. Validación de SvelteKit
		const id = formData.get('id') as string;
		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// 2. Ejecutar la maquinaria pesada
		await actualizarActividad(id, formData);

		// 3. Limpieza de cachés
		invalidateCache('clientes');
		invalidateCache('oportunidades');
		invalidateCache('actividades');

		return { success: true };
	},

	reload: async () => {
		invalidateCache('clientes');
		invalidateCache('oportunidades');
		invalidateCache('actividades');

		return { success: true };
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		await updateRowById(
			id as string,
			{
				L: new Date().toISOString()
			},
			'oportunidades!A:Z'
		);

		return { success: true };
	}
};
