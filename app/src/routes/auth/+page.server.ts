import { redirect, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { session } }) => {
  if (session) {
    throw redirect(303, '/actividades')
  }
  
  return {}
}

export const actions: Actions = {
  login: async ({ request, locals: { supabase }, cookies }) => {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    
    if (!email || !password) {
      return fail(400, {
        error: 'Email y contraseña son requeridos',
        email
      })
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return fail(400, {
        error: error.message,
        email
      })
    }

    // Las cookies se establecen automáticamente por el cliente de Supabase
    // pero puedes forzar un refresh de la sesión si es necesario
    if (data.session) {
      throw redirect(303, '/actividades')
    }
    
    return fail(500, {
      error: 'Error al iniciar sesión',
      email
    })
  },

  logout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut()
    throw redirect(303, '/auth')
  }
}