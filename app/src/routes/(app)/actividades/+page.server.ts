import type { Actions, PageServerLoad } from './$types';
import { appendRow, updateRowById, uploadToFolder } from '$lib/server/googleApi';
import { fail } from '@sveltejs/kit';
import { Readable } from 'stream';

export const actions: Actions = {
	add: async ({ request }) => {
		console.log('\nActividades add\n');
		const formData = await request.formData();
		const rowData = [
			formData.get('id_cliente') || formData.get('id_cliente') || null,
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
			formData.get('motivo') || null,
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
			new Date().toISOString(),
			null
		];

		await appendRow('oportunidades!A:Z', oportunidad);
		console.log(formData, oportunidad, cliente);

		return { success: true };
	},

	update: async ({ request }) => {
		console.log('update action');
		const formData = await request.formData();
		const id = formData.get('id');
		console.log(id, formData);

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		const newValues: { [key: string]: any } = {};

		if (formData.has('id_cliente')) newValues['B'] = formData.get('id_cliente');
		if (formData.has('id_agente')) newValues['C'] = formData.get('id_agente');
		if (formData.has('fase')) newValues['D'] = formData.get('fase');
		if (formData.has('motivo')) newValues['E'] = formData.get('motivo');
		if (formData.has('inicio')) newValues['F'] = formData.get('inicio');
		if (formData.has('fin')) newValues['G'] = formData.get('fin');
		if (formData.has('historia')) newValues['H'] = formData.get('historia');
		if (formData.has('cotizaciones')) newValues['I'] = formData.get('cotizaciones');
		if (formData.has('requisitos')) newValues['J'] = formData.get('requisitos');
		if (formData.has('fecha_cierre')) newValues['L'] = formData.get('fecha_cierre');

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

	upload: async ({ request }) => {
		const data = await request.formData();
		const file = data.get('cotizacion') as File;

		if (!file || file.size === 0) {
			throw new Error('Archivo requerido');
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const stream = Readable.from(buffer);

		const uploaded = await uploadToFolder(file.name, file.type, stream);

		return {
			success: true,
			file: uploaded
		};
	}
};
