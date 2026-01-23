import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const { session, user } = await locals.safeGetSession()

	console.log('/layout.server.ts:', locals.profile);

	return {
		session,
		user,
		profile: locals.profile
	}
}
