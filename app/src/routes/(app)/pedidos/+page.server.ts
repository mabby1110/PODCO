import { generateId } from '$lib/server/google/sheets';
import { construirDatosPedido } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	editarBorrador: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const pedidosAActualizar = JSON.parse((formData.get('pedidosAActualizar') as string) || '[]');
		const pedidosACrear = JSON.parse((formData.get('pedidosACrear') as string) || '[]');

		// RELACIONES
		const idOportunidad = (formData.get('idOportunidad') as string) || null;
		console.log(idOportunidad);

		let resultActualizacion: any[] = [];

		// PEDIDOS A ACTUALIZAR
		if (pedidosAActualizar.length > 0) {
			console.log('pedidos a actualizar: ', pedidosAActualizar);

			const pedidosParaActualizar = pedidosAActualizar.map((pedido: any) => ({
				id: pedido.id,
				cantidad: pedido.cantidad,
				moneda: pedido.moneda,
				precio_unitario: pedido.precio_unitario,
				id_oportunidad: idOportunidad,
				estatus: idOportunidad?2:0
			}));

			const updatePromises = pedidosParaActualizar.map(async (pedido) => {
				const { id, ...camposActualizar } = pedido;

				const { data, error } = await supabase
					.from('pedidos')
					.update(camposActualizar)
					.eq('id', id)
					.select()
					.single();

				if (error) {
					throw new Error(error.message);
				}

				return data;
			});

			try {
				resultActualizacion = await Promise.all(updatePromises);
			} catch (error: any) {
				return fail(500, { error: error.message });
			}
		}

		// PEDIDOS A CREAR
		if (pedidosACrear.length > 0) {
			console.log('pedidos a crear: ', pedidosACrear);

			const pedidosParaCrear = pedidosACrear.map((pedido: any) => ({
				id_producto: pedido.producto.id,
				cantidad: pedido.cantidad,
				moneda: pedido.moneda ?? 'USD',
				precio_unitario: pedido.precio_unitario ?? 0,
				id_agrupacion: pedidosAActualizar[0].id_agrupacion,
				id_oportunidad: idOportunidad,
				estatus: idOportunidad?2:0
			}));

			const { data: resultCreacion, error: errorCreacion } = await supabase
				.from('pedidos')
				.insert(pedidosParaCrear)
				.select();

			if (errorCreacion) {
				console.log(errorCreacion);
				return fail(500, { error: errorCreacion.message });
			}
		}

		return {
			success: true
		};
	},
	eliminarRelacion: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const pedidosAActualizar = JSON.parse((formData.get('pedidosAActualizar') as string) || '[]');

		let resultActualizacion: any[] = [];

		// PEDIDOS A ACTUALIZAR
		if (pedidosAActualizar.length > 0) {
			console.log('pedidos a actualizar: ', pedidosAActualizar);

			const pedidosParaActualizar = pedidosAActualizar.map((pedido: any) => ({
				id: pedido.id,
				id_oportunidad: null
			}));

			const updatePromises = pedidosParaActualizar.map(async (pedido) => {
				const { id, ...camposActualizar } = pedido;

				const { data, error } = await supabase
					.from('pedidos')
					.update(camposActualizar)
					.eq('id', id)
					.select()
					.single();

				if (error) {
					throw new Error(error.message);
				}

				return data;
			});

			try {
				resultActualizacion = await Promise.all(updatePromises);
			} catch (error: any) {
				return fail(500, { error: error.message });
			}
		}
		return {
			success: true
		};
	},
	eliminar: async ({ request, locals: { supabase } }) => {
		console.log('\nBorrar Pedido\n');
		const formData = await request.formData();
		const id = formData.get('id_pedido') as string;
		console.log('\n', id);

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}
		const { error } = await supabase.from('pedidos').delete().eq('id', id);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	}
};
