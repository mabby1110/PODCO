import { generateId } from '$lib/server/google/sheets';
import { fail, type Actions } from '@sveltejs/kit';
export const actions: Actions = {
	add: async ({ request, locals: { supabase, user } }) => {
		console.log('\nCrear actividad:\n');
		if (!user) return fail(401, { error: 'No autorizado' });

		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());
		data.id = generateId('BMS-ACT');
		if (typeof data.requisito_gasto === 'string') {
			try {
				data.requisito_gasto = JSON.parse(data.requisito_gasto);
				console.log('\ndata.requisito_gasto:\n', data.requisito_gasto);
			} catch (e) {
				console.error('Error al parsear la requisito_gasto', e);
			}
		}

		console.log('\ndata:\n', data);

		const { data: result, error } = await supabase
			.from('actividades')
			.insert(data)
			.select('id')
			.single();

		console.log('\nObjeto creado:\n', result, error);
		if (error) {
			return fail(500, { error: error.message });
		}

		// Insertamos en el Historial
		const { data: historial, error: errorHistorial } = await supabase
			.from('historial')
			.insert([
				{
					id: generateId('BMS-H'),
					id_agente: user?.id,
					tipo_objeto: 'actividades',
					id_objeto: result.id,
					accion: 'add',
					cambios: data
				}
			])
			.select()
			.single();
		if (errorHistorial) console.error('Fallo al registrar historial:', errorHistorial);
		console.log('\nhistorial creado:\n', historial);

		// Filtro e Insert en Notificaciones
		const { data: notificacion, error: errorNotif } = await supabase
			.from('notificaciones')
			.insert([
				{
					id: generateId('BMS-N'),
					id_agente: user?.id,
					id_historial: historial.id
				}
			])
			.select()
			.single();
		if (errorNotif) console.error('Fallo al registrar notificación:', errorNotif);
		console.log('\nNotificación creada:\n', notificacion);

		return { success: true, id: result.id };
	},

	update: async ({ request, locals: { user, supabase } }) => {
		if (!user) return fail(401, { error: 'No autorizado' });

		console.log('\nActualizar actividad:\n');
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());
		console.log(data);
		if (typeof data.requisito_gasto === 'string') {
			try {
				data.requisito_gasto = JSON.parse(data.requisito_gasto);
				console.log('\ndata.requisito_gasto:\n', data.requisito_gasto);
			} catch (e) {
				console.error('Error al parsear la requisito_gasto', e);
			}
		}
		if (typeof data.historia === 'string') {
			try {
				data.historia = JSON.parse(data.historia);
			} catch (e) {
				console.error('Error al parsear la historia', e);
			}
		}

		const id = data['id'] as string;
		if (!id) return fail(400, { error: 'ID requerido' });

		const { data: result, error: err } = await supabase
			.from('actividades')
			.update(data)
			.eq('id', id)
			.select()
			.single();

		if (err) {
			return fail(500, { error: err.message });
		}
		console.log('result', result, 'error', err);

		// Insertamos en el Historial
		const { data: historial, error: errorHistorial } = await supabase
			.from('historial')
			.insert([
				{
					id: generateId('BMS-H'),
					id_agente: user?.id,
					tipo_objeto: 'actividades',
					id_objeto: result.id,
					accion: 'update',
					cambios: data
				}
			])
			.select()
			.single();
		if (errorHistorial) console.error('Fallo al registrar historial:', errorHistorial);
		console.log('\nhistorial creado:\n', historial);

		// Filtro e Insert en Notificaciones
		const { data: notificacion, error: errorNotif } = await supabase
			.from('notificaciones')
			.insert([
				{
					id: generateId('BMS-N'),
					id_agente: user?.id,
					id_historial: historial.id
				}
			])
			.select()
			.single();
		if (errorNotif) console.error('Fallo al registrar notificación:', errorNotif);
		console.log('\nNotificación creada:\n', notificacion);

		return { success: true };
	},

	reload: async () => {
		return { success: true };
	},

	delete: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		const { error } = await supabase.from('actividades').delete().eq('id', id);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	}
};
