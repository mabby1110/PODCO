import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const supabaseHandle: Handle = async ({ event, resolve }) => {
	console.log('auth handle', event.url.pathname);
	
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll() {
				return event.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, {
						...options,
						path: '/',
						sameSite: 'lax',
						httpOnly: true,
						secure: process.env.NODE_ENV === 'production'
					})
				);
			}
		}
	});

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) return { session: null, user: null };

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) return { session: null, user: null };

		return { session, user };
	};

	return resolve(event);
};

const authGuard: Handle = async ({ event, resolve }) => {
	console.log('guard handle', event.url.pathname);
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	const publicRoutes = ['/auth'];
	const isPublicRoute = publicRoutes.some((route) => event.url.pathname.startsWith(route));

	if (!session && !isPublicRoute && event.url.pathname !== '/') {
		throw redirect(303, '/auth');
	}

	if (session && event.url.pathname === '/auth') {
		throw redirect(303, '/oportunidades');
	}

	return resolve(event);
};

export const handle = sequence(supabaseHandle, authGuard);