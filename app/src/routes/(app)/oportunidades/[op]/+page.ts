// src/routes/oportunidades/[op]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const opId = params.op;
    const parentData = await parent();
    const oportunidades = parentData.oportunidades || []; 
    const opEncontrada = oportunidades.find((o: any) => o.id === opId);
    
    if (!opEncontrada) {
        throw error(404, {
            message: 'Oportunidad no encontrada'
        });
    }

    return {
        oportunidad: opEncontrada 
    };
};