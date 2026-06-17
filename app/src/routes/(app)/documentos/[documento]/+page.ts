// src/routes/oportunidades/[op]/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    const actId = params.actividad;

    const parentData = await parent();
    const actividades = parentData.actividades || []; 

    const actEncontrada = actividades.find((o: any) => o.id === actId);

    if (!actEncontrada) {
        throw error(404, {
            message: 'Actividad no encontrada'
        });
    }

    return {
        actividad: actEncontrada 
    };
};