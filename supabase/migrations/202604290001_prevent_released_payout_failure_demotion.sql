create or replace function public.fail_payout_release(
  p_payout_id uuid,
  p_failure_reason text,
  p_tx_signature text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.current_taskverified_user_id();
  v_payout public.payouts%rowtype;
begin
  select *
  into v_payout
  from public.payouts
  where id = p_payout_id
  for update;

  if not found then
    raise exception 'Payout not found.';
  end if;

  if v_payout.poster_id <> v_user_id then
    raise exception 'Only the task poster can mark this payout as failed.';
  end if;

  if v_payout.status = 'released' then
    raise exception 'Released payouts cannot be marked failed.';
  end if;

  update public.payouts
  set status = 'failed',
      failure_reason = left(coalesce(trim(p_failure_reason), 'Payout release failed.'), 500),
      tx_signature = nullif(trim(coalesce(p_tx_signature, '')), ''),
      released_at = null
  where id = p_payout_id;
end;
$$;
