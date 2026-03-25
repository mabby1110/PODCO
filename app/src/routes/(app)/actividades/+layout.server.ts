import { getRange } from "$lib/server/google/sheets";
import type { LayoutServerLoad } from "../$types";

export const load: LayoutServerLoad = async ({ depends }) => {
	depends('app:data');
	const actividades = await getRange('actividades!A:Z');
	return { actividades };
};