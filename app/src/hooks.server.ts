import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const supabaseHandle: Handle = async ({ event, resolve }) => {
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
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	const publicRoutes = ['/auth'];
	const isPublicRoute = publicRoutes.some((route) => event.url.pathname.startsWith(route));

	if (!session && !isPublicRoute && event.url.pathname !== '/') {
		throw redirect(303, '/auth');
	}

	if (session && event.url.pathname === '/auth') {
		throw redirect(303, '/Actividades');
	}

	return resolve(event);
};

const profileLoader: Handle = async ({ event, resolve }) => {
	// Solo cargar profile si hay sesión Y NO estamos en /auth
	if (event.locals.session && !event.url.pathname.startsWith('/auth')) {
		try {
			const { data: profile, error } = await event.locals.supabase
				.from('profiles')
				.select('*')
				.eq('id', event.locals.user.id)
				.single();

			if (error) {
				console.error('❌ Error loading profile:', error);
				event.locals.profile = null;
			} else {
				console.log('✅ Profile loaded:', profile);
				event.locals.profile = profile;
			}
		} catch (err) {
			console.error('❌ Unexpected error loading profile:', err);
			event.locals.profile = null;
		}
	} else {
		event.locals.profile = null;
	}

	return resolve(event);
};

export const handle = sequence(supabaseHandle, authGuard, profileLoader);
