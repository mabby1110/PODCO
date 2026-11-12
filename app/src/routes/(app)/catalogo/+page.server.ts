import { generateId } from '$lib/server/google/sheets';
import { construirDatosPedido } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	nuevoProducto: async ({ request, locals: { supabase, user } }) => {
		console.log('\nProducto nuevo\n');
		const formData = await request.formData();
		const caracteristicas = JSON.parse(formData.get('caracteristicas') as string);
		const id_tipo_producto = formData.get('id_tipo_producto');
		const codigo = formData.get('codigo');
		const descripcion = formData.get('descripcion');
		const creado_por = formData.get('creado_por');

		const payload = {
			codigo,
			caracteristicas,
			id_tipo_producto,
			creado_por,
			descripcion

		};
		console.log('\ndata: ', payload);

		const { data: result, error } = await supabase
			.from('catalogo')
			.insert([payload])
			.select()
			.single();
		console.log('error:\n', error);
		if (error) return fail(500, { error: error.message });
		return { success: true };
	}
};
