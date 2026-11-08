// lameyer.net · Edge Function «eliminar-cuenta» (/cuenta/ → «Eliminar mi cuenta»).
// The browser cannot delete an auth user (that needs the secret key), so this function does it for the caller only:
//   auth: 'user'  → a valid Supabase JWT is required; ctx.userClaims.id is the caller, never a value from the body.
//   supabaseAdmin → secret key injected by the platform (never in the site). profiles is removed by ON DELETE CASCADE.
// Deployed by the Supabase GitHub integration from supabase/functions/. Call:
//   POST https://kcxjeinzwcpgfuolxadt.supabase.co/functions/v1/eliminar-cuenta
//   Authorization: Bearer <access token> · apikey: <publishable key> · body {"confirmar":"ELIMINAR"}
import { fromSupabaseUrl, withSupabase } from 'npm:@supabase/server@1'

const ORIGIN = 'https://lameyer.net'

export default {
  fetch: withSupabase(
    {
      auth: 'user',
      issuer: fromSupabaseUrl(Deno.env.get('SUPABASE_URL')!), // only tokens issued by this project
      cors: {
        'Access-Control-Allow-Origin': ORIGIN,
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        Vary: 'Origin',
      },
      errors: { detailed: false },
    },
    async (req, ctx) => {
      if (req.method !== 'POST') {
        return Response.json({ error: 'Método no permitido' }, { status: 405 })
      }
      const body = await req.json().catch(() => ({}))
      if (body?.confirmar !== 'ELIMINAR') {
        return Response.json({ error: 'Falta la confirmación' }, { status: 400 })
      }

      const userId = ctx.userClaims!.id
      const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId)
      if (error) {
        console.error('eliminar-cuenta', userId, error.message) // id only: no email, no token in logs
        return Response.json({ error: 'No se pudo eliminar la cuenta' }, { status: 500 })
      }
      return Response.json({ eliminada: true })
    },
  ),
}
