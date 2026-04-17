create or replace function public.complete_payout_release(
  p_payout_id uuid,
  p_tx_signature text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.current_taskverified_user_id();
  v_payout public.payouts%rowtype;
begin
  if coalesce(trim(p_tx_signature), '') = '' then
    raise exception 'A real transaction signature is required to complete payout release.';
  end if;

  select *
  into v_payout
  from public.payouts
  where id = p_payout_id
  for update;

  if not found then
    raise exception 'Payout not found.';
  end if;

  if v_payout.poster_id <> v_user_id then
    raise exception 'Only the task poster can finalize this payout.';
  end if;

  if v_payout.status <> 'ready_to_release' then
    raise exception 'Payout is not ready to release.';
  end if;

  if v_payout.worker_wallet_address is null or v_payout.poster_wallet_address is null then
    raise exception 'Both poster and worker wallets must be connected before release.';
  end if;

  update public.payouts
  set status = 'released',
      tx_signature = trim(p_tx_signature),
      failure_reason = null,
      released_at = timezone('utc', now())
  where id = p_payout_id;

  update public.tasks
  set status = 'paid'
  where id = v_payout.task_id;

  perform public.refresh_reputation_for_worker(v_payout.worker_id);

  return trim(p_tx_signature);
end;
$$;

revoke execute on function public.complete_payout_release(uuid, text) from authenticated;
