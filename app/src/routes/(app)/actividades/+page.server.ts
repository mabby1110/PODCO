import {
	appendRow,
	mapFormDataToColumns,
	updateRowById,
	type FieldColumnMap
} from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
import { uploadToFolder } from '$lib/server/google/drive';
import { Readable } from 'stream';

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
			null,
			formData.get('motivo') || null
		];

		console.log(formData, rowData);
		await appendRow('oportunidades!A:Z', rowData);

		return { success: true };
	},

	updateOp: async ({ request }) => {
		console.log('update action');

		const formData = await request.formData();
		const id = formData.get('id');
		console.log(formData);
		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// ---------- MAP FORM ----------
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

		const agenteNombre = formData.get('agente') as string;
		const opFolder = `${id}`;

		// ---------- UPLOAD QUOTE ----------
		let uploadedQuoteFile = null;
		const quoteFile = formData.get('quoteFile') as File;

		if (quoteFile && quoteFile.size > 0) {
			const buffer = Buffer.from(await quoteFile.arrayBuffer());
			const stream = Readable.from(buffer);

			uploadedQuoteFile = await uploadToFolder(
				quoteFile.name,
				quoteFile.type,
				stream,
				agenteNombre,
				opFolder
			);
		}

		// ---------- COTIZACIONES ----------
		try {
			const historialRaw = formData.get('cotizaciones');
			const nuevaCotizacionId = formData.get('nuevaCotizacion') as string | null;

			let historial: any[] = [];

			if (historialRaw && String(historialRaw).trim() !== '') {
				try {
					historial = JSON.parse(historialRaw as string);
					if (!Array.isArray(historial)) historial = [];
				} catch {
					historial = [];
				}
			}

			if (nuevaCotizacionId && uploadedQuoteFile?.webViewLink) {
				historial.push({
					id: nuevaCotizacionId,
					name: uploadedQuoteFile.name,
					url: uploadedQuoteFile.webViewLink,
					preview: `https://drive.google.com/file/d/${uploadedQuoteFile.id}/preview`
				});
			}

			newValues['I'] = JSON.stringify(historial);
		} catch (err) {
			console.error('Error procesando cotizaciones', err);
		}

		// ---------- UPLOAD DOC ----------
		let uploadedDocFile = null;
		const docFile = formData.get('docFile') as File;

		if (docFile && docFile.size > 0) {
			const buffer = Buffer.from(await docFile.arrayBuffer());
			const stream = Readable.from(buffer);

			uploadedDocFile = await uploadToFolder(
				docFile.name,
				docFile.type,
				stream,
				agenteNombre,
				opFolder
			);
		}

		// ---------- DOCUMENTOS ----------
		try {
			const docsRaw = formData.get('requisitos');

			let docs: any[] = [];

			if (docsRaw && String(docsRaw).trim() !== '') {
				try {
					docs = JSON.parse(docsRaw as string);
					if (!Array.isArray(docs)) docs = [];
				} catch {
					docs = [];
				}
			}

			if (uploadedDocFile?.webViewLink) {
				docs.push({
					name: uploadedDocFile.name,
					url: uploadedDocFile.webViewLink,
					preview: `https://drive.google.com/file/d/${uploadedDocFile.id}/preview`
				});
			}

			newValues['O'] = JSON.stringify(docs);
		} catch (err) {
			console.error('Error procesando documentos', err);
		}

		// ---------- UPDATE SHEET ----------
		await updateRowById(id as string, newValues, 'oportunidades!A:Z');

		return {
			success: true,
			file: uploadedQuoteFile
		};
	},

	addActivity: async ({ request }) => {
		console.log('update activity');
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
			null
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
			contactos: 'F'
		};

		const newValues = mapFormDataToColumns(formData, updateFieldMap);

		// Agregar fecha de actualización
		newValues['I'] = new Date().toISOString();

		await updateRowById(id as string, newValues, 'clientes!A:Z');

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

	// uploadFile: async ({ request }) => {
	// 	const data = await request.formData();
	// 	const file = data.get('file') as File;

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
