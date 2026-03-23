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
import { invalidateCache } from '$lib/server/google/cachedQueries';

export const load: PageServerLoad = async ({ depends }) => {
	depends('app:data');
	const oportunidades = await getRange('oportunidades!A:Z');
	return { oportunidades };
};

export const actions: Actions = {
	addOp: async ({ request }) => {
		console.log('\nActividades add\n');
		const formData = await request.formData();
		console.log(formData);

		const oportunidad = [
			new Date().toISOString(),
			JSON.stringify([{ fecha: new Date().toISOString(), entrada: `Oportunidad creada` }]),
			formData.get('inicio'),
			formData.get('fin'),
			null,
			formData.get('id_agente'),
			2,
			null,
			null,
			formData.get('motivo'),
			formData.get('objetivo'),
			formData.get('requisitos'),
			formData.get('observaciones'),
			formData.get('necesidad'),
			formData.get('potencial_venta'),
			formData.get('id_cliente'),
			null,
			null,
			null,
			null,
			formData.get('motivo')
		];

		console.log(formData, oportunidad);
		await appendRow('oportunidades!A:Z', oportunidad, 'BMS-OP');

		invalidateCache('oportunidades');
		return { success: true };
	},
	
	updateOp: async ({ request }) => {
		console.log('update action');

		const formData = await request.formData();
		console.log(formData);
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// ---------- MAP FORM ----------
		const updateFieldMap: FieldColumnMap = {
			historial_cambios: 'C',
			inicio: 'D',
			fin: 'E',
			fecha_cierre: 'F',
			id_agente: 'G',
			fase: 'H',
			documentos: 'I',
			historia: 'J',
			motivo: 'K',
			objetivo: 'L',
			requisitos: 'M',
			observaciones: 'N',
			necesidades: 'O',
			potencial_venta: 'P',
			id_cliente: 'Q',
			cotizaciones_presentadas: 'R',
			cotizaciones_ganadas: 'S',
			oc_cliente: 'T',
			documentos_operacion: 'U'
		};

		const newValues = mapFormDataToColumns(formData, updateFieldMap);
		const agenteNombre = formData.get('agente') as string;
		const opFolder = `${id}`;

		// ---------- COTIZACIONES PRESENTADAS ----------
		if (formData.get('quoteFile')) {
			try {
				const quoteFiles = formData.getAll('quoteFile') as File[];
				const quotesRaw = formData.get('cotizaciones_presentadas');
				const updatedQuotes = await processAttachments(
					quoteFiles,
					agenteNombre,
					opFolder,
					quotesRaw
				);
				newValues['R'] = JSON.stringify(updatedQuotes);
			} catch (err) {
				console.error('Error procesando cotizaciones', err);
			}
		}

		// ---------- COTIZACIONES GANADAS ----------
		if (formData.get('quoteWonFile')) {
			try {
				const quoteWonFiles = formData.getAll('quoteWonFile') as File[];
				const quotesWonRaw = formData.get('cotizaciones_ganadas');
				const updatedQuotesWon = await processAttachments(
					quoteWonFiles,
					agenteNombre,
					opFolder,
					quotesWonRaw
				);
				newValues['S'] = JSON.stringify(updatedQuotesWon);
			} catch (err) {
				console.error('Error procesando cotizaciones ganadas', err);
			}
		}

		// ---------- OC CLIENTE ----------
		if (formData.get('ocFile')) {
			try {
				const ocFiles = formData.getAll('ocFile') as File[];
				const ocRaw = formData.get('oc_cliente');
				const updatedOC = await processAttachments(ocFiles, agenteNombre, opFolder, ocRaw);
				newValues['T'] = JSON.stringify(updatedOC);
			} catch (err) {
				console.error('Error procesando OC Cliente', err);
			}
		}

		// ---------- DOCUMENTOS ----------
		if (formData.get('docFile')) {
			try {
				const docFiles = formData.getAll('docFile') as File[];
				const docsRaw = formData.get('documentos');
				const docs = await processAttachments(docFiles, agenteNombre, opFolder, docsRaw);
				newValues['I'] = JSON.stringify(docs);
			} catch (err) {
				console.error('Error procesando documentos', err);
			}
		}

		// ---------- DOCUMENTOS OPERACION ----------
		if (formData.get('docOpFile')) {
			try {
				const docOpFiles = formData.getAll('docOpFile') as File[];
				const docsOpRaw = formData.get('documentos_operacion');
				const updatedDocsOp = await processAttachments(
					docOpFiles,
					agenteNombre,
					opFolder,
					docsOpRaw
				);
				newValues['U'] = JSON.stringify(updatedDocsOp);
			} catch (err) {
				console.error('Error procesando documentos de operacion', err);
			}
		}

		// ---------- UPDATE SHEET ----------
		await updateRowById(id as string, newValues, 'oportunidades!A:Z');

		invalidateCache('oportunidades');

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
