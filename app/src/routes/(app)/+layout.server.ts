import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import { getRange } from '$lib/server/googleApi';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { getAllProfilesAdmin } from '$lib/utils/supabase';

export const load: LayoutServerLoad = async ({ depends, url, locals }) => {
	console.log('\nlayout (app)\n');
	
	depends('app:data');
	if (!locals.session) {
		throw redirect(303, '/auth');
	}

	if (url.pathname === '/') {
		throw redirect(307, '/actividades');
	}

	const clientes = await getRange('clientes!A:Z');

	let agentes;
	if (locals.profile?.isAdmin === true) {
		agentes = await getAllProfilesAdmin(supabaseAdmin);
	}
	const actividades = await getRange('oportunidades!A:L');

	return {
		profile: locals.profile,
		clientes,
		agentes,
		actividades
	};
};
