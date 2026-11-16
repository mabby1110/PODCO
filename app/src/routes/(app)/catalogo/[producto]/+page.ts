// src/routes/oportunidades/[op]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const id = params.producto;

	const parentData = await parent();
	const lista = parentData.catalogo || [];
	const item = lista.find((i) => i.id == id);

	if (!item) {
		throw error(404, {
			message: 'Producto no encontrado'
		});
	}

	return {
		item
	};
};
