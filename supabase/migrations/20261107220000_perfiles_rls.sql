-- lameyer.net · 0001 · cuentas: public.profiles + Row Level Security.
-- Deployed by the Supabase GitHub integration when merged into main (preview branch first, via pull request).
-- An applied migration is never edited: fix it with a new one.
-- Pattern: Academy L4 «Social Login & RLS» §05 (Pattern 1) · Etapa 8 0006_identidad_zero_trust.sql.

-- ------------------------------------------------------------------ table
create table public.profiles (
    id          uuid        primary key references auth.users (id) on delete cascade,
    nombre      text        not null default '' check (char_length(nombre) <= 80),
    creado      timestamptz not null default now(),
    actualizado timestamptz not null default now()
);
comment on table public.profiles is 'One row per account. Email lives only in auth.users. Owner reads and renames; nothing else.';

alter table public.profiles enable row level security;

-- Least privilege under RLS: anon gets nothing; authenticated may read and change ONLY the nombre column.
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (nombre) on table public.profiles to authenticated;

create policy "perfil: leer el propio" on public.profiles
    for select to authenticated
    using ( (select auth.uid()) = id );

create policy "perfil: editar el propio" on public.profiles
    for update to authenticated
    using ( (select auth.uid()) = id )
    with check ( (select auth.uid()) = id );
-- No insert / delete policies: the trigger creates the row; deleting the auth user cascades.

-- ------------------------------------------------------------------ triggers
-- New account (email, Google or Microsoft) → its profile. Name from the provider, trimmed to 80 characters.
create function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
    insert into public.profiles (id, nombre)
    values (new.id, left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 80))
    on conflict (id) do nothing;
    return new;
end $$;
revoke execute on function public.crear_perfil() from public, anon, authenticated;

create trigger crear_perfil
    after insert on auth.users
    for each row execute function public.crear_perfil();

create function public.tocar_actualizado()
returns trigger language plpgsql set search_path = '' as $$
begin
    new.actualizado := now();
    return new;
end $$;
revoke execute on function public.tocar_actualizado() from public, anon, authenticated;

create trigger tocar_actualizado
    before update on public.profiles
    for each row execute function public.tocar_actualizado();

-- ------------------------------------------------------------------ accounts that already exist
insert into public.profiles (id, nombre)
select u.id, left(coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''), 80)
from auth.users u
on conflict (id) do nothing;

-- CI / review guard (must return 0 rows):
--   select schemaname, tablename from pg_tables where schemaname = 'public' and not rowsecurity;
