// src/routes/clientes/[cliente]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    // 1. Obtenemos el ID de la URL
    const clientId = params.cliente;

    // 2. Obtenemos los datos cargados en la ruta padre (/clientes)
    const parentData = await parent();
    const clientes = parentData.clientes || []; 

    // 3. Buscamos el cliente en la lista
    const clienteEncontrado = clientes.find((c: any) => c.id === clientId);

    // Si el usuario pone una URL inválida, lanzamos error 404
    if (!clienteEncontrado) {
        throw error(404, {
            message: 'Cliente no encontrado'
        });
    }

    return {
        // Pasamos el cliente encontrado a +page.svelte
        clientData: clienteEncontrado 
    };
};