import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import { getRange } from '$lib/server/googleApi';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { getAllProfilesAdmin } from '$lib/utils/supabase';

export const load: LayoutServerLoad = async ({ depends, url, locals }) => {
	depends('app:data');

	// sesión ya cargada en hooks
	if (!locals.session) {
		throw redirect(303, '/auth');
	}

	// redirect raíz → actividades
	if (url.pathname === '/') {
		throw redirect(307, '/actividades');
	}

	console.log('\nlayout (app) data loaded\n');

	// datos comunes
	const clientes = await getRange('clientes!A:B');

	let agentes;
	if (locals.profile?.isAdmin === true) {
		// admin → supabase (service role o RLS mínima)
		agentes = await getAllProfilesAdmin(supabaseAdmin);
	} else {
		// usuario normal → fuente limitada
		agentes = await getRange('agentes!A:B');
	}
	const fases_embudo_ventas = await getRange('fases_embudo_ventas!A:C');
	const actividades = await getRange('oportunidades!A:L');

	return {
		session: locals.session,
		clientes,
		agentes,
		fases_embudo_ventas,
		actividades
	};
};
