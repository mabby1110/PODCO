import { redirect } from '@sveltejs/kit'
import type { Actions } from './$types'

export const actions: Actions = {
  default: async ({ locals: { supabase }, cookies }) => {
    console.log('logout ejecutado')
    
    await supabase.auth.signOut()
    
    // Limpiar cookies
    cookies.delete('sb-access-token', { path: '/' })
    cookies.delete('sb-refresh-token', { path: '/' })
    
    const allCookies = cookies.getAll()
    allCookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-')) {
        cookies.delete(cookie.name, { path: '/' })
      }
    })
    
    throw redirect(303, '/auth')
  }
}