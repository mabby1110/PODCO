import { fail, type Actions } from '@sveltejs/kit';
import crypto from 'crypto';
function generateId(prefix = 'BMS') {
	const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const hash = crypto.randomBytes(4).toString('hex');
	return `${prefix}-${date}-${hash}`;
}
export const actions: Actions = {
	add: async ({ request, locals: { supabase } }) => {
		console.log('CREANDO DOCUMENTO');
		const formData = await request.formData();
		console.log(formData);
		const entity = formData.get('entity');

		const TABLES = {
			cotizaciones: 'docs_cotizaciones',
			adjuntos: 'adjuntos',
			oc_cliente: 'oc_cliente',
			oc_proveedor: 'oc_proveedor',
			gastos: 'gastos'
		} as const;

		if (typeof entity !== 'string' || !(entity in TABLES)) {
			return fail(400, {
				error: 'Entidad inválida'
			});
		}

		const table = TABLES[entity as keyof typeof TABLES];

		const files = formData.getAll('files') as File[];
		const amounts = formData.getAll('amounts');

		const id_oportunidad = formData.get('id_oportunidad') as string;

		const id_cliente = formData.get('id_cliente') as string;

		const id_agente = formData.get('id_agente') as string;

		if (!id_oportunidad) {
			return fail(400, {
				error: 'id_oportunidad requerido'
			});
		}

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const amount = Number(amounts[i] ?? 0);

			// subir archivo a Storage
			// const archivo_url = ...

			const registro = {
				id_oportunidad,
				id_cliente,
				id_agente,
				total: amount
				// archivo_url
			};

			const { error } = await supabase.from(table).insert(registro);

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
