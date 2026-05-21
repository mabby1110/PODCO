import { appendRow, mapObjectToColumns, updateRowById } from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
import { invalidateCache } from '$lib/server/google/cachedQueries';
import { clienteFieldMap, historialFieldMap, type Cliente, type Historial } from '$lib';
import { actualizarCliente, crearCliente } from '$lib/server/actions';

export const actions: Actions = {
	add: async ({ request }) => {
		console.log('\nCliente nuevo\n');
		const formData = await request.formData();

		await crearCliente(formData); // Invocamos la función reutilizable

		invalidateCache('clientes');
		return { success: true };
	},
	update: async ({ request }) => {
		console.log('\nCliente actualizado\n');
		const formData = await request.formData();

		// 1. Validación (se queda en la Action)
		const id = formData.get('id_cliente') as string;
		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// 2. Ejecutamos la lógica de negocio
		await actualizarCliente(id, formData);

		// 3. Limpieza y respuesta
		invalidateCache('clientes');
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
