import {
	appendRow,
	mapFormDataToColumns,
	updateRowById,
	type FieldColumnMap
} from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getRange } from '$lib/server/google/sheets';
import { invalidateCache } from '$lib/server/google/cachedQueries';

export const load: PageServerLoad = async ({ depends }) => {
	depends('app:data');
	const actividades = await getRange('actividades!A:Z');
	return { actividades };
};
export const actions: Actions = {
	addActivity: async ({ request }) => {
		console.log('add activity');
		const formData = await request.formData();
		console.log(formData);
		let historial_cambios = [{ fecha: new Date().toISOString(), entrada: 'Actividad creada' }];
		const activityData = [
			// del sistema
			new Date().toISOString(),
			null,
			formData.get('inicio'),
			formData.get('fin'),
			null,
			formData.get('id_agente'),
			formData.get('fase'),
			JSON.stringify(historial_cambios),
			null,

			// de la actividad
			formData.get('historia'),
			formData.get('motivo'),
			formData.get('objetivo'),
			formData.get('requisitos'),
			formData.get('observaciones')
		];

		await appendRow('actividades!A:Z', activityData, 'BMS-ACT');

		invalidateCache('actividades');
		return { success: true };
	},

	updateActivity: async ({ request }) => {
		console.log('update activity :)');
		const formData = await request.formData();

		const id = formData.get('id');
		console.log(id, formData);

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// Actualizar actividad
		const updateFieldMap: FieldColumnMap = {
			fecha_creacion: 'B',
			ultima_actualizacion: 'C',
			inicio: 'D',
			fin: 'E',
			fecha_cierre: 'F',
			id_agente: 'G',
			fase: 'H',
			historial_cambios: 'I',
			documentos: 'J',
			historia: 'K',
			motivo: 'L',
			objetivo: 'M',
			requisitos: 'N',
			observaciones: 'O'
		};
		
		const newValues = mapFormDataToColumns(formData, updateFieldMap);
		await updateRowById(id as string, newValues, 'actividades!A:Z');

		// crear cliente si el formulario contiene razon social
		if (formData.get('id_cliente') || formData.get('razon_social')) {
			console.log('con razon social');
			const cliente = [
				null,
				formData.get('id_agente'),
				formData.get('razon_social'),
				null,
				null,
				null,
				null,
				formData.get('ubicacion'),
				formData.get('contactos'),
				formData.get('tipo_prospeccion'),
				new Date().toISOString()
			];

			const newClient = await appendRow('clientes!A:Z', cliente, 'BMS-CLI');

			// crear oportunidad si se ha creado el cliente nuevo
			const oportunidad = [
				newClient?.id || null,
				formData.get('id_agente') || 1,
				1,
				formData.get('motivo') || null,
				formData.get('inicio') || null,
				formData.get('fin') || null,
				null,
				null,
				null,
				new Date().toISOString(),
				null,
				formData.get('motivo') || null,
				null
			];
			await appendRow('oportunidades!A:Z', oportunidad, 'BMS-OP');
		}

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
