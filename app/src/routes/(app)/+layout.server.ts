import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase/supabaseAdmin';
import { generateId } from '$lib/server/google/sheets';

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

	console.log('perfil:');
	console.log('\nadmin: ', profile?.isAdmin);
	console.log('\noper: ', profile?.isOper);

	let agentes: any[] = [];
	let queryOportunidades = supabase
		.from('oportunidades')
		.select(`*, clientes(*), docs_cotizaciones(*), docs_adjuntos(*), docs_occ(*),  docs_ocp(*)`)
		.order('inicio', { ascending: false });
	let queryActividades = supabase
		.from('actividades')
		.select('*')
		.order('inicio', { ascending: false });
	let queryClientes = supabase.from('clientes').select('*, oportunidades(*)');
	let queryDocumentos = supabase.from('docs_adjuntos').select('*');
	let queryInventario = supabase.from('inventario').select('*');

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

	const [{ data: clientes }, { data: oportunidades }, { data: actividades }, { data: documentos }, { data: inventario }] =
		await Promise.all([queryClientes, queryOportunidades, queryActividades, queryDocumentos, queryInventario]);
	console.log('actividades: ', actividades?.length);
	console.log('oportunidades: ', oportunidades?.length);
	console.log('clientes: ', clientes?.length);
	console.log('documentos: ', documentos?.length);
	console.log('inventario: ', inventario?.length);

	return {
		profile,
		agentes,
		oportunidades: oportunidades || [],
		actividades: actividades || [],
		clientes: clientes || [],
		documentos: documentos || [],
		inventario: inventario || [],
	};
};
