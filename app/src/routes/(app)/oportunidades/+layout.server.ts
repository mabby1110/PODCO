import { getRange } from "$lib/server/google/sheets";
import type { LayoutServerLoad } from "../$types";

export const load: LayoutServerLoad = async ({ depends }) => {
	depends('app:data');
	const oportunidades = await getRange('oportunidades!A:Z');
	return { oportunidades };
};