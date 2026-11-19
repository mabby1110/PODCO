import { json, type RequestHandler } from '@sveltejs/kit';
import { getDofUsdRates } from '$lib/server/dof';

export const GET: RequestHandler = async ({ url }) => {
	const desde = url.searchParams.get('desde') ?? undefined;
	const hasta = url.searchParams.get('hasta') ?? undefined;
	const data = await getDofUsdRates(desde, hasta);

	if (!data.valor) {
		return json({ error: 'No se pudo obtener el tipo de cambio DOF' }, { status: 502 });
	}

	return json(data);
};
