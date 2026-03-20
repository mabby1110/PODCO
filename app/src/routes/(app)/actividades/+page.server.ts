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
			JSON.stringify(historial_cambios),
			formData.get('inicio'),
			formData.get('fin'),
			null,
			formData.get('id_agente'),
			formData.get('fase'),
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
		console.log('update activity');
		const formData = await request.formData();

		const id = formData.get('id');
		console.log(id, formData);

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// Actualizar actividad
		const updateFieldMap: FieldColumnMap = {
			ultima_actualizacion: 'C',
			inicio: 'D',
			fin: 'E',
			fecha_cierre: 'F',
			id_agente: 'G',
			fase: 'H',
			historial_cambios: 'C',
			documentos: 'J',
			historia: 'K',
			motivo: 'L',
			objetivo: 'M',
			requisitos: 'N',
			observaciones: 'O'
		};

		// crear oportunidad con cliente existente o cliente nuevo
		if (formData.get('razon_social')) {
			console.log('cliente nuevo');
			delete updateFieldMap.motivo;
			delete updateFieldMap.objetivo;
			delete updateFieldMap.observaciones;
			delete updateFieldMap.requisitos;

			let historial_cambios_cliente = [
				{ fecha: new Date().toISOString(), entrada: 'Cliente creado' }
			];
			const cliente = [
				new Date().toISOString(),
				null,
				JSON.stringify(historial_cambios_cliente),
				null,
				formData.get('observaciones'),
				formData.get('id_agente'),
				formData.get('razon_social'),
				null,
				null,
				null,
				null,
				formData.get('ubicacion'),
				formData.get('contactos'),
				null,
				formData.get('tipo_prospeccion')
			];
			const newClient = await appendRow('clientes!A:Z', cliente, 'BMS-CLI');

			const oportunidad = [
				new Date().toISOString(),
				JSON.stringify([{ fecha: new Date().toISOString(), entrada: 'Oportunidad creada' }]),
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
				newClient.id,
				null,
				null,
				null,
				null,
				formData.get('motivo_inicial')
			];
			let newOp = await appendRow('oportunidades!A:Z', oportunidad, 'BMS-OP');

			// se actualiza el historial de cambios
			let entrada_historial = JSON.stringify([
				{
					fecha: new Date().toISOString(),
					entrada: `se creo Cliente ${newClient.id}`
				},
				{
					fecha: new Date().toISOString(),
					entrada: `se creo Oportunidad ${newOp.id}`
				}
			]);
			let historial = JSON.parse(formData.get('historial_cambios') as string);
			historial.push(entrada_historial);
			formData.set('historial_cambios', JSON.stringify(historial));
		} else if (formData.get('id_cliente')) {
			console.log('cliente existente');
			// se crea oportunidad
			const oportunidad = [
				new Date().toISOString(),
				JSON.stringify([{ fecha: new Date().toISOString(), entrada: 'Oportunidad creada' }]),
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
				formData.get('motivo_inicial')
			];
			let newOp = await appendRow('oportunidades!A:Z', oportunidad, 'BMS-OP');

			// se actualiza el historial de cambios
			let entrada_historial = [
				{
					fecha: new Date().toISOString(),
					entrada: `se creo Oportunidad ${newOp.id}`
				}
			];
			let historial = JSON.parse(formData.get('historial_cambios') as string);
			historial.push(entrada_historial);
			formData.set('historial_cambios', JSON.stringify(historial));

			delete updateFieldMap.motivo;
			delete updateFieldMap.objetivo;
			delete updateFieldMap.observaciones;
			delete updateFieldMap.requisitos;
		}

		const newValues = mapFormDataToColumns(formData, updateFieldMap);
		await updateRowById(id as string, newValues, 'actividades!A:Z');

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
