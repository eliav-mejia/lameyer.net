#!/usr/bin/env node
// Checks a Supabase access token (JWT) the same way the Edge Functions do, with @supabase/server.
//   node tools/verificar-token.mjs <access_token>
// Get a token: log in on the site → DevTools console →
//   JSON.parse(localStorage['sb-kcxjeinzwcpgfuolxadt-auth-token']).access_token
// Reads SUPABASE_URL and SUPABASE_JWKS_URL from .env.local (ignored by Git). Prints claims, never the token itself.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { verifyCredentials } from '@supabase/server/core';
import { fromSupabaseUrl } from '@supabase/server';

const envFile = fileURLToPath(new URL('../.env.local', import.meta.url));
try {
    for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^([A-Z_]+)=(.*)$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
} catch { console.error('Missing .env.local (copy .env.example).'); process.exit(1); }

const token = process.argv[2];
if (!token) { console.error('usage: node tools/verificar-token.mjs <access_token>'); process.exit(1); }

const { data, error } = await verifyCredentials(
    { token, apikey: null },
    { auth: 'user', issuer: fromSupabaseUrl(process.env.SUPABASE_URL) },
);
if (error) { console.error(`INVALID · ${error.code}: ${error.message}`); process.exit(2); }
const c = data.jwtClaims || {};
console.log('VALID');
console.log({ user: data.userClaims?.id, email: data.userClaims?.email, role: c.role, aal: c.aal,
    providers: c.app_metadata?.providers, expires: c.exp ? new Date(c.exp * 1000).toISOString() : null });
