// page.server.ts
import { generateId } from '$lib/server/google/sheets';
import { construirDatosCliente, construirDatosOportunidad } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	add: async ({ request, locals: { supabase, user } }) => {
		console.log('\nOportunidad nueva\n');
		if (!user) return 0;
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		// ¿Necesitamos crear un cliente nuevo primero?
		if (data['nombre_comercial']) {
			console.log('Creando cliente nuevo enlazado...');

			const clienteData = construirDatosCliente(data);
			console.log('objeto cliente creado: ', clienteData);
			const { data: clienteResult, error: clienteError } = await supabase
				.from('clientes')
				.insert([clienteData])
				.select('id')
				.single();

			console.log('\n', clienteError, clienteResult, '\n');
			if (clienteError) {
				return fail(500, { error: `Error al crear cliente: ${clienteError.message}` });
			}

			data['id_cliente'] = clienteResult.id;
			delete data['razon_social'];
		}

		// Crear la oportunidad
		const oportunidad = construirDatosOportunidad(data);
		const { data: result, error } = await supabase
			.from('oportunidades')
			.insert([oportunidad])
			.select('id')
			.single();
		if (error) {
			return fail(500, { error: error.message });
		}
		console.log('result', result);

		// Insertamos en el Historial
		const { data: historial, error: errorHistorial } = await supabase
			.from('historial')
			.insert([
				{
					id: generateId('BMS-H'),
					id_agente: user?.id,
					tipo_objeto: 'oportunidades',
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
		return { success: true, op: result.id };
	},
	update: async ({ request, locals: { supabase, user } }) => {
		console.log('\nOportunidaddd actualizada\n');
		if (!user) return 0;
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		/* PROCESAR OPORTUNIDAD */
		const id = (data['id_op'] as string) || (data['id'] as string);
		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		const oportunidad = construirDatosOportunidad(data, id);
		delete data.id;

		// Actualización de la oportunidad
		const { data: result, error: errOp } = await supabase
			.from('oportunidades')
			.update(oportunidad)
			.eq('id', id)
			.select()
			.single();

		if (errOp) {
			console.error('Error actualizando oportunidad:', errOp);
			return fail(500, { error: `Error en oportunidad: ${errOp.message}` });
		}
		console.log('result', result);

		// Insertamos en el Historial
		const { data: historial, error: errorHistorial } = await supabase
			.from('historial')
			.insert([
				{
					id: generateId('BMS-H'),
					id_agente: user?.id,
					tipo_objeto: 'oportunidades',
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
	delete: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}
		const { error } = await supabase.from('oportunidades').delete().eq('id', id);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	}
};
