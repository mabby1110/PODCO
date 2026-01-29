// +page.server.ts
import type { Actions, PageServerLoad } from './$types';
import {
	appendRow,
	updateRowById,
	uploadToFolder
} from '$lib/server/googleApi';
import { fail } from '@sveltejs/kit';
import { Readable } from 'stream';
    
const RANGE = 'historial_actividades!A:K';

export const load: PageServerLoad = async () => {
	console.log('\nActividades loaded\n');
};

export const actions: Actions = {
	add: async ({ request}) => {
		console.log('\nActividades add\n');
		const formData = await request.formData();
		const rowData = [
			// id_oportunidad se genera automáticamente en appendRow, no lo incluimos aquí
			formData.get('id_cliente') || formData.get('id_cliente') || null, // B - id_cliente
			formData.get('id_agente') || 1, // C - id_agente
			formData.get('fase') || 1, // D - fase
			formData.get('motivo') || null, // E - motivo
			formData.get('inicio') || null, // F - inicio
			formData.get('fin') || null, // G - fin
			formData.get('historia') || null, // H - historia
			formData.get('cotizaciones') || null, // I - cotizaciones
			formData.get('documentos') || null, // J - documentos
			new Date().toISOString(), // K - fecha_creacion (fecha actual)
			null // L - fecha_cierre (null al crear)
		];
		console.log(formData, rowData);
		await appendRow('oportunidades!A:Z', rowData);

		return { success: true };
	},

	addClient: async ({ request}) => {
		console.log('\nActividades addClient\n');
		const formData = await request.formData();
		const rowData = [
			// id_oportunidad se genera automáticamente en appendRow, no lo incluimos aquí
			formData.get('id_agente') || 1,
			formData.get('razon_social') || null,
			formData.get('ubicacion') || null,
			formData.get('contactos') || null,
			new Date().toISOString(),
		];
		console.log(formData, rowData);
		await appendRow('clientes!A:Z', rowData);

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

		// Preparar objeto con las columnas a actualizar
		const newValues: { [key: string]: any } = {};

		// Solo incluir campos que vengan en el formData
		if (formData.has('id_cliente')) newValues['B'] = formData.get('id_cliente');
		if (formData.has('id_agente')) newValues['C'] = formData.get('id_agente');
		if (formData.has('fase')) newValues['D'] = formData.get('fase');
		if (formData.has('motivo')) newValues['E'] = formData.get('motivo');
		if (formData.has('inicio')) newValues['F'] = formData.get('inicio');
		if (formData.has('fin')) newValues['G'] = formData.get('fin');
		if (formData.has('historia')) newValues['H'] = formData.get('historia');
		if (formData.has('cotizaciones')) newValues['I'] = formData.get('cotizaciones');
		if (formData.has('documentos')) newValues['J'] = formData.get('documentos');
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

		// Marcar como cerrado en lugar de eliminar
		await updateRowById(
			id as string,
			{
				L: new Date().toISOString() // fecha_cierre
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

		const uploaded = await uploadToFolder(
			file.name,
			file.type,
			stream
		);

		return {
			success: true,
			file: uploaded
		};
	}
};
