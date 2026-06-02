import { fail, type Actions } from '@sveltejs/kit';
import crypto from 'crypto';
function generateId(prefix = 'BMS') {
	const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const hash = crypto.randomBytes(4).toString('hex');
	return `${prefix}-${date}-${hash}`;
}
export const actions: Actions = {
	add: async ({ request, locals: { supabase, user } }) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData.entries());
		data['id'] = generateId('BMS-ACT');
		console.log('actividad nueva', data);
		if (user?.id) {
			data.id_agente = user.id;
		}

		const { data: result, error } = await supabase
			.from('actividades')
			.insert([data])
			.select('id')
			.single();
		console.log(result, error);
		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true, act: result.id };
	},

	update: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		const data = Object.fromEntries(formData.entries());
		delete data.id;

		const { error } = await supabase
			.from('actividades')
			.update(data)
			.eq('id', id);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	},

	reload: async () => {
		return { success: true };
	},

	delete: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID requerido' });
		}

		const { error } = await supabase
			.from('actividades')
			.delete()
			.eq('id', id);

		if (error) {
			return fail(500, { error: error.message });
		}

		return { success: true };
	}
};