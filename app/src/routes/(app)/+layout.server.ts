import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase/supabaseAdmin';

export const load: LayoutServerLoad = async ({
	depends,
	url,
	locals: { supabase, session, user }
}) => {
	depends('app:data');

	if (!session || !user) {
		throw redirect(303, '/auth');
	}

	if (url.pathname === '/') {
		throw redirect(307, '/clientes');
	}

	const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

	let agentes: any[] = [];
	let queryOportunidades = supabase
		.from('oportunidades')
		.select(`*, docs_cotizaciones(*), docs_adjuntos(*), docs_occ(*),  docs_ocp(*)`)
		.order('inicio', { ascending: false });
	let queryActividades = supabase
		.from('actividades')
		.select('*')
		.order('inicio', { ascending: false });
	let queryClientes = supabase.from('clientes').select('*');
	let queryDocumentos = supabase.from('docs_adjuntos').select('*');
	console.log('perfil:');
	console.log('\nadmin: ', profile?.isAdmin);
	console.log('\noper: ', profile?.isOper);
	if (profile?.isAdmin) {
		const { data: perfiles } = await supabaseAdmin.from('profiles').select('*').is('isOper', false);
		agentes = perfiles || [];
	} else if (profile?.isOper) {
		const { data: perfiles } = await supabaseAdmin.from('profiles').select('*').is('isOper', false);
		agentes = perfiles || [];
		queryOportunidades = queryOportunidades.gte('fase', 3);
		queryActividades = queryActividades.eq('id_agente', profile.id);
	} else {
		queryOportunidades = queryOportunidades.eq('id_agente', profile.id);
		queryActividades = queryActividades.eq('id_agente', profile.id);
		queryDocumentos = queryDocumentos.eq('id_agente', profile.id);
	}

	const [{ data: clientes }, { data: oportunidades }, { data: actividades }, { data: documentos }] =
		await Promise.all([queryClientes, queryOportunidades, queryActividades, queryDocumentos]);
	console.log('actividades: ', actividades?.length);
	console.log('oportunidades: ', oportunidades?.length);
	console.log('clientes: ', clientes?.length);
	console.log('documentos: ', documentos?.length);

	return {
		profile,
		agentes,
		oportunidades: oportunidades || [],
		actividades: actividades || [],
		clientes: clientes || [],
		documentos: documentos || []
	};
};
