import { construirDatosActividad } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';
import crypto from 'crypto';
function generateId(prefix = 'BMS') {
	const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const hash = crypto.randomBytes(4).toString('hex');
	return `${prefix}-${date}-${hash}`;
}
export const actions: Actions = {
	add: async ({ request, locals: { supabase, user } }) => {
		console.log('\nCrear actividad:\n');
		if (!user) return fail(401, { error: 'No autorizado' });
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());
		console.log('\nformData:\n', data);

		const actividad = construirDatosActividad(data);
		const { data: result, error } = await supabase
			.from('actividades')
			.insert([actividad])
			.select('id')
			.single();

		if (error) {
			return fail(500, { error: error.message });
		}
		console.log('\nObjeto creado:\n', result);

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

		return { success: true, act: result.id };
	},

	update: async ({ request, locals: { user, supabase } }) => {
		console.log('\nActualizar actividad:\n');
		if (!user) return fail(401, { error: 'No autorizado' });

		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());
		console.log(data);

		const id = data['id'] as string;
		if (!id) return fail(400, { error: 'ID requerido' });

		const actividad = construirDatosActividad(data, id);
		const { data: result, error: err } = await supabase
			.from('actividades')
			.update(actividad)
			.eq('id', id)
			.select()
			.single();

		if (err) {
			return fail(500, { error: err.message });
		}
		console.log('result', result);

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
