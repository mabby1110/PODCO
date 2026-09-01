import { generateId } from '$lib/server/google/sheets';
import { construirDatosPedido } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	nuevoProducto: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const codigo = formData.get('codigo');
		const caracteristicas = JSON.parse(formData.get('caracteristicas') as string);
		const id_tipo_producto = formData.get('id_tipo_producto');
		
		console.log('\nProducto nuevo\n');
		
		
		const payload = {
			codigo,
			caracteristicas,
			id_tipo_producto
		};
		console.log('\ndata: ', payload);

		const { data: result, error } = await supabase
			.from('catalogo')
			.insert([payload])
			.select()
			.single();

		if (error) return fail(500, { error: error.message });
		return { success: true };
	}
};
