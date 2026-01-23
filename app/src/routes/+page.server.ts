import { redirect } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
	const token = cookies.get('sb-access-token');
	console.log('token');

	if (token) {
		throw redirect(302, '/actividades');
	}

	throw redirect(302, '/auth');
};
