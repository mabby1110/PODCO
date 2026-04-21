import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

import { getActividades, getClientes, getOportunidades } from '$lib/server/google/cachedQueries';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { getAllProfilesAdmin } from '$lib/utils/supabase';

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

	if (profile?.isAdmin) {
		agentes = (await getAllProfilesAdmin(supabaseAdmin)).filter((a) => !a.isOper);
		oportunidades = oportunidades.sort(
			(a: any, b: any) =>
				new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
		);

		actividades = actividades.sort(
			(a: any, b: any) =>
				new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
		);
	} else if (profile?.isOper) {
		agentes = (await getAllProfilesAdmin(supabaseAdmin)).filter((a) => !a.isOper);
		oportunidades = oportunidades
			?.filter((a: any) => a.id_agente === profile?.id)
			.sort(
				(a: any, b: any) =>
					new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
			);
	} else {
		clientes =
			clientes?.filter((c: { id_agente: string | undefined }) => c.id_agente === profile?.id) ?? [];
		oportunidades = oportunidades
			?.filter((a: any) => a.id_agente === profile?.id)
			.sort(
				(a: any, b: any) =>
					new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
			);

		actividades = actividades
			?.filter((a: any) => a.id_agente === profile?.id)
			.sort(
				(a: any, b: any) =>
					new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
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
