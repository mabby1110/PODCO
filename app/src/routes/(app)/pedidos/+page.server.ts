import { generateId } from '$lib/server/google/sheets';
import { construirDatosPedido } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	addPedido: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const payloadData = JSON.parse(formData.get('payload') as string);

		const grupo = generateId('BMS-GP');
		const objetosAInsertar = payloadData.map((pedido) => {
			pedido.id = generateId('BMS-PD');
			pedido.id_agente = user?.id;
			pedido.id_agrupacion = grupo;
			return construirDatosPedido(pedido);
		});
		console.log(objetosAInsertar);
		const { data: result, error } = await supabase
			.from('pedidos')
			.insert(objetosAInsertar)
			.select();

		if (error) return fail(500, { error: error.message });

		const registrosHistorial = result.map((pedido) => ({
			id: generateId('BMS-H'),
			id_agente: user?.id,
			tipo_objeto: 'pedidos',
			id_objeto: pedido.id,
			accion: 'insert',
			cambios: pedido
		}));

		const { data: historial, error: errorHistorial } = await supabase
			.from('historial')
			.insert(registrosHistorial)
			.select();

		if (errorHistorial) console.error('Fallo al registrar historial:', errorHistorial);

		if (historial) {
			const registrosNotificacion = historial.map((h) => ({
				id: generateId('BMS-N'),
				id_agente: user?.id,
				id_historial: h.id
			}));

			const { error: errorNotif } = await supabase
				.from('notificaciones')
				.insert(registrosNotificacion);

			if (errorNotif) console.error('Fallo al registrar notificación:', errorNotif);
		}

		return {
			success: true,
			op: result.map((r) => r.id)
		};
	},
	updatePedido: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const pedidosAActualizar = JSON.parse((formData.get('pedidosAActualizar') as string) || '[]');
		const pedidosACrear = JSON.parse((formData.get('pedidosACrear') as string) || '[]');
		let resultActualizacion: any[] = [];
		let idAgrupacion: string | null = null;
		let idOportunidad: string | null = null;

		// PEDIDOS A ACTUALIZAR
		console.log('pedidos a actualizar: ', idOportunidad, pedidosAActualizar);
		if (pedidosAActualizar.length > 0) {
			const updatePromises = pedidosAActualizar.map(async (pedido: any) => {
				const { data, error } = await supabase
					.from('pedidos')
					.update({
						...pedido
					})
					.eq('id', pedido.id)
					.select()
					.single();

				console.log(error);
				if (error) throw new Error(error.message);
				return data;
			});

			try {
				resultActualizacion = await Promise.all(updatePromises);
			} catch (error: any) {
				return fail(500, { error: error.message });
			}

			if (resultActualizacion && resultActualizacion.length > 0) {
				idAgrupacion = resultActualizacion[0].id_agrupacion;

				const registrosHistorial = resultActualizacion.map((pedido) => ({
					id: generateId('BMS-H'),
					id_agente: user?.id,
					tipo_objeto: 'pedidos',
					id_objeto: pedido.id,
					accion: 'update',
					cambios: {
						cantidad: pedido.cantidad,
						precio_unitario: pedido.precio_unitario
					}
				}));

				const { data: historial, error: errorHistorial } = await supabase
					.from('historial')
					.insert(registrosHistorial)
					.select();

				if (errorHistorial) console.error('Fallo al registrar historial:', errorHistorial);

				if (historial && historial.length > 0) {
					const registrosNotificacion = historial.map((h) => ({
						id: generateId('BMS-N'),
						id_agente: user?.id,
						id_historial: h.id
					}));

					const { error: errorNotif } = await supabase
						.from('notificaciones')
						.insert(registrosNotificacion);

					if (errorNotif) console.error('Fallo al registrar notificación:', errorNotif);
				}
			}
		}

		// PEDIDOS A CREAR
		console.log('pedidos a crear: ', pedidosACrear);
		if (!idAgrupacion) {
			idAgrupacion = generateId('BMS-GP');
		}
		if (pedidosACrear.length > 0) {
			const registrosACrear = pedidosACrear.map((pedido) => {
				pedido.id = generateId('BMS-PD');
				return construirDatosPedido(pedido);
			});

			const { data: resultCreacion, error: errorCreacion } = await supabase
				.from('pedidos')
				.insert(registrosACrear)
				.select();

			if (errorCreacion) {
				console.log(errorCreacion);
				return fail(500, { error: errorCreacion.message });
			}
			console.log(resultCreacion);
			if (resultCreacion && resultCreacion.length > 0) {
				const registrosHistorialCreacion = resultCreacion.map((pedido) => ({
					id: generateId('BMS-H'),
					id_agente: user?.id,
					tipo_objeto: 'pedidos',
					id_objeto: pedido.id,
					id_oportunidad: pedido.id_oportunidad,
					accion: 'insert',
					cambios: {
						cantidad: pedido.cantidad,
						precio_unitario: pedido.precio_unitario
					}
				}));

				const { error: errorHistorialCreacion } = await supabase
					.from('historial')
					.insert(registrosHistorialCreacion);

				if (errorHistorialCreacion)
					console.error('Fallo al registrar historial de creación:', errorHistorialCreacion);
			}
		}

		return {
			success: true
		};
	},

	deletePedido: async ({ request, locals: { supabase } }) => {
		console.log('\nBorrar Pedido\n');
		const formData = await request.formData();
		const id = formData.get('id') as string;
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
