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
		console.log(formData.get('fase'));
		console.log(formData.get('fase') == '0');

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// map actividad
		const updateFieldMap: FieldColumnMap = {
			// del sistema
			historial_cambios: 'C',
			inicio: 'D',
			fin: 'E',
			fecha_cierre: 'F',
			id_agente: 'G',
			fase: 'H',
			documentos: 'I',

			// de la actividad
			historia: 'J',
			motivo: 'K',
			objetivo: 'L',
			requisitos: 'M',
			observaciones: 'N'
		};

		if (formData.get('fase') == '0') {
			// se finaliza actividad
			console.log('actividad cancelada');

			let historial = JSON.parse(formData.get('historial_cambios') as string) || [];

			let nueva_entrada = {
				fecha: new Date().toISOString(),
				entrada: `Se descartó la Actividad`
			};

			historial.push(nueva_entrada);
			console.log('historial actualizado', historial);
			formData.set('historial_cambios', JSON.stringify(historial));
		} else if (formData.get('id_cliente')) {
			// crear oportunidad con cliente existente
			console.log('cliente existente');
			const oportunidad = [
				new Date().toISOString(),
				JSON.stringify([{ fecha: new Date().toISOString(), entrada: `Oportunidad creada de actividad ${id}` }]),
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

			// se actualiza el historial de cambios de la actividad
			let nuevas_entradas = [
				{
					fecha: new Date().toISOString(),
					entrada: `se creo Oportunidad ${newOp.id}`
				}
			];
			let historial_string = formData.get('historial_cambios') as string;
			let historial = historial_string ? JSON.parse(historial_string) : [];

			historial = historial.concat(nuevas_entradas);

			formData.set('historial_cambios', JSON.stringify(historial));

			// se eliminan campos que no se deben modificar
			delete updateFieldMap.motivo;
			delete updateFieldMap.objetivo;
			delete updateFieldMap.observaciones;
			delete updateFieldMap.requisitos;
			delete updateFieldMap.inicio;
			delete updateFieldMap.fin;
		} else if (formData.get('razon_social')) {
			// crear oportunidad con cliente nuevo
			console.log('cliente nuevo');

			// se creal cliente nuevo
			const cliente = [
				new Date().toISOString(),
				JSON.stringify([{ fecha: new Date().toISOString(), entrada: 'Cliente creado' }]),
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
				formData.get('tipo_prospeccion')
			];
			const newClient = await appendRow('clientes!A:Z', cliente, 'BMS-CLI');

			// se crea oportunidad con el cliente nuevo
			const oportunidad = [
				new Date().toISOString(),
				JSON.stringify([{ fecha: new Date().toISOString(), entrada: `Oportunidad creada de actividad ${id}` }]),
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

			// se actualiza el historial de cambios de la actividad

			let nuevas_entradas = [
				{
					fecha: new Date().toISOString(),
					entrada: `se creo Cliente ${newClient.id}`
				},
				{
					fecha: new Date().toISOString(),
					entrada: `se creo Oportunidad ${newOp.id}`
				}
			];

			let historial_string = formData.get('historial_cambios') as string;
			let historial = historial_string ? JSON.parse(historial_string) : [];

			historial = historial.concat(nuevas_entradas);

			formData.set('historial_cambios', JSON.stringify(historial));

			// se eliminan campos que no se deben modificar
			delete updateFieldMap.motivo;
			delete updateFieldMap.objetivo;
			delete updateFieldMap.observaciones;
			delete updateFieldMap.requisitos;
			delete updateFieldMap.inicio;
			delete updateFieldMap.fin;
		} else {
			// se actualiza la actividad
			console.log('actividad actualizada');

			let historial = JSON.parse(formData.get('historial_cambios') as string) || [];

			let nueva_entrada = {
				fecha: new Date().toISOString(),
				entrada: `Se actualizó la Actividad`
			};

			historial.push(nueva_entrada);
			console.log('historial actualizado', historial);
			formData.set('historial_cambios', JSON.stringify(historial));
		}

		const newValues = mapFormDataToColumns(formData, updateFieldMap);
		await updateRowById(id as string, newValues, 'actividades!A:Z');

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
