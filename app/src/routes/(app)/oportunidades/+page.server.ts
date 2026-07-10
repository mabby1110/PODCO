// page.server.ts
import { generateId } from '$lib/server/google/sheets';
import { construirDatosCliente, construirDatosOportunidad } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	add: async ({ request, locals: { supabase, user } }) => {
		if (!user) return 0;
		console.log('\nOportunidad nueva\n');
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		// 1. ¿Necesitamos crear un cliente nuevo primero?
		if (data['nombre_comercial']) {
			console.log('Creando cliente nuevo enlazado...');

			const clienteData = construirDatosCliente(data);
			console.log(clienteData);
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
		// 2. Crear la oportunidad
		data['id'] = generateId('BMS-OP');

		const oportunidad = construirDatosOportunidad(data);
		console.log(oportunidad);

		const { data: result, error } = await supabase
			.from('oportunidades')
			.insert([oportunidad])
			.select('id')
			.single();

		console.log('Insertando oportunidad:', result, error);

		if (error) {
			return fail(500, { error: error.message });
		}

		// 3. Insertamos en el Historial
		const { data: historialCreado, error: errorHistorial } = await supabase
			.from('historial')
			.insert([
				{
					id_agente: user.id,
					tipo_objeto: 'oportunidad',
					id_objeto: result.id,
					accion: 'add',
					cambios: data
				}
			])
			.select()
			.single();

		if (errorHistorial) {
			console.error('Fallo al registrar historial:', errorHistorial);
			// No detenemos la ejecución porque el cliente ya se creó, pero lo registramos.
		}

		// 4. Filtro e Insert en Notificaciones
		const idDueño = result.id_agente;

		if (idDueño && idDueño !== user.id && historialCreado) {
			const { error: errorNotif } = await supabase.from('notificaciones').insert([
				{
					id_receptor: idDueño,
					id_historial: historialCreado.id
				}
			]);

			if (errorNotif) console.error('Fallo al registrar notificación:', errorNotif);
		}
		return { success: true, op: result.id };
	},
	update: async ({ request, locals: { supabase, user } }) => {
		if (!user) return 0;
		console.log('\nOportunidaddd actualizada\n');

		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		/* PROCESAR OPORTUNIDAD */
		const id = (data['id_op'] as string) || (data['id'] as string);
		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		const oportunidad = construirDatosOportunidad(data, id);
		delete data.id;

		// 2. Actualización de la oportunidad
		const { data: result, error: errOp } = await supabase
			.from('oportunidades')
			.update(oportunidad)
			.eq('id', id)
			.single();
		console.log('oportunidad noti: ', result);
		if (errOp) {
			console.error('Error actualizando oportunidad:', errOp);
			return fail(500, { error: `Error en oportunidad: ${errOp.message}` });
		}

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
