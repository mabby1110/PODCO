import {
	mapFormDataToColumns,
	updateRowById,
	type FieldColumnMap
} from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
import { processAttachments } from '$lib/server/google/drive';
import { invalidateCache } from '$lib/server/google/cachedQueries';
import { actualizarOportunidad, crearCliente, crearOportunidad } from '$lib/server/actions';

export const actions: Actions = {
	add: async ({ request }) => {
		console.log('\nOportunidad nueva\n');
		const formData = await request.formData();

		// 1. ¿Necesitamos crear un cliente nuevo primero?
		if (formData.get('razon_social')) {
			console.log('Creando cliente nuevo enlazado...');

			// Reutilizamos la función que creamos en el paso anterior
			const nuevoClienteId = await crearCliente(formData);

			// Enlazamos este nuevo cliente a la oportunidad
			formData.set('id_cliente', nuevoClienteId);
		}

		const opId = await crearOportunidad(formData);

		invalidateCache('oportunidades');
		invalidateCache('clientes');

		return { success: true, op: opId };
	},
	update: async ({ request }) => {
		console.log('\nOportunidad actualizada\n');
		const formData = await request.formData();

		// 1. Validación de SvelteKit
		const id = formData.get('id') as string;
		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// 2. Ejecutar lógica de negocio
		await actualizarOportunidad(id, formData);

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
