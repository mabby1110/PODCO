import { getRange } from '$lib/server/google/sheets';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ depends, parent }) => {
    depends('app:data');

    const { profile } = await parent();
    let oportunidades = await getRange('oportunidades!A:Z');
    let actividades = await getRange('actividades!A:Z');
    
    if (!profile?.isAdmin) {
        oportunidades = oportunidades.filter((a: any) => a.id_agente === profile?.id);
        actividades = actividades.filter((a: any) => a.id_agente === profile?.id);
    }
    return { oportunidades, actividades };
};
