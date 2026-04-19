create table if not exists public.wallet_auth_identities (
  wallet_address text primary key,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  provider text not null default 'phantom' check (provider in ('phantom')),
  created_at timestamptz not null default timezone('utc', now()),
  last_authenticated_at timestamptz not null default timezone('utc', now())
);

alter table public.wallet_auth_identities
  add column if not exists wallet_address text,
  add column if not exists user_id uuid references auth.users (id) on delete cascade,
  add column if not exists provider text default 'phantom',
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists last_authenticated_at timestamptz default timezone('utc', now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'wallet_auth_identities'
      and c.contype in ('p', 'u')
      and pg_get_constraintdef(c.oid) ilike '%(wallet_address)%'
  ) then
    create unique index if not exists idx_wallet_auth_identities_wallet_address
      on public.wallet_auth_identities (wallet_address);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'wallet_auth_identities'
      and c.contype in ('p', 'u')
      and pg_get_constraintdef(c.oid) ilike '%(user_id)%'
  ) then
    create unique index if not exists idx_wallet_auth_identities_user_id
      on public.wallet_auth_identities (user_id);
  end if;
end;
$$;

create table if not exists public.wallet_auth_challenges (
  wallet_address text primary key,
  nonce text not null,
  message text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.wallet_auth_challenges
  add column if not exists wallet_address text,
  add column if not exists nonce text,
  add column if not exists message text,
  add column if not exists expires_at timestamptz,
  add column if not exists created_at timestamptz default timezone('utc', now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'wallet_auth_challenges'
      and c.contype in ('p', 'u')
      and pg_get_constraintdef(c.oid) ilike '%(wallet_address)%'
  ) then
    create unique index if not exists idx_wallet_auth_challenges_wallet_address
      on public.wallet_auth_challenges (wallet_address);
  end if;
end;
$$;
