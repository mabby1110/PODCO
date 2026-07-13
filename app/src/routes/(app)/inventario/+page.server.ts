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
			.select('id')
			.select()
			.single();
		if (error) {
			return fail(500, { error: error.message });
		}

		// Insertamos en el Historial
		const { data: historial, error: errorHistorial } = await supabase
			.from('historial')
			.insert([
				{
					id: generateId('BMS-H'),
					id_agente: user?.id,
					tipo_objeto: 'oportunidades',
					id_objeto: result.id,
					accion: 'update',
					cambios: objetosAInsertar
				}
			])
			.select()
			.single();
		if (errorHistorial) console.error('Fallo al registrar historial:', errorHistorial);
		console.log('\nhistorial creado:\n', historial);

		// Filtro e Insert en Notificaciones
		const { data: notificacion, error: errorNotif } = await supabase
			.from('notificaciones')
			.insert([
				{
					id: generateId('BMS-N'),
					id_agente: user?.id,
					id_historial: historial.id
				}
			])
			.select()
			.single();
		if (errorNotif) console.error('Fallo al registrar notificación:', errorNotif);
		console.log('\nNotificación creada:\n', notificacion);

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
