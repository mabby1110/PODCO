import { generateId } from '$lib/server/google/sheets';
import { construirDatosCliente, construirDatosOportunidad } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	add: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		console.log('\nOportunidad nueva\n');

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

		return { success: true, op: result.id };
	},

	update: async ({ request, locals: { supabase } }) => {
		console.log('\nOportunidaddd actualizada\n');
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());
		console.log(data);
		// 1. Validación del ID
		const id = data['id_op'] as string || data['id'] as string;
		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// 2. Construimos los datos limpios (usando el ID existente)
		const oportunidad = construirDatosOportunidad(data, id);
		console.log('oportunidad');
		console.log('oportunidad', oportunidad);
		delete data.id;

		const { error } = await supabase.from('oportunidades').update([oportunidad]).eq('id', id);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	},

	delete: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// NOTA: En tu código original de oportunidades hacías un "Soft Delete"
		// actualizando una columna con la fecha. Aquí lo adapté a un "Hard Delete"
		// para que coincida exactamente con la arquitectura de 'actividades'.
		const { error } = await supabase.from('oportunidades').delete().eq('id', id);

		/* // Si prefieres mantener el Soft Delete (marcar como eliminado en vez de borrar), usa esto:
        const { error } = await supabase
            .from('oportunidades')
            .update({ deleted_at: new Date().toISOString() }) // Ajusta el nombre de tu columna
            .eq('id', id);
        */

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	}
};
