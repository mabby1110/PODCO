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
	addCotizacion: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id_nodo = formData.get('id_nodo') as string;
		console.log('agregar doc cotizacion\n', formData);
		if (!id_nodo) return fail(400, { error: 'id_nodo requerido' });

		const docs = await procesarDocumentos(formData, id_nodo, 'docs_cotizaciones');
		console.log('docs', docs);
		if (!docs || docs.length === 0) return fail(400, { error: 'Documento no procesado' });

		const total = formData.get('totales');

		const documento = {
			...docs[0],
			total: total,
			id_oportunidad: id_nodo
		};

		const { data: result, error } = await supabase
			.from('docs_cotizaciones')
			.insert(documento)
			.select('id')
			.single();

		if (error) return fail(500, { error: error.message });
		if (!result) return fail(500, { error: 'Error al recuperar ID de cotización' });

		return {
			success: true,
			id: result.id
		};
	},
	addOcc: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id_nodo = formData.get('id_nodo') as string;
		console.log('agregar doc orden de compra cliente (occ)\n', formData);
		if (!id_nodo) return fail(400, { error: 'id_nodo requerido' });

		const docs = await procesarDocumentos(formData, id_nodo, 'docs_occ');
		console.log('docs', docs);
		if (!docs || docs.length === 0) return fail(400, { error: 'Documento no procesado' });

		const total = formData.get('totales');

		const documento = {
			...docs[0],
			total: total,
			id_oportunidad: id_nodo
		};

		const { data: result, error } = await supabase
			.from('docs_occ')
			.insert(documento)
			.select('id')
			.single();

		if (error) return fail(500, { error: error.message });
		if (!result) return fail(500, { error: 'Error al recuperar ID de cotización' });

		return {
			success: true,
			id: result.id
		};
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
