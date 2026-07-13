import { generateId } from '$lib/server/google/sheets';
import { construirDatosCliente } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	add: async ({ request, locals: { user, supabase } }) => {
		if (!user) return 0;
		console.log('\nCliente nuevo\n');
		// 0. Obtenemos el usuario autenticado que realiza la acción

		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());
		const clienteData = construirDatosCliente(data);

		// 1. Insertamos en Supabase y recuperamos el objeto creado (.select().single())
		const { data: clienteCreado, error: errorCliente } = await supabase
			.from('clientes')
			.insert([clienteData])
			.select()
			.single();

		if (errorCliente) {
			return fail(500, { error: `Error al crear cliente: ${errorCliente.message}` });
		}

		// 2. Insertamos en el Historial
		const { data: historialCreado, error: errorHistorial } = await supabase
			.from('historial')
			.insert([
				{
					id_agente: user.id,
					tipo_objeto: 'cliente',
					id_objeto: clienteCreado.id,
					accion: 'add',
					cambios: clienteData
				}
			])
			.select()
			.single();

		if (errorHistorial) {
			console.error('Fallo al registrar historial:', errorHistorial);
			// No detenemos la ejecución porque el cliente ya se creó, pero lo registramos.
		}

		// 3. Filtro e Insert en Notificaciones
		const idDueño = clienteCreado.id_agente_asignado;

		if (idDueño && idDueño !== user.id && historialCreado) {
			const { error: errorNotif } = await supabase.from('notificaciones').insert([
				{
					id_receptor: idDueño,
					id_historial: historialCreado.id
				}
			]);

			if (errorNotif) console.error('Fallo al registrar notificación:', errorNotif);
		}

		return { success: true };
	},

	update: async ({ request, locals: { supabase } }) => {
		console.log('\nCliente actualizado\n');
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return fail(401, { error: 'No autorizado' });

		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());
		console.log('data: ', data);

		// 1. Actualizamos en Supabase usando .eq() y retornamos la data actualizada
		const id = (data['id_cliente'] as string) || (data['id'] as string);
		if (!id) return fail(400, { error: 'ID requerido' });

		const cliente = construirDatosCliente(data, id);
		const { data: clienteActualizado, error: errorCliente } = await supabase
			.from('clientes')
			.update(cliente)
			.eq('id', id)
			.select()
			.single();

		if (errorCliente) {
			return fail(500, { error: `Error al actualizar cliente: ${errorCliente.message}` });
		}

		// 2. Insertamos en el Historial
		const { data: historialCreado, error: errorHistorial } = await supabase
			.from('historial')
			.insert([
				{
					id: generateId('BMS-H'),
					id_agente: user.id,
					tipo_objeto: 'clientes',
					id_objeto: clienteActualizado.id,
					accion: 'update',
					cambios: data
				}
			])
			.select()
			.single();

		if (errorHistorial) console.error('Fallo al registrar historial:', errorHistorial);

		// 3. Filtro e Insert en Notificaciones
		const idDueño = clienteActualizado.id_agente;

		if (idDueño && idDueño !== user.id && historialCreado) {
			const { error: errorNotif } = await supabase.from('notificaciones').insert([
				{
					id: generateId('BMS-N'),
					id_agente: idDueño,
					id_historial: historialCreado.id
				}
			]);

			if (errorNotif) console.error('Fallo al registrar notificación:', errorNotif);
		}

		return { success: true };
	},

	delete: async ({ request, locals: { supabase } }) => {
		console.log('\nEliminando cliente\n');

		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) return fail(401, { error: 'No autorizado' });

		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) return fail(400, { error: 'ID requerido' });

		// 1. Aplicamos el Soft Delete y retornamos la data
		const { data: clienteEliminado, error: errorCliente } = await supabase
			.from('clientes')
			.update({ fecha_eliminacion: new Date().toISOString() })
			.eq('id', id)
			.select()
			.single();

		if (errorCliente) {
			return fail(500, { error: `Error al eliminar cliente: ${errorCliente.message}` });
		}

		// 2. Insertamos en el Historial
		const { data: historialCreado, error: errorHistorial } = await supabase
			.from('historial')
			.insert([
				{
					id_agente: user.id,
					tipo_objeto: 'cliente',
					id_objeto: clienteEliminado.id,
					accion: 'delete',
					cambios: { fecha_eliminacion: clienteEliminado.fecha_eliminacion }
				}
			])
			.select()
			.single();

		if (errorHistorial) console.error('Fallo al registrar historial:', errorHistorial);

		// 3. Filtro e Insert en Notificaciones
		const idDueño = clienteEliminado.id_agente_asignado;

		if (idDueño && idDueño !== user.id && historialCreado) {
			const { error: errorNotif } = await supabase.from('notificaciones').insert([
				{
					id_receptor: idDueño,
					id_historial: historialCreado.id
				}
			]);

			if (errorNotif) console.error('Fallo al registrar notificación:', errorNotif);
		}

		return { success: true };
	}
};
