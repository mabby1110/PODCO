import {
	appendRow,
	mapFormDataToColumns,
	updateRowById,
	type FieldColumnMap
} from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
import { processAttachments, uploadToFolder } from '$lib/server/google/drive';
import { Readable } from 'stream';
import { invalidateCache } from '$lib/server/google/cachedQueries';

export const actions: Actions = {
	addClient: async ({ request }) => {
		console.log('\nActividades addClient\n');
		const formData = await request.formData();

		let historial_cambios = [{ fecha: new Date().toISOString(), entrada: 'Cliente creado' }];

		const cliente = [
			// del sistema
			new Date().toISOString(),
			null,
			JSON.stringify(historial_cambios),
			null,
			null,
			formData.get('id_agente') || 1,
			formData.get('razon_social') || null,
			formData.get('nombre_comercial') || null,
			formData.get('sector') || null,
			formData.get('estado') || null,
			formData.get('ciudad') || null,
			formData.get('ubicacion') || null,
			formData.get('contactos') || null,
			formData.get('historial') || null,
			formData.get('tipo_prospeccion') || null,
		];

		const newClient = await appendRow('clientes!A:Z', cliente);

		// const oportunidad = [
		// 	newClient?.id,
		// 	formData.get('id_agente'),
		// 	formData.get('fase'),
		// 	formData.get('motivo'),
		// 	formData.get('inicio'),
		// 	formData.get('fin'),
		// 	formData.get('motivo'),
		// 	formData.get('cotizaciones'),
		// 	formData.get('requisitos'),
		// 	new Date().toISOString()
		// ];

		// await appendRow('oportunidades!A:Z', oportunidad, 'BMS_CLI');
		invalidateCache('clientes');

		return { success: true };
	},

	updateClient: async ({ request }) => {
		console.log('\nActividades updateClient\n');
		const formData = await request.formData();
		const id = formData.get('id');
		console.log('formdata: ', formData);

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		const updateFieldMap: FieldColumnMap = {
			id_contpaqi: "B",
			id_agente: "C",
			razon_social: "D",
			nombre_comercial: "E",
			estado: "F",
			sector: "G",
			ciudad: "H",
			ubicacion: "I",
			contactos: "J",
			tipo_prospeccion: "K",
			fecha_creacion: "L",
			fecha_sync: "N",
		};
															
		const newValues = mapFormDataToColumns(formData, updateFieldMap);

		// Agregar fecha de actualización
		newValues['M'] = new Date().toISOString();

		await updateRowById(id as string, newValues, 'clientes!A:Z');
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
