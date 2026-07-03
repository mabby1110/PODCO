import { construirDatosCliente } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	add: async ({ request, locals: { supabase } }) => {
		console.log('\nCliente nuevo\n');
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		console.log(data);
		
		// 1. Construimos los datos del cliente
		const clienteData = construirDatosCliente(data);

		// 2. Insertamos en Supabase
		const { error } = await supabase.from('clientes').insert([clienteData]);

		if (error) {
			return fail(500, { error: `Error al crear cliente: ${error.message}` });
		}

		// Nota: invalidateCache() ya no es necesario aquí si manejas
		// la recarga de datos nativa de SvelteKit con Supabase.
		return { success: true };
	},

	update: async ({ request, locals: { supabase } }) => {
		console.log('\nCliente actualizado\n');
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		console.log(data);

		// 1. Validación del ID
		const id = (data['id_cliente'] as string) || (data['id'] as string);
		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// 2. Construimos los datos limpios (usando el ID existente)
		const cliente = construirDatosCliente(data, id);
		console.log('cliente', cliente);
		// 3. Actualizamos en Supabase usando .eq()
		const { error } = await supabase.from('clientes').update(cliente).eq('id', id);
		console.log(error);
		if (error) {
			return fail(500, { error: `Error al actualizar cliente: ${error.message}` });
		}

		return { success: true };
	},

	delete: async ({ request, locals: { supabase } }) => {
		console.log('\nEliminando cliente\n');
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		// En tu código anterior hacias un "Soft Delete" (guardar la fecha en la columna L).
		// Asumiendo que creaste una columna "fecha_eliminacion" en tu tabla clientes:
		const { error } = await supabase
			.from('clientes')
			.update({ fecha_eliminacion: new Date().toISOString() })
			.eq('id', id);

		// 💡 Si en lugar de ocultarlo prefieres borrarlo físicamente de la BD (Hard Delete), usa esto:
		// const { error } = await supabase.from('clientes').delete().eq('id', id);

		if (error) {
			return fail(500, { error: `Error al eliminar cliente: ${error.message}` });
		}

		return { success: true };
	}
};
