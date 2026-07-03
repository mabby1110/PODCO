// page.server.ts
import { generateId } from '$lib/server/google/sheets';
import {
	construirDatosCliente,
	construirDatosOportunidad,
	construirDatosPedido
} from '$lib/server/supabase/util';
import { fail, type Actions } from '@sveltejs/kit';

export const actions: Actions = {
	add: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());

		console.log('\nPedido nuevo\n');

		// 1. ¿Necesitamos crear un cliente nuevo primero?
		if (data['nombre_comercial']) {
			console.log('Creando cliente nuevo enlazado...');

			const clienteData = construirDatosCliente(data);
			console.log(clienteData);
			const { data: clienteResult, error: clienteError } = await supabase
				.from('clientes')
				.insert([clienteData])
				.select('id')
				.single();

			console.log('\n', clienteError, clienteResult, '\n');
			if (clienteError) {
				return fail(500, { error: `Error al crear cliente: ${clienteError.message}` });
			}

			data['id_cliente'] = clienteResult.id;
			delete data['razon_social'];
		}
		// 2. Crear la oportunidad
		data['id'] = generateId('BMS-OP');

		const oportunidad = construirDatosOportunidad(data);
		console.log(oportunidad);

		const { data: result, error } = await supabase
			.from('oportunidades')
			.insert([oportunidad])
			.select('id')
			.single();

		console.log('Insertando oportunidad:', result, error);
		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true, op: result.id };
	},
	crearPedido: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const payloadData = JSON.parse(formData.get('payload') as string);

		console.log('\nPedido nuevo\n');
		console.log('\ndata: ', payloadData);

		const objetosAInsertar = payloadData.map((pedido) => {
			pedido.id = generateId('BMS-PD');
			pedido.id_agente = user?.id;
			return construirDatosPedido(pedido);
		});
		console.log(objetosAInsertar);
		const { data: result, error } = await supabase
			.from('pedidos')
			.insert(objetosAInsertar)
			.select('id');
		console.log(result, error)
		if (error) {
			return fail(500, { error: error.message });
		}

		return {
			success: true,
			op: result.map((r) => r.id)
		};
	},
	delete: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}
		const { error } = await supabase.from('oportunidades').delete().eq('id', id);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	}
};
