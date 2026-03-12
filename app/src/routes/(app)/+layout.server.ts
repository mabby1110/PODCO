import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

import { generateId, getRange } from '$lib/server/google/sheets';
import { supabaseAdmin } from '$lib/server/supabaseAdmin';
import { getAllProfilesAdmin } from '$lib/utils/supabase';

export const load: LayoutServerLoad = async ({ depends, url, locals }) => {
	console.log('layout data');
	depends('app:data');

	if (!locals.session) {
		throw redirect(303, '/auth');
	}

	if (url.pathname === '/') {
		throw redirect(307, '/actividades');
	}

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', locals.user?.id)
		.single();

	const [clientes, actividades, oportunidades] = await Promise.all([
		getRange('clientes!A:Z'),
		getRange('actividades!A:Z'),
		getRange('oportunidades!A:Z')
	]);

	let agentes;
	if (profile?.isAdmin === true) {
		agentes = await getAllProfilesAdmin(supabaseAdmin);
	}

	return {
		profile,
		clientes,
		agentes,
		actividades,
		oportunidades
	};
};