import type { Actions, PageServerLoad } from './$types';
import { appendRow, mapFormDataToColumns, updateRowById, type FieldColumnMap } from '$lib/server/googleApi';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
	add: async ({ request }) => {
		console.log('\nActividades add\n');
		const formData = await request.formData();
		
		const rowData = [
			formData.get('id_cliente') || null,
			formData.get('id_agente') || 1,
			formData.get('fase') || 1,
			formData.get('motivo') || null,
			formData.get('inicio') || null,
			formData.get('fin') || null,
			formData.get('historia') || null,
			formData.get('cotizaciones') || null,
			formData.get('requisitos') || null,
			new Date().toISOString(),
			null
		];
		
		console.log(formData, rowData);
		await appendRow('oportunidades!A:Z', rowData);

		return { success: true };
	},

	addClient: async ({ request }) => {
		console.log('\nActividades addClient\n');
		const formData = await request.formData();

		const cliente = [
			null,
			formData.get('id_agente') || 1,
			formData.get('razon_social') || null,
			formData.get('ubicacion') || null,
			formData.get('contactos') || null,
			formData.get('tipo_prospeccion') || null,
			new Date().toISOString()
		];

		const newClient = await appendRow('clientes!A:Z', cliente);

		const oportunidad = [
			newClient?.id || null,
			formData.get('id_agente') || 1,
			formData.get('fase') || 1,
			formData.get('motivo') || null,
			formData.get('inicio') || null,
			formData.get('fin') || null,
			formData.get('motivo') || null,
			formData.get('cotizaciones') || null,
			formData.get('requisitos') || null,
			new Date().toISOString()
		];

		await appendRow('oportunidades!A:Z', oportunidad);
		console.log(formData, oportunidad, cliente);

		return { success: true };
	},

	updateClient: async ({ request }) => {
		console.log('\nActividades updateClient\n');
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		const updateFieldMap: FieldColumnMap = {
			id_agente: 'C',
			razon_social: 'D',
			ubicacion: 'E',
			contactos: 'F',
		};

		const newValues = mapFormDataToColumns(formData, updateFieldMap);
		
		// Agregar fecha de actualización
		newValues['I'] = new Date().toISOString();

		await updateRowById(id as string, newValues, 'clientes!A:Z');

		return { success: true };
	},

	updateOp: async ({ request }) => {
		console.log('update action');
		const formData = await request.formData();
		const id = formData.get('id');
		console.log(id, formData);

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		const updateFieldMap: FieldColumnMap = {
			id_cliente: 'B',
			id_agente: 'C',
			fase: 'D',
			motivo: 'E',
			inicio: 'F',
			fin: 'G',
			historia: 'H',
			cotizaciones: 'I',
			requisitos: 'J',
			fecha_cierre: 'L'
		};

		const newValues = mapFormDataToColumns(formData, updateFieldMap);

		await updateRowById(id as string, newValues, 'oportunidades!A:Z');

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
	},

	// upload: async ({ request }) => {
	// 	const data = await request.formData();
	// 	const file = data.get('cotizacion') as File;

	// 	if (!file || file.size === 0) {
	// 		throw new Error('Archivo requerido');
	// 	}

	// 	const buffer = Buffer.from(await file.arrayBuffer());
	// 	const stream = Readable.from(buffer);

	// 	const uploaded = await uploadToFolder(file.name, file.type, stream);

	// 	return {
	// 		success: true,
	// 		file: uploaded
	// 	};
	// }
};