create or replace function public.refresh_payout_record(p_payout_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payout public.payouts%rowtype;
  v_worker_wallet text;
  v_poster_wallet text;
begin
  select *
  into v_payout
  from public.payouts
  where id = p_payout_id;

  if not found then
    return;
  end if;

  if v_payout.status = 'released' then
    return;
  end if;

  select wallet_address
  into v_worker_wallet
  from public.profiles
  where user_id = v_payout.worker_id
    and wallet_connection_status = 'connected';

  select wallet_address
  into v_poster_wallet
  from public.profiles
  where user_id = v_payout.poster_id
    and wallet_connection_status = 'connected';

  v_worker_wallet := coalesce(v_worker_wallet, v_payout.worker_wallet_address);
  v_poster_wallet := coalesce(v_poster_wallet, v_payout.poster_wallet_address);

  update public.payouts
  set worker_wallet_address = v_worker_wallet,
      poster_wallet_address = v_poster_wallet,
      failure_reason = case
        when v_worker_wallet is not null and v_poster_wallet is not null then null
        else failure_reason
      end,
      status = case
        when v_worker_wallet is not null and v_poster_wallet is not null then 'ready_to_release'
        else 'pending'
      end
  where id = p_payout_id;
end;
$$;
