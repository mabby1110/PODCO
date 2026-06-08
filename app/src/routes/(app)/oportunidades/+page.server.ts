import { construirDatosCliente, construirDatosOportunidad, type Oportunidad } from '$lib';
import { generateId } from '$lib/server/google/sheets';
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
		data['id'] = generateId('BMS-OPP');

		// 👇 3. Limpiar los datos usando lo que importamos de $lib
		const oportunidad = construirDatosOportunidad(data);

		const { data: result, error } = await supabase
			.from('oportunidades')
			.insert([oportunidad]) // Insertamos el objeto limpio
			.select('id')
			.single();

		console.log('Insertando oportunidad:', result, error);
		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true, op: result.id };
	},

	update: async ({ request, locals: { supabase } }) => {
        console.log('\nCliente actualizado\n');
        const formData = await request.formData();
        const data = Object.fromEntries(formData.entries());
		console.log(data);
        // 1. Validación del ID
        const id = data['id_op'] as string;
        if (!id) {
            return fail(400, { error: 'ID requerido' });
        }

        // 2. Construimos los datos limpios (usando el ID existente)
        const clienteData = construirDatosCliente(data, id);
		delete data.id; // Evitamos actualizar la llave primaria

		const { error } = await supabase.from('oportunidades').update(data).eq('id', id);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	},

	reload: async () => {
		// En SvelteKit + Supabase, la invalidación de caché (invalidate('supabase:db'))
		// suele hacerse del lado del cliente en el archivo +layout.ts o +page.svelte.
		// Por lo tanto, el action del servidor solo necesita retornar éxito.
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
