import { construirDatosPedido, procesarDocumentos } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';
import crypto from 'crypto';
function generateId(prefix = 'BMS') {
	const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const hash = crypto.randomBytes(4).toString('hex');
	return `${prefix}-${date}-${hash}`;
}
export const actions: Actions = {
	add: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const entity = formData.get('entity') as string;
		const id_nodo_p = formData.get('id_nodo_p') as string;
		console.log('\nSubir Documentos\n', formData);
		if (!id_nodo_p) {
			return fail(400, { error: 'id_nodo_p requerido' });
		}

		if (entity === 'docs_cotizaciones') {
			const docs = await procesarDocumentos(formData, id_nodo_p, entity);
			const totales = formData.getAll('totales');
			const documentos = docs.map((doc, i) => ({
				...doc,
				total: totales[i],
				id_oportunidad: id_nodo_p
			}));

			// Remover .single() por ser inserción en lote (array)
			const { data: result, error } = await supabase.from(entity).insert(documentos).select();

			if (error) return fail(500, { error: error.message });
			if (!result || result.length === 0)
				return fail(500, { error: 'Error en retorno de datos de cotización' });

			// Extraer ID de la última cotización insertada
			const idUltimaCotizacion = result[result.length - 1].id;

			const pedidosRaw = formData.get('pedidosACrear') as string;
			const pedidosACrear = pedidosRaw ? JSON.parse(pedidosRaw) : [];
		// PEDIDOS A CREAR
		console.log('pedidos a crear: ', pedidosACrear);
		let idAgrupacion = generateId('BMS-GP');
		if (pedidosACrear.length > 0) {
			const registrosACrear = pedidosACrear.map((pedido) => {
				pedido.id = generateId('BMS-PD');
				pedido.id_agrupacion = idAgrupacion;
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

			// if (resultCreacion && resultCreacion.length > 0) {
			// 	const registrosHistorialCreacion = resultCreacion.map((pedido) => ({
			// 		id: generateId('BMS-H'),
			// 		id_agente: user?.id,
			// 		tipo_objeto: 'pedidos',
			// 		id_objeto: pedido.id,
			// 		id_oportunidad: pedido.id_oportunidad,
			// 		accion: 'insert',
			// 		cambios: {
			// 			cantidad: pedido.cantidad,
			// 			precio_unitario: pedido.precio_unitario
			// 		}
			// 	}));

			// 	const { error: errorHistorialCreacion } = await supabase
			// 		.from('historial')
			// 		.insert(registrosHistorialCreacion);

			// 	if (errorHistorialCreacion)
			// 		console.error('Fallo al registrar historial de creación:', errorHistorialCreacion);
			// }
		}
		}

		if (entity == 'docs_occ') {
			let docs = await procesarDocumentos(formData, id_nodo_p, entity);
			const totales = formData.getAll('totales');
			const documentos = docs.map((doc, i) => ({
				...doc,
				total: totales[i],
				id_oportunidad: id_nodo_p
			}));

			const { data: result, error } = await supabase.from(entity).insert(documentos);
			console.log(result, error);
			if (error) {
				return fail(500, {
					error: error.message
				});
			}
		}
		if (entity == 'docs_adjuntos') {
			let docs = await procesarDocumentos(formData, id_nodo_p, entity);
			const documentos = docs.map((doc, i) => ({
				...doc,
				id_oportunidad: id_nodo_p
			}));

			const { data: result, error } = await supabase.from(entity).insert(documentos);
			console.log(result, error);
			if (error) {
				return fail(500, {
					error: error.message
				});
			}
		}

		return { success: true };
	},

	reload: async () => {
		return { success: true };
	},

	delete: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		const { error } = await supabase.from('actividades').delete().eq('id', id);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	}
};
