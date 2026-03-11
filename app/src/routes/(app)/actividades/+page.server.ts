import {
	appendRow,
	mapFormDataToColumns,
	updateRowById,
	type FieldColumnMap
} from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
import { processAttachments, uploadToFolder } from '$lib/server/google/drive';
import { Readable } from 'stream';

export const actions: Actions = {
	addActivity: async ({ request }) => {
		console.log('add activity');
		const formData = await request.formData();
		console.log(formData);
		const rowData = [
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

		await appendRow('actividades!A:Z', rowData);

		return { success: true };
	},

	updateActivity: async ({ request }) => {
		console.log('update activity');
		const formData = await request.formData();
		const id = formData.get('id');
		console.log(id, formData);

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		const updateFieldMap: FieldColumnMap = {
			id_agente: 'B',
			fase: 'C',
			motivo: 'D',
			inicio: 'E',
			fin: 'F',
			historia: 'G',
			requisitos: 'H',
			fecha_cierre: 'J'
		};

		const newValues = mapFormDataToColumns(formData, updateFieldMap);

		await updateRowById(id as string, newValues, 'actividades!A:Z');

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
