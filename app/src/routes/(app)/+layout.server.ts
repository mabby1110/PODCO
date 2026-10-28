
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase/supabaseAdmin';

export const load: LayoutServerLoad = async ({ depends, locals: { supabase, session, user } }) => {
	depends('app:data');

	if (!session || !user) {
		throw redirect(303, '/auth');
	}

	const { data: profile } = await supabase
		.from('agentes')
		.select('*')
		.eq('id', user.id)
		.single();

	console.log('perfil:');
	console.log('\nadmin: ', profile?.isAdmin);
	console.log('oper: ', profile?.isOper);

	const { data, error } = await supabase.from('serializados').select('*');
	console.log(data?.length, error);

	let agentes: any[] = [];

	let queryOportunidades = supabase
		.from('oportunidades')
		.select(`
			*,
			agentes(*),
			clientes(*),
			docs_cotizaciones(*, pedidos(*)),
			docs_adjuntos(*),
			docs_occ(*, pedidos(*)),
			docs_ocp(*),
			pedidos(*, catalogo(*, tipo_producto(*)), docs_cotizaciones(*))
		`)
		.order('inicio', { ascending: false });

	let queryActividades = supabase
		.from('actividades')
		.select('*, agentes(*)')
		.order('inicio', { ascending: false });

	let queryClientes = supabase
		.from('clientes')
		.select('*, agentes(*), oportunidades(*, clientes(nombre_comercial, razon_social))');

	let queryDocumentos = supabase.from('docs_adjuntos').select('*');
	let queryInventario = supabase.from('inventario').select('*, catalogo(*)');

	let queryCatalogo = supabase
		.from('catalogo')
		.select('*, tipo_producto(*), inventario(*), serializados(*)');

	let queryTipoProducto = supabase.from('tipo_producto').select('*');

	let queryPedidos = supabase
		.from('pedidos')
		.select('*, catalogo(*), agentes(*), oportunidades(*, clientes(nombre_comercial, razon_social))');

	let queryCotizaciones = supabase
		.from('docs_cotizaciones')
		.select('*, agentes(nombre), oportunidades(motivo), clientes(nombre_comercial)');

	let queryNotificaciones = supabase
		.from('notificaciones')
		.select('*, agentes(nombre), historial(*)');

	if (profile?.isAdmin) {
		const { data: perfiles } = await supabaseAdmin
			.from('agentes')
			.select('*')
			.is('isOper', false);

		agentes = perfiles || [];
	} else if (profile?.isOper) {
		const { data: perfiles } = await supabaseAdmin
			.from('agentes')
			.select('*')
			.is('isOper', false);

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

	// Cargar todo el catálogo por bloques de 1000 registros
	const cargarCatalogo = async () => {
		const pageSize = 1000;
		let from = 0;
		const resultados: any[] = [];

		while (true) {
			const { data, error } = await supabase
				.from('catalogo')
				.select('*, tipo_producto(*), inventario(*), serializados(*)')
				.order('id', { ascending: true })
				.range(from, from + pageSize - 1);

			if (error) throw error;

			resultados.push(...(data || []));

			if (!data || data.length < pageSize) break;

			from += pageSize;
		}

		return resultados;
	};

	const [
		{ data: clientes },
		{ data: oportunidades },
		{ data: actividades, error: errorOp },
		{ data: documentos },
		{ data: inventario },
		catalogo,
		{ data: tipo_producto },
		{ data: pedidos },
		{ data: cotizaciones },
		{ data: notificaciones }
	] = await Promise.all([
		queryClientes,
		queryOportunidades,
		queryActividades,
		queryDocumentos,
		queryInventario,
		cargarCatalogo(),
		queryTipoProducto,
		queryPedidos,
		queryCotizaciones,
		queryNotificaciones
	]);

	let cartera;

	if (!profile.isAdmin) {
		cartera = clientes?.filter((f) => f.id_agente == profile.id);
	} else {
		cartera = clientes;
	}

	console.log('\nactividades: ', actividades?.length);
	console.log('oportunidades: ', oportunidades?.length);
	console.log('clientes: ', clientes?.length);
	console.log('documentos: ', documentos?.length);
	console.log('inventario: ', inventario?.length);
	console.log('catalogo: ', catalogo?.length);
	console.log('tipo_producto: ', tipo_producto?.length);
	console.log('pedidos: ', pedidos?.length);
	console.log('cotizaciones: ', cotizaciones?.length);
	console.log('notificaciones: ', notificaciones?.length);

	return {
		profile,
		agentes,
		oportunidades: oportunidades || [],
		actividades: actividades || [],
		clientes: clientes || [],
		cartera: cartera || [],
		documentos: documentos || [],
		inventario: inventario || [],
		catalogo: catalogo || [],
		tipo_producto: tipo_producto || [],
		pedidos: pedidos || [],
		cotizaciones: cotizaciones || [],
		notificaciones: notificaciones || []
	};
};
