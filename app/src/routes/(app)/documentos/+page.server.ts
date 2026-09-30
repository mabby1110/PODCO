import { procesarDocumentos } from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';
import crypto from 'crypto';
function generateId(prefix = 'BMS') {
	const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const hash = crypto.randomBytes(4).toString('hex');
	return `${prefix}-${date}-${hash}`;
}
export const actions: Actions = {
	subirAdjunto: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const tipo = formData.get('tipo') as string;

		try {
			const documentos = await procesarDocumentos(formData);

			if (!documentos || documentos.length === 0) {
				return { success: true, message: 'Sin documentos procesados' };
			}

			const { data: result, error } = await supabase.from(tipo).insert(documentos);

			if (error) {
				return fail(500, { error: error.message });
			}
			console.log(result, error);
			return { success: true };
		} catch (error) {
			console.error('Error en acción subirAdjunto:', error);
			return fail(500, { error: 'Fallo al procesar la subida de documentos' });
		}
	},
	subirCotizacion: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const tipo = formData.get('tipo') as string;
		const pedidosACrear = JSON.parse((formData.get('pedidosACrear') as string) || '[]');
		console.log('Subir cotizacion: \n', pedidosACrear);
		try {
			const documentos = await procesarDocumentos(formData);

			if (!documentos || documentos.length === 0 || pedidosACrear.length === 0) {
				return { success: true, message: 'Sin documentos procesados' };
			}

			const { data: doc_cotizacion, error } = await supabase
				.from(tipo)
				.insert(documentos)
				.select()
				.single();

			if (error) {
				return fail(500, { error: error.message });
			}
			console.log('resultado: ', doc_cotizacion, error);

			let resultActualizacion: any[] = [];

			// PEDIDOS A CREAR
			if (pedidosACrear.length > 0) {
				console.log('pedidos a crear: ', pedidosACrear);
				const id_agrupacion = generateId('BMS-P');

				const pedidosParaCrear = pedidosACrear.map((pedido: any) => ({
					id_producto: pedido.id_producto,
					cantidad: pedido.cantidad,
					moneda: pedido.moneda ?? 'USD',
					precio_unitario: pedido.precio_unitario ?? 0,
					id_oportunidad: pedido.id_oportunidad,
					fase: 3,
					id_agrupacion,
					id_cotizacion: doc_cotizacion.id
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

			return { success: true };
		} catch (error) {
			console.error('Error en acción subirAdjunto:', error);
			return fail(500, { error: 'Fallo al procesar la subida de documentos' });
		}
	},
	subirOcc: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const tipo = formData.get('tipo') as string;
		const pedidosACrear = JSON.parse((formData.get('pedidosACrear') as string) || '[]');
		console.log('Subir cotizacion: \n', pedidosACrear);
		try {
			const documentos = await procesarDocumentos(formData);

			if (!documentos || documentos.length === 0 || pedidosACrear.length === 0) {
				return { success: true, message: 'Sin documentos procesados' };
			}

			const { data: doc_cotizacion, error } = await supabase
				.from(tipo)
				.insert(documentos)
				.select()
				.single();

			if (error) {
				return fail(500, { error: error.message });
			}
			console.log('resultado: ', doc_cotizacion, error);

			let resultActualizacion: any[] = [];

			// PEDIDOS A CREAR
			if (pedidosACrear.length > 0) {
				console.log('pedidos a crear: ', pedidosACrear);
				const id_agrupacion = generateId('BMS-P');

				const pedidosParaCrear = pedidosACrear.map((pedido: any) => ({
					id_producto: pedido.id_producto,
					cantidad: pedido.cantidad,
					moneda: pedido.moneda ?? 'USD',
					precio_unitario: pedido.precio_unitario ?? 0,
					id_oportunidad: pedido.id_oportunidad,
					fase: 3,
					id_agrupacion,
					id_cotizacion: doc_cotizacion.id
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

			return { success: true };
		} catch (error) {
			console.error('Error en acción subirAdjunto:', error);
			return fail(500, { error: 'Fallo al procesar la subida de documentos' });
		}
	}
	// addCotizacion: async ({ request, locals: { supabase } }) => {
	// 	const formData = await request.formData();
	// 	const id_nodo = formData.get('id_nodo') as string;
	// 	console.log('agregar doc cotizacion\n', formData);
	// 	if (!id_nodo) return fail(400, { error: 'id_nodo requerido' });

	// 	const docs = await procesarDocumentos(formData, id_nodo, 'docs_cotizaciones');
	// 	console.log('docs', docs);
	// 	if (!docs || docs.length === 0) return fail(400, { error: 'Documento no procesado' });

	// 	const total = formData.get('totales');

	// 	const documento = {
	// 		...docs[0],
	// 		total: total,
	// 		id_oportunidad: id_nodo
	// 	};

	// 	const { data: result, error } = await supabase
	// 		.from('docs_cotizaciones')
	// 		.insert(documento)
	// 		.select('id')
	// 		.single();

	// 	if (error) return fail(500, { error: error.message });
	// 	if (!result) return fail(500, { error: 'Error al recuperar ID de cotización' });

	// 	return {
	// 		success: true,
	// 		id: result.id
	// 	};
	// },
	// addOcc: async ({ request, locals: { supabase } }) => {
	// 	const formData = await request.formData();
	// 	const id_nodo = formData.get('id_nodo') as string;
	// 	console.log('agregar doc orden de compra cliente (occ)\n', formData);
	// 	if (!id_nodo) return fail(400, { error: 'id_nodo requerido' });

	// 	const docs = await procesarDocumentos(formData, id_nodo, 'docs_occ');
	// 	console.log('docs', docs);
	// 	if (!docs || docs.length === 0) return fail(400, { error: 'Documento no procesado' });

	// 	const total = formData.get('totales');

	// 	const documento = {
	// 		...docs[0],
	// 		total: total,
	// 		id_oportunidad: id_nodo
	// 	};

	// 	const { data: result, error } = await supabase
	// 		.from('docs_occ')
	// 		.insert(documento)
	// 		.select('id')
	// 		.single();

	// 	if (error) return fail(500, { error: error.message });
	// 	if (!result) return fail(500, { error: 'Error al recuperar ID de cotización' });

	// 	return {
	// 		success: true,
	// 		id: result.id
	// 	};
	// },
	// reload: async () => {
	// 	return { success: true };
	// },

	// delete: async ({ request, locals: { supabase } }) => {
	// 	const formData = await request.formData();
	// 	const id = formData.get('id') as string;

	// 	if (!id) {
	// 		return fail(400, { error: 'ID requerido' });
	// 	}

	// 	const { error } = await supabase.from('actividades').delete().eq('id', id);

	// 	if (error) {
	// 		return fail(500, { error: error.message });
	// 	}

	// 	return { success: true };
	// }
};
