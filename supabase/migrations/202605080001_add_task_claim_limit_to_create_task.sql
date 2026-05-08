drop function if exists public.create_task(text, text, text, text[], integer, text, timestamptz, text);

create or replace function public.create_task(
  p_title text,
  p_description text,
  p_category text,
  p_proof_requirements text[],
  p_reward_amount integer,
  p_reward_currency text,
  p_deadline_at timestamptz,
  p_status text,
  p_claim_limit integer default 1
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.current_taskverified_user_id();
  v_profile public.profiles%rowtype;
  v_task_id uuid;
begin
  select *
  into v_profile
  from public.profiles
  where user_id = v_user_id;

  if not found or v_profile.role <> 'poster' then
    raise exception 'Only poster accounts can create tasks.';
  end if;

  if coalesce(trim(p_title), '') = '' then
    raise exception 'Task title is required.';
  end if;

  if coalesce(trim(p_description), '') = '' then
    raise exception 'Task description is required.';
  end if;

  if p_reward_amount is null or p_reward_amount <= 0 then
    raise exception 'Reward amount must be greater than zero.';
  end if;

  if p_claim_limit is null or p_claim_limit < 1 or p_claim_limit > 50 then
    raise exception 'Worker slots must be a whole number from 1 to 50.';
  end if;

  if p_deadline_at <= timezone('utc', now()) then
    raise exception 'Deadline must be in the future.';
  end if;

  if p_status not in ('draft', 'open') then
    raise exception 'Tasks can only be created as draft or open.';
  end if;

  insert into public.tasks (
    poster_id,
    poster_name,
    title,
    description,
    reward_amount,
    reward_currency,
    proof_requirements,
    claim_limit,
    claim_count,
    deadline_at,
    status,
    category
  )
  values (
    v_user_id,
    coalesce(v_profile.full_name, v_profile.email, 'Poster'),
    trim(p_title),
    trim(p_description),
    p_reward_amount,
    p_reward_currency,
    coalesce(p_proof_requirements, '{}'),
    p_claim_limit,
    0,
    p_deadline_at,
    p_status,
    p_category
  )
  returning id into v_task_id;

  return v_task_id;
end;
$$;

grant execute on function public.create_task(text, text, text, text[], integer, text, timestamptz, text, integer) to authenticated;

create or replace function public.claim_task(p_task_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.current_taskverified_user_id();
  v_profile public.profiles%rowtype;
  v_task public.tasks%rowtype;
  v_claim_id uuid;
begin
  select *
  into v_profile
  from public.profiles
  where user_id = v_user_id;

  if not found or v_profile.role <> 'worker' then
    raise exception 'Only worker accounts can claim tasks.';
  end if;

  if v_profile.verification_status <> 'verified' then
    raise exception 'Worker verification must be completed before claiming tasks.';
  end if;

  select *
  into v_task
  from public.tasks
  where id = p_task_id
  for update;

  if not found then
    raise exception 'Task not found.';
  end if;

  if v_task.claim_count >= v_task.claim_limit then
    raise exception 'This task has already reached its claim limit.';
  end if;

  if v_task.status not in ('open', 'claimed') then
    raise exception 'This task no longer accepts new claims.';
  end if;

  if v_task.deadline_at <= timezone('utc', now()) then
    raise exception 'This task is past its deadline.';
  end if;

  if exists (
    select 1
    from public.task_claims
    where task_id = p_task_id
      and worker_id = v_user_id
  ) then
    raise exception 'You have already claimed this task.';
  end if;

  insert into public.task_claims (
    task_id,
    worker_id,
    worker_name,
    status
  )
  values (
    p_task_id,
    v_user_id,
    coalesce(v_profile.full_name, v_profile.email, 'Worker'),
    'active'
  )
  returning id into v_claim_id;

  update public.tasks
  set claim_count = claim_count + 1,
      status = case
        when claim_count + 1 >= claim_limit then 'claimed'
        else 'open'
      end
  where id = p_task_id;

  return v_claim_id;
end;
$$;

grant execute on function public.claim_task(uuid) to authenticated;
