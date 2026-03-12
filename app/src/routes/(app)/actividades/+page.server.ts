import {
	appendRow,
	mapFormDataToColumns,
	updateRowById,
	type FieldColumnMap
} from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
import { processAttachments, uploadToFolder } from '$lib/server/google/drive';
import { Readable } from 'stream';
import type { PageServerLoad } from './$types';
import { getRange } from '$lib/server/google/sheets';

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
		const activityData = [
			formData.get('id_agente') || 1,
			formData.get('fase') || 1,
			formData.get('motivo') || null,
			formData.get('inicio') || null,
			formData.get('fin') || null,
			formData.get('historia') || null,
			formData.get('requisitos') || null,
			new Date().toISOString(),
			null,
			null,
			formData.get('observaciones') || null,
			formData.get('potencial_venta') || null,
			formData.get('objetivo') || null
		];
		await appendRow('actividades!A:Z', activityData);

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
			id_agente: 'B',
			fase: 'C',
			motivo: 'D',
			inicio: 'E',
			fin: 'F',
			historia: 'G',
			requisitos: 'H',
			fecha_cierre: 'J',
			obsevaciones: 'L',
			potencial_venta: 'M',
			objetivos: 'N'
		};

		const newValues = mapFormDataToColumns(formData, updateFieldMap);
		// await updateRowById(id as string, newValues, 'actividades!A:Z');

		// crear cliente si el formulario contiene razon social
		if(formData.get('razon_social')){

			const cliente = [
				null,
				formData.get('id_agente') || 1,
				formData.get('razon_social') || null,
				formData.get('ubicacion') || null,
				formData.get('contactos') || null,
				formData.get('tipo_prospeccion') || null,
				new Date().toISOString()
			];
	
			// const newClient = await appendRow('clientes!A:Z', cliente);
	
			// crear oportunidad si se ha creado el cliente nuevo
			// const oportunidad = [
			// 	newClient?.id || null,
			// 	formData.get('id_agente') || 1,
			// 	formData.get('fase') || 1,
			// 	formData.get('motivo') || null,
			// 	formData.get('inicio') || null,
			// 	formData.get('fin') || null,
			// 	formData.get('motivo') || null,
			// 	formData.get('cotizaciones') || null,
			// 	formData.get('requisitos') || null,
			// 	new Date().toISOString()
			// ];
	
			// await appendRow('oportunidades!A:Z', oportunidad);
		}

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
