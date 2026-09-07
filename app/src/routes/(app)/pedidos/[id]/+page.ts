import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const id = params.id;
    const parentData = await parent();
    const pedidos = parentData.pedidos || [];
    const pedidosEncontrados = pedidos.filter((p: any) => p.id_agrupacion === id);

    if (pedidosEncontrados.length === 0) {
        throw error(404, {
            message: 'Agrupación de pedido no encontrada'
        });
    }

    return {
        pedidos: pedidosEncontrados 
    };
};