import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

import { getClientes } from '$lib/server/google/cachedQueries';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { getAllProfilesAdmin } from '$lib/utils/supabase';

export const load: LayoutServerLoad = async ({ depends, url, locals }) => {
    console.log('Cargando Layout Data (Root)');
    depends('app:data');

    if (!locals.session) {
        throw redirect(303, '/auth');
    }

    if (url.pathname === '/') {
        throw redirect(307, '/actividades');
    }

    // Cambio de 'const' a 'let' para permitir reasignación
    let [profileResponse, clientes] = await Promise.all([
        locals.supabase.from('profiles').select('*').eq('id', locals.user?.id).single(),
        getClientes()
    ]);

    const profile = profileResponse.data;
    let agentes = [];

    if (profile?.isAdmin) {
        agentes = (await getAllProfilesAdmin(supabaseAdmin)).filter((a) => !a.isAdmin && !a.isOper);
    } else {
        // Filtrado aplicado correctamente a no administradores
        clientes = clientes?.filter((c: { id_agente: string | undefined }) => c.id_agente === profile?.id) ?? [];
    }

    return {
        profile,
        clientes: clientes ?? [],
        agentes
    };
};