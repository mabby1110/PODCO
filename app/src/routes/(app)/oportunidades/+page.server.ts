import {
	appendRow,
	mapFormDataToColumns,
	updateRowById,
	type FieldColumnMap
} from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
import { processAttachments } from '$lib/server/google/drive';
import { invalidateCache } from '$lib/server/google/cachedQueries';

export const actions: Actions = {
	addOp: async ({ request }) => {
		console.log('\nAgregar Oportunidad\n');
		const formData = await request.formData();
		console.log(formData);

		if (formData.get('razon_social')) {
			// crear oportunidad con cliente nuevo
			console.log('cliente nuevo');

			// se creal cliente nuevo
			const cliente = [
				new Date().toISOString(),
				JSON.stringify([{ fecha: new Date().toISOString(), entrada: 'Cliente creado' }]),
				null,
				formData.get('id_agente'),
				formData.get('razon_social'),
				null,
				null,
				null,
				null,
				formData.get('ubicacion'),
				formData.get('contactos'),
				formData.get('tipo_prospeccion')
			];
			const newClient = await appendRow('clientes!A:Z', cliente, 'BMS-CLI');
			formData.set('id_cliente', newClient.id);
			// se actualiza el historial de cambios de la actividad
			let nuevas_entradas = [
				{
					fecha: new Date().toISOString(),
					entrada: `se creo Cliente ${newClient.id}`
				}
			];
			let historial_string = formData.get('historial_cambios') as string;
			let historial = historial_string ? JSON.parse(historial_string) : [];
			historial = historial.concat(nuevas_entradas);
			formData.set('historial_cambios', JSON.stringify(historial));
		}

		const oportunidad = [
			new Date().toISOString(),
			JSON.stringify([{ fecha: new Date().toISOString(), entrada: `Oportunidad creada` }]),
			formData.get('inicio'),
			formData.get('fin'),
			null,
			formData.get('id_agente'),
			formData.get('fase'),
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
			formData.get('motivo'),
			null,
			null,
			formData.get('fecha_analisis'),
			null,
			null,
			null,
			null,
			null,
		];

		console.log(formData, oportunidad);
		const op = await appendRow('oportunidades!A:Z', oportunidad, 'BMS-OP');

		invalidateCache('oportunidades');
		return { success: true, op: op.id };
	},

	updateOp: async ({ request }) => {
		console.log('update action');

		const formData = await request.formData();
		console.log(formData);
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}
		// se actualiza el historial de cambios de la actividad
		let historial_string = formData.get('historial_cambios') as string;
		let historial = historial_string ? JSON.parse(historial_string) : [];
		let nueva_entrada = [
			{
				fecha: new Date().toISOString(),
				entrada: `Actualización`
			}
		];
		historial = historial.concat(nueva_entrada);

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
			documentos_operacion: 'U',
			etiquetas: 'W',
			monto_oc: 'X',
			fecha_analisis: 'Y',
			fecha_negociacion: 'Z',
			fecha_pedido: 'AA',
			fecha_proceso_entrega: 'AB',
			fecha_transito: 'AC',
			fecha_entrega: 'AD',
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

				let nueva_entrada = [
					{
						fecha: new Date().toISOString(),
						entrada: `Se sube cotización`
					}
				];
				historial = historial.concat(nueva_entrada);
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
				let nueva_entrada = [
					{
						fecha: new Date().toISOString(),
						entrada: `Se sube cotización ganadora`
					}
				];
				historial = historial.concat(nueva_entrada);
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
				let nueva_entrada = [
					{
						fecha: new Date().toISOString(),
						entrada: `Se sube orden de compra del cliente`
					}
				];
				historial = historial.concat(nueva_entrada);
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
				let nueva_entrada = [
					{
						fecha: new Date().toISOString(),
						entrada: `Se sube(n) archivo(s) adjuntos`
					}
				];
				historial = historial.concat(nueva_entrada);
			} catch (err) {
				console.error('Error procesando documentos', err);
			}
		}

		// ---------- DOCUMENTOS OPERACION ----------
		if (formData.get('docOperFile')) {
			try {
				const docOperFiles = formData.getAll('docOperFile') as File[];
				const docsOpRaw = formData.get('documentos_operacion');
				const updatedDocsOp = await processAttachments(
					docOperFiles,
					agenteNombre,
					opFolder,
					docsOpRaw
				);
				newValues['U'] = JSON.stringify(updatedDocsOp);
				let nueva_entrada = [
					{
						fecha: new Date().toISOString(),
						entrada: `Se sube(n) documentos(s) logistica`
					}
				];
				historial = historial.concat(nueva_entrada);
			} catch (err) {
				console.error('Error procesando documentos de operacion', err);
			}
		}

		newValues['C'] = JSON.stringify(historial);

		// ---------- UPDATE SHEET ----------
		await updateRowById(id as string, newValues, 'oportunidades!A:Z');

		invalidateCache('clientes');
		invalidateCache('oportunidades');
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
