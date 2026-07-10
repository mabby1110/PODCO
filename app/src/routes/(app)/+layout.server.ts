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
		.select(`*, profiles(*), clientes(*), docs_cotizaciones(*), docs_adjuntos(*), docs_occ(*),  docs_ocp(*), pedidos(*, inventario(*))`)
		.order('inicio', { ascending: false });
	let queryActividades = supabase
		.from('actividades')
		.select('*')
		.order('inicio', { ascending: false });
	let queryClientes = supabase.from('clientes').select('*, oportunidades(*)');
	let queryDocumentos = supabase.from('docs_adjuntos').select('*');
	let queryInventario = supabase.from('inventario').select('*');
	let queryPedidos = supabase.from('pedidos').select('*, profiles(*), inventario(*)');
	let queryCotizaciones = supabase.from('docs_cotizaciones').select('*, profiles(nombre), oportunidades(motivo), clientes(nombre_comercial)');
	let queryNotificaciones = supabase.from('notificaciones').select('*, profiles(nombre), historial(*)');

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
		queryPedidos = queryPedidos.eq('id_agente', profile.id);
		queryCotizaciones = queryCotizaciones.eq('id_agente', profile.id);
		queryNotificaciones = queryNotificaciones.eq('id_agente', profile.id);
	}

	const [
		{ data: clientes },
		{ data: oportunidades },
		{ data: actividades },
		{ data: documentos },
		{ data: inventario },
		{ data: pedidos },
		{ data: cotizaciones },
		{ data: notificaciones },
	] = await Promise.all([
		queryClientes,
		queryOportunidades,
		queryActividades,
		queryDocumentos,
		queryInventario,
		queryPedidos,
		queryCotizaciones,
		queryNotificaciones,
	]);
	console.log('actividades: ', actividades?.length);
	console.log('oportunidades: ', oportunidades?.length);
	console.log('clientes: ', clientes?.length);
	console.log('documentos: ', documentos?.length);
	console.log('inventario: ', inventario?.length);
	console.log('pedidos: ', pedidos?.length);
	console.log('cotizaciones: ', cotizaciones?.length);
	console.log('notificaciones: ', notificaciones?.length);

	// let ides = []
	// for (let i=0  ; i<=2; i++){
	// 	ides.push(generateId('BMS-OCP'));
	// }
	// console.log(JSON.stringify(ides));
	return {
		profile,
		agentes,
		oportunidades: oportunidades || [],
		actividades: actividades || [],
		clientes: clientes || [],
		documentos: documentos || [],
		inventario: inventario || [],
		pedidos: pedidos || [],
		cotizaciones: cotizaciones || [],
		notificaciones: notificaciones || []
	};
};
