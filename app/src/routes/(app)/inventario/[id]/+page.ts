// src/routes/oportunidades/[op]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const id = params.id;

    // Obtenemos los datos cargados en /oportunidades
    const parentData = await parent();
    const inventario = parentData.inventario || [];

    const clienteEncontrado = inventario.find((o: any) => o.id === id);

    if (!clienteEncontrado) {
        throw error(404, {
            message: 'Cliente no encontrado'
        });
    }

    return {
        cliente: clienteEncontrado 
    };
};