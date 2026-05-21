import { appendRow, mapObjectToColumns, updateRowById } from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
import { invalidateCache } from '$lib/server/google/cachedQueries';
import { clienteFieldMap, historialFieldMap, type Cliente, type Historial } from '$lib';

export const actions: Actions = {
	add: async ({ request }) => {
		console.log('\nCliente nuevo\n');
		const formData = await request.formData();

		const getStr = (key: string) => (formData.get(key) as string) || '';

		// NUEVO CLIENTE
		const cliente: Cliente = {
			fecha_creacion: new Date().toISOString(),
			id_agente: getStr('id_agente'),
			razon_social: getStr('razon_social'),
			nombre_comercial: getStr('nombre_comercial'),
			ubicacion: getStr('ubicacion'),
			estado: getStr('estado'),
			ciudad: getStr('ciudad'),
			sector: getStr('sector'),
			contactos: getStr('contactos'),
			tipo_prospeccion: getStr('tipo_prospeccion'),
			historial: getStr('historial')
		};

		const mapCliente = mapObjectToColumns(cliente, clienteFieldMap);
		const nuevoCliente = await appendRow('clientes!A:Z', mapCliente, 'BMS_CLI');

		// HISTORIAL
		let historial: Historial = {
			fecha_creacion: new Date().toISOString(),
			id_agente: String(formData.get('id_agente')),
			tipo_objeto: 'cliente',
			id_objeto: nuevoCliente.id,
			accion: 'update',
			cambios: JSON.stringify(Object.fromEntries(formData.entries()))
		};

		const MapHistorial = mapObjectToColumns(historial, historialFieldMap);
		let nuevoHistorial = await appendRow('historial!A:Z', MapHistorial, 'BMS_LOG');

		invalidateCache('clientes');
		return { success: true };
	},
	update: async ({ request }) => {
		console.log('\nCliente actualizado\n');
		const formData = await request.formData();
		console.log('formdata: ', formData);

		const id = formData.get('id_cliente');
		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// ACTUALIZAR CLIENTE
		const formatedFormData = Object.fromEntries(formData.entries());
		const mapCliente = mapObjectToColumns(formatedFormData, clienteFieldMap);
		await updateRowById(id as string, mapCliente, 'clientes!A:Z');

		// HISTORIAL
		let historial: Historial = {
			fecha_creacion: new Date().toISOString(),
			id_agente: formData.get('id_agente') as string,
			tipo_objeto: 'cliente',
			id_objeto: id as string,
			accion: 'update',
			cambios: JSON.stringify(Object.fromEntries(formData.entries()))
		};

		const MapHistorial = mapObjectToColumns(historial, historialFieldMap);
		let nuevoHistorial = await appendRow('historial!A:Z', MapHistorial, 'BMS_LOG');

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
