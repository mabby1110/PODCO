import { generateId } from '$lib/server/google/sheets';
import { construirDatosPedido } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	actualizarPedido: async ({ request, locals: { supabase, user } }) => {
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
				fase: idOportunidad ? 2 : 1,
				ref: pedido.ref
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
				fase: idOportunidad ? 2 : 0
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
	nuevo: async ({ request, locals: { supabase, user } }) => {
		console.log('\nnuevo\n');
		const formData = await request.formData();
		const carritoRaw = formData.get('carrito') as string;

		if (!carritoRaw) {
			return fail(400, { error: 'El carrito está vacío' });
		}

		let carrito: Array<{ id: number; cantidad: number }>;

		try {
			carrito = JSON.parse(carritoRaw);
		} catch (e) {
			return fail(400, { error: 'Formato de JSON inválido' });
		}

		// RELACIONES
		const idOportunidad = (formData.get('idOportunidad') as string) || null;

		// Transformación al formato de la tabla
		const id_agrupacion = generateId('BMS-P');
		const payload = carrito.map((item) => ({
			id_producto: item.id,
			cantidad: item.cantidad,
			fase: idOportunidad ? 2 : 1,
			id_agrupacion,
			id_oportunidad: idOportunidad
		}));

		console.log('\ndata a insertar: ', payload);

		const { data: result, error } = await supabase.from('pedidos').insert(payload).select();

		console.log('\nresult: ', result);
		console.log('\nerror: ', error);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true, result };
	},
	descartar: async ({ request, locals: { supabase, user } }) => {
		if (!user) {
			return fail(401, {
				error: 'No autorizado'
			});
		}

		const formData = await request.formData();
		const pedidosRaw = formData.get('pedidosAActualizar');

		if (typeof pedidosRaw !== 'string' || !pedidosRaw.trim()) {
			return fail(400, {
				error: 'No se recibieron pedidos para descartar'
			});
		}

		let pedidosAActualizar: unknown;

		try {
			pedidosAActualizar = JSON.parse(pedidosRaw);
		} catch {
			return fail(400, {
				error: 'Los pedidos enviados no tienen un formato válido'
			});
		}

		if (!Array.isArray(pedidosAActualizar)) {
			return fail(400, {
				error: 'La lista de pedidos no es válida'
			});
		}

		const ids = [
			...new Set(
				pedidosAActualizar
					.map((pedido: any) => pedido?.id)
					.filter((id): id is string => typeof id === 'string' && id.length > 0)
			)
		];

		if (ids.length === 0) {
			return fail(400, {
				error: 'No se recibieron IDs de pedidos válidos'
			});
		}

		console.log('Pedidos a descartar:', ids);

		/*
		 * Actualización masiva.
		 *
		 * En lugar de hacer un UPDATE por cada pedido con Promise.all,
		 * Supabase ejecuta una sola operación sobre todos los IDs.
		 */
		const { data, error } = await supabase
			.from('pedidos')
			.update({
				fase: 0
			})
			.in('id', ids)
			.select('id, fase');

		if (error) {
			console.error('Error al descartar pedidos:', error);

			return fail(500, {
				error: error.message
			});
		}

		/*
		 * Verificamos que Supabase realmente haya actualizado
		 * todos los pedidos solicitados.
		 */
		if (!data || data.length !== ids.length) {
			return fail(409, {
				error:
					'No fue posible descartar todos los pedidos seleccionados. Algunos pedidos no existen o no pueden actualizarse.'
			});
		}

		return {
			success: true,
			actualizados: data
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
				id_oportunidad: null,
				fase: 1
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
