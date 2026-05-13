import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

import { getActividades, getClientes, getOportunidades } from '$lib/server/google/cachedQueries';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { getAllProfilesAdmin } from '$lib/utils/supabase';
import { ordenarDatos } from '$lib/utils/filtro';

export const load: LayoutServerLoad = async ({ depends, url, locals }) => {
	console.log('Cargando Layout Data (Root)');
	depends('app:data');

	if (!locals.session) {
		throw redirect(303, '/auth');
	}

	if (url.pathname === '/') {
		throw redirect(307, '/clientes');
	}

	let [profileResponse, clientes, oportunidades, actividades] = await Promise.all([
		locals.supabase.from('profiles').select('*').eq('id', locals.user?.id).single(),
		getClientes(),
		getOportunidades(),
		getActividades()
	]);

	const profile = profileResponse.data;
	let agentes = [];

	const filtrosOrden = [{ action: 'desc', column: { key: 'inicio' } }];

	if (profile?.isAdmin) {
		agentes = (await getAllProfilesAdmin(supabaseAdmin)).filter((a) => !a.isOper);

		oportunidades = ordenarDatos(oportunidades ?? [], filtrosOrden);
		actividades = ordenarDatos(actividades ?? [], filtrosOrden);
	} else if (profile?.isOper) {
		agentes = (await getAllProfilesAdmin(supabaseAdmin)).filter((a) => !a.isOper);

		oportunidades = ordenarDatos(
			oportunidades?.filter((a: any) => a.fase >= 3) ?? [],
			filtrosOrden
		);

		actividades = ordenarDatos(
			actividades?.filter((a: any) => a.id_agente === profile?.id) ?? [],
			filtrosOrden
		);
	} else {
		clientes = clientes?.filter((c: any) => c.id_agente === profile?.id) ?? [];

		oportunidades = ordenarDatos(
			oportunidades?.filter((a: any) => a.id_agente === profile?.id) ?? [],
			filtrosOrden
		);

		actividades = ordenarDatos(
			actividades?.filter((a: any) => a.id_agente === profile?.id) ?? [],
			filtrosOrden
		);
	}
	return {
		profile,
		clientes: clientes ?? [],
		agentes,
		oportunidades,
		actividades
	};
};
