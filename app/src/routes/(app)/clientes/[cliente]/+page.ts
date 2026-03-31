// src/routes/oportunidades/[op]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const clienteId = params.cliente;

    // Obtenemos los datos cargados en /oportunidades
    const parentData = await parent();
    const clientes = parentData.clientes || []; 

    const clienteEncontrado = clientes.find((o: any) => o.id === clienteId);

    if (!clienteEncontrado) {
        throw error(404, {
            message: 'Cliente no encontrado'
        });
    }

    return {
        cliente: clienteEncontrado 
    };
};