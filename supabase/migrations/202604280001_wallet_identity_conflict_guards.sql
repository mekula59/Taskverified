create or replace function public.connect_wallet(
  p_role text,
  p_display_name text,
  p_wallet_address text,
  p_provider text,
  p_cluster text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.current_taskverified_user_id();
  v_profile public.profiles%rowtype;
  v_wallet_address text := trim(coalesce(p_wallet_address, ''));
  v_conflicting_profile_user_id uuid;
  v_conflicting_identity_user_id uuid;
begin
  if p_role not in ('worker', 'poster') then
    raise exception 'Wallet role must be worker or poster.';
  end if;

  if p_provider <> 'phantom' then
    raise exception 'Only Phantom is supported in this MVP.';
  end if;

  if p_cluster <> 'devnet' then
    raise exception 'Only Solana devnet is supported in this MVP.';
  end if;

  if v_wallet_address = '' then
    raise exception 'Wallet address is required.';
  end if;

  select *
  into v_profile
  from public.profiles
  where user_id = v_user_id;

  if not found then
    raise exception 'Profile setup must be completed before connecting a wallet.';
  end if;

  if v_profile.role <> p_role then
    raise exception 'Wallet role does not match the current profile role.';
  end if;

  select user_id
  into v_conflicting_profile_user_id
  from public.profiles
  where wallet_address = v_wallet_address
    and user_id <> v_user_id
  limit 1;

  if v_conflicting_profile_user_id is not null then
    raise exception 'This wallet is already linked to another TaskVerified profile.';
  end if;

  select user_id
  into v_conflicting_identity_user_id
  from public.wallet_auth_identities
  where wallet_address = v_wallet_address
    and user_id <> v_user_id
  limit 1;

  if v_conflicting_identity_user_id is not null then
    raise exception 'This wallet is already linked to another TaskVerified account.';
  end if;

  update public.profiles
  set full_name = coalesce(nullif(trim(coalesce(p_display_name, '')), ''), full_name),
      wallet_address = v_wallet_address,
      wallet_provider = p_provider,
      wallet_connection_status = 'connected',
      updated_at = timezone('utc', now())
  where user_id = v_user_id;

  perform public.sync_payouts_for_user(v_user_id);

  return v_wallet_address;
end;
$$;

grant execute on function public.connect_wallet(text, text, text, text, text) to authenticated;
