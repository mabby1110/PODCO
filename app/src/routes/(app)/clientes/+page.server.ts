import {
	appendRow,
	mapFormDataToColumns,
	updateRowById,
	type FieldColumnMap
} from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
import { invalidateCache } from '$lib/server/google/cachedQueries';

export const actions: Actions = {
	addClient: async ({ request }) => {
		console.log('\nActividades addClient\n');
		const formData = await request.formData();

		let historial_cambios = [{ fecha: new Date().toISOString(), entrada: 'Cliente creado' }];

		const cliente = [
			new Date().toISOString(),
			JSON.stringify(historial_cambios),
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
			formData.get('tipo_prospeccion') || null
		];
		await appendRow('clientes!A:Z', cliente, 'BMS_CLI');

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
			fecha_creacion: 'B',
			historial_cambios: 'C',
			id_contpaqi: 'D',
			id_agente: 'E',
			razon_social: 'F',
			nombre_comercial: 'G',
			sector: 'H',
			estado: 'I',
			ciudad: 'J',
			ubicacion: 'K',
			contactos: 'L',
			historial: 'M',
			tipo_prospeccion: 'N',
			observaciones: 'O'
		};

		// se actualiza el historial de cambios de la actividad
		let nuevas_entradas = [
			{
				fecha: new Date().toISOString(),
				entrada: `se Actualizó Cliente`
			}
		];
		let historial_string = formData.get('historial_cambios') as string;
		let historial = historial_string ? JSON.parse(historial_string) : [];
		historial = historial.concat(nuevas_entradas);
		formData.set('historial_cambios', JSON.stringify(historial));

		const newValues = mapFormDataToColumns(formData, updateFieldMap);
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
