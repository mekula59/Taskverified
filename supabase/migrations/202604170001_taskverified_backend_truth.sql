create extension if not exists pgcrypto;

create table if not exists public.wallet_auth_identities (
  wallet_address text primary key,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  provider text not null default 'phantom' check (provider in ('phantom')),
  created_at timestamptz not null default timezone('utc', now()),
  last_authenticated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.wallet_auth_challenges (
  wallet_address text primary key,
  nonce text not null,
  message text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  role text check (role in ('worker', 'poster')),
  full_name text,
  location text,
  bio text,
  wallet_address text,
  wallet_provider text check (wallet_provider in ('phantom')),
  wallet_connection_status text not null default 'disconnected' check (wallet_connection_status in ('disconnected', 'connected')),
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'pending', 'verified', 'flagged')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.verification_records (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null check (status in ('unverified', 'pending', 'verified', 'flagged')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  notes text not null default '',
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  poster_id uuid not null references auth.users (id) on delete cascade,
  poster_name text not null,
  title text not null,
  description text not null,
  reward_amount integer not null check (reward_amount > 0),
  reward_currency text not null check (reward_currency in ('USD', 'NGN')),
  proof_requirements text[] not null default '{}',
  claim_limit integer not null default 1 check (claim_limit > 0),
  claim_count integer not null default 0 check (claim_count >= 0),
  deadline_at timestamptz not null,
  status text not null check (status in ('draft', 'open', 'claimed', 'submitted', 'approved', 'rejected', 'paid')),
  category text not null check (category in ('testing', 'research', 'community', 'content')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.task_claims (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  worker_id uuid not null references auth.users (id) on delete cascade,
  worker_name text not null,
  status text not null check (status in ('active', 'submitted', 'approved', 'rejected')),
  claimed_at timestamptz not null default timezone('utc', now()),
  submitted_at timestamptz,
  unique (task_id, worker_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null unique references public.task_claims (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  worker_id uuid not null references auth.users (id) on delete cascade,
  proof_text text not null,
  proof_link text,
  proof_file_name text,
  checklist_items jsonb not null default '[]'::jsonb,
  status text not null check (status in ('draft', 'submitted', 'approved', 'rejected')),
  updated_at timestamptz not null default timezone('utc', now()),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_notes text
);

create table if not exists public.submission_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.submissions (id) on delete cascade,
  claim_id uuid not null references public.task_claims (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  poster_id uuid not null references auth.users (id) on delete cascade,
  decision text not null check (decision in ('approved', 'rejected')),
  reviewer_notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  claim_id uuid not null unique references public.task_claims (id) on delete cascade,
  submission_id uuid not null unique references public.submissions (id) on delete cascade,
  worker_id uuid not null references auth.users (id) on delete cascade,
  poster_id uuid not null references auth.users (id) on delete cascade,
  worker_wallet_address text,
  poster_wallet_address text,
  amount integer not null check (amount > 0),
  currency_token text not null check (currency_token in ('USDC', 'SOL')),
  transfer_amount_lamports bigint not null default 0 check (transfer_amount_lamports >= 0),
  status text not null check (status in ('pending', 'ready_to_release', 'released', 'failed')),
  tx_signature text,
  failure_reason text,
  created_at timestamptz not null default timezone('utc', now()),
  released_at timestamptz
);

create table if not exists public.reputation_events (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('verification_completed', 'proof_submitted', 'submission_approved', 'submission_rejected', 'payout_released', 'repeat_completed_work')),
  detail text not null,
  score_delta integer not null,
  created_at timestamptz not null,
  task_id uuid references public.tasks (id) on delete cascade,
  claim_id uuid references public.task_claims (id) on delete cascade,
  submission_id uuid references public.submissions (id) on delete cascade,
  payout_id uuid references public.payouts (id) on delete cascade,
  category text check (category in ('testing', 'research', 'community', 'content'))
);

create table if not exists public.reputation_summaries (
  worker_id uuid primary key references auth.users (id) on delete cascade,
  verification_status text not null check (verification_status in ('unverified', 'pending', 'verified', 'flagged')),
  tasks_completed integer not null default 0,
  proof_submitted integer not null default 0,
  approvals integer not null default 0,
  rejections integer not null default 0,
  approval_rate integer not null default 0,
  payouts_released integer not null default 0,
  trust_score integer not null default 0,
  category_strengths jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default timezone('utc', now()),
  explanation text[] not null default '{}'
);

create index if not exists idx_tasks_poster_id on public.tasks (poster_id);
create index if not exists idx_tasks_status on public.tasks (status);
create index if not exists idx_claims_worker_id on public.task_claims (worker_id);
create index if not exists idx_claims_task_id on public.task_claims (task_id);
create unique index if not exists idx_profiles_wallet_address on public.profiles (wallet_address) where wallet_address is not null;
create index if not exists idx_submissions_worker_id on public.submissions (worker_id);
create index if not exists idx_submissions_task_id on public.submissions (task_id);
create index if not exists idx_payouts_worker_id on public.payouts (worker_id);
create index if not exists idx_payouts_poster_id on public.payouts (poster_id);
create index if not exists idx_reputation_events_worker_id on public.reputation_events (worker_id);

alter table public.wallet_auth_identities enable row level security;
alter table public.wallet_auth_challenges enable row level security;
alter table public.profiles enable row level security;
alter table public.verification_records enable row level security;
alter table public.tasks enable row level security;
alter table public.task_claims enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_reviews enable row level security;
alter table public.payouts enable row level security;
alter table public.reputation_events enable row level security;
alter table public.reputation_summaries enable row level security;

drop policy if exists "authenticated can read profiles" on public.profiles;
create policy "authenticated can read profiles"
on public.profiles for select
to authenticated
using (
  auth.uid() = user_id
  or (
    role = 'worker'
    and exists (
      select 1
      from public.task_claims
      join public.tasks on public.tasks.id = public.task_claims.task_id
      where public.task_claims.worker_id = public.profiles.user_id
        and public.tasks.poster_id = auth.uid()
    )
  )
);

drop policy if exists "authenticated can read wallet identities" on public.wallet_auth_identities;
create policy "authenticated can read wallet identities"
on public.wallet_auth_identities for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can upsert own profile" on public.profiles;
create policy "users can upsert own profile"
on public.profiles for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can read own verification" on public.verification_records;
create policy "users can read own verification"
on public.verification_records for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can upsert own verification" on public.verification_records;
create policy "users can upsert own verification"
on public.verification_records for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "authenticated can read tasks" on public.tasks;
create policy "authenticated can read tasks"
on public.tasks for select
to authenticated
using (
  poster_id = auth.uid()
  or status in ('open', 'claimed', 'submitted')
  or exists (
    select 1
    from public.task_claims
    where public.task_claims.task_id = public.tasks.id
      and public.task_claims.worker_id = auth.uid()
  )
);

drop policy if exists "authenticated can read claims" on public.task_claims;
create policy "authenticated can read claims"
on public.task_claims for select
to authenticated
using (
  worker_id = auth.uid()
  or exists (
    select 1
    from public.tasks
    where public.tasks.id = public.task_claims.task_id
      and public.tasks.poster_id = auth.uid()
  )
);

drop policy if exists "authenticated can read submissions" on public.submissions;
create policy "authenticated can read submissions"
on public.submissions for select
to authenticated
using (
  worker_id = auth.uid()
  or exists (
    select 1
    from public.tasks
    where public.tasks.id = public.submissions.task_id
      and public.tasks.poster_id = auth.uid()
  )
);

drop policy if exists "authenticated can read reviews" on public.submission_reviews;
create policy "authenticated can read reviews"
on public.submission_reviews for select
to authenticated
using (
  poster_id = auth.uid()
  or exists (
    select 1
    from public.task_claims
    where public.task_claims.id = public.submission_reviews.claim_id
      and public.task_claims.worker_id = auth.uid()
  )
);

drop policy if exists "authenticated can read payouts" on public.payouts;
create policy "authenticated can read payouts"
on public.payouts for select
to authenticated
using (worker_id = auth.uid() or poster_id = auth.uid());

drop policy if exists "authenticated can read reputation events" on public.reputation_events;
create policy "authenticated can read reputation events"
on public.reputation_events for select
to authenticated
using (
  worker_id = auth.uid()
  or exists (
    select 1
    from public.task_claims
    join public.tasks on public.tasks.id = public.task_claims.task_id
    where public.task_claims.worker_id = public.reputation_events.worker_id
      and public.tasks.poster_id = auth.uid()
  )
);

drop policy if exists "authenticated can read reputation summaries" on public.reputation_summaries;
create policy "authenticated can read reputation summaries"
on public.reputation_summaries for select
to authenticated
using (
  worker_id = auth.uid()
  or exists (
    select 1
    from public.task_claims
    join public.tasks on public.tasks.id = public.task_claims.task_id
    where public.task_claims.worker_id = public.reputation_summaries.worker_id
      and public.tasks.poster_id = auth.uid()
  )
);

create or replace function public.current_taskverified_user_id()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required.';
  end if;

  return v_user_id;
end;
$$;

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

create or replace function public.compute_devnet_transfer_lamports(p_reward_amount integer)
returns bigint
language sql
immutable
as $$
  select least(greatest((coalesce(p_reward_amount, 0) * 500000)::bigint, 500000::bigint), 20000000::bigint);
$$;

create or replace function public.sync_payouts_for_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payout_id uuid;
begin
  for v_payout_id in
    select id
    from public.payouts
    where (worker_id = p_user_id or poster_id = p_user_id)
      and status in ('pending', 'ready_to_release', 'failed')
  loop
    perform public.refresh_payout_record(v_payout_id);
  end loop;
end;
$$;

create or replace function public.refresh_reputation_for_worker(p_worker_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_verification_status text := 'unverified';
  v_tasks_completed integer := 0;
  v_proof_submitted integer := 0;
  v_approvals integer := 0;
  v_rejections integer := 0;
  v_payouts_released integer := 0;
  v_approval_rate integer := 0;
  v_trust_score integer := 0;
  v_category_strengths jsonb := '[]'::jsonb;
  v_explanation text[] := '{}';
begin
  delete from public.reputation_events where worker_id = p_worker_id;

  select coalesce(status, 'unverified')
  into v_verification_status
  from public.verification_records
  where user_id = p_worker_id;

  if v_verification_status = 'verified' then
    insert into public.reputation_events (
      worker_id,
      type,
      detail,
      score_delta,
      created_at
    )
    values (
      p_worker_id,
      'verification_completed',
      'Verification completed and claim access unlocked.',
      20,
      coalesce((select reviewed_at from public.verification_records where user_id = p_worker_id), timezone('utc', now()))
    );
  end if;

  insert into public.reputation_events (
    worker_id,
    type,
    detail,
    score_delta,
    created_at,
    task_id,
    claim_id,
    submission_id,
    category
  )
  select
    s.worker_id,
    'proof_submitted',
    'Proof submitted for review.',
    5,
    coalesce(s.submitted_at, s.updated_at),
    s.task_id,
    s.claim_id,
    s.id,
    t.category
  from public.submissions s
  join public.tasks t on t.id = s.task_id
  where s.worker_id = p_worker_id
    and s.submitted_at is not null;

  insert into public.reputation_events (
    worker_id,
    type,
    detail,
    score_delta,
    created_at,
    task_id,
    claim_id,
    submission_id,
    category
  )
  select
    s.worker_id,
    'submission_approved',
    'Submission approved by the poster.',
    18,
    coalesce(s.reviewed_at, s.updated_at),
    s.task_id,
    s.claim_id,
    s.id,
    t.category
  from public.submissions s
  join public.tasks t on t.id = s.task_id
  where s.worker_id = p_worker_id
    and s.status = 'approved';

  insert into public.reputation_events (
    worker_id,
    type,
    detail,
    score_delta,
    created_at,
    task_id,
    claim_id,
    submission_id,
    category
  )
  select
    ranked.worker_id,
    'repeat_completed_work',
    'Repeat completed work reinforced delivery consistency.',
    6,
    ranked.reviewed_at,
    ranked.task_id,
    ranked.claim_id,
    ranked.submission_id,
    ranked.category
  from (
    select
      s.worker_id,
      s.task_id,
      s.claim_id,
      s.id as submission_id,
      t.category,
      coalesce(s.reviewed_at, s.updated_at) as reviewed_at,
      row_number() over (partition by s.worker_id order by coalesce(s.reviewed_at, s.updated_at), s.id) as completion_rank
    from public.submissions s
    join public.tasks t on t.id = s.task_id
    where s.worker_id = p_worker_id
      and s.status = 'approved'
  ) ranked
  where ranked.completion_rank > 1;

  insert into public.reputation_events (
    worker_id,
    type,
    detail,
    score_delta,
    created_at,
    task_id,
    claim_id,
    submission_id,
    category
  )
  select
    s.worker_id,
    'submission_rejected',
    'Submission rejected during review.',
    -10,
    coalesce(s.reviewed_at, s.updated_at),
    s.task_id,
    s.claim_id,
    s.id,
    t.category
  from public.submissions s
  join public.tasks t on t.id = s.task_id
  where s.worker_id = p_worker_id
    and s.status = 'rejected';

  insert into public.reputation_events (
    worker_id,
    type,
    detail,
    score_delta,
    created_at,
    task_id,
    claim_id,
    submission_id,
    payout_id,
    category
  )
  select
    p.worker_id,
    'payout_released',
    'Solana payout released after approval.',
    12,
    coalesce(p.released_at, p.created_at),
    p.task_id,
    p.claim_id,
    p.submission_id,
    p.id,
    t.category
  from public.payouts p
  join public.tasks t on t.id = p.task_id
  where p.worker_id = p_worker_id
    and p.status = 'released';

  select count(*) into v_tasks_completed from public.submissions where worker_id = p_worker_id and status = 'approved';
  select count(*) into v_proof_submitted from public.submissions where worker_id = p_worker_id and submitted_at is not null;
  select count(*) into v_approvals from public.submissions where worker_id = p_worker_id and status = 'approved';
  select count(*) into v_rejections from public.submissions where worker_id = p_worker_id and status = 'rejected';
  select count(*) into v_payouts_released from public.payouts where worker_id = p_worker_id and status = 'released';

  if (v_approvals + v_rejections) > 0 then
    v_approval_rate := round((v_approvals::numeric / (v_approvals + v_rejections)::numeric) * 100);
  else
    v_approval_rate := 0;
  end if;

  select coalesce(sum(score_delta), 0)
  into v_trust_score
  from public.reputation_events
  where worker_id = p_worker_id;

  v_trust_score := greatest(0, least(100, v_trust_score));

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'category', category_bucket.category,
        'completedCount', category_bucket.completed_count,
        'approvalRate', category_bucket.approval_rate
      )
      order by category_bucket.completed_count desc, category_bucket.category asc
    ),
    '[]'::jsonb
  )
  into v_category_strengths
  from (
    select
      t.category,
      count(*) filter (where s.status = 'approved') as completed_count,
      case
        when count(*) filter (where s.status in ('approved', 'rejected')) = 0 then 0
        else round(
          (
            count(*) filter (where s.status = 'approved')::numeric /
            count(*) filter (where s.status in ('approved', 'rejected'))::numeric
          ) * 100
        )::integer
      end as approval_rate
    from public.submissions s
    join public.tasks t on t.id = s.task_id
    where s.worker_id = p_worker_id
    group by t.category
    having count(*) filter (where s.status = 'approved') > 0
  ) category_bucket;

  v_explanation := array[
    case when v_verification_status = 'verified' then 'Verified workers start with a stronger trust base.' else 'Verification is still limiting trust growth.' end,
    'Approvals increase trust more than submissions alone.',
    'Rejections reduce trust until stronger proof quality is established.',
    'Released Solana payouts confirm that completed work translated into payment.'
  ];

  insert into public.reputation_summaries (
    worker_id,
    verification_status,
    tasks_completed,
    proof_submitted,
    approvals,
    rejections,
    approval_rate,
    payouts_released,
    trust_score,
    category_strengths,
    updated_at,
    explanation
  )
  values (
    p_worker_id,
    v_verification_status,
    v_tasks_completed,
    v_proof_submitted,
    v_approvals,
    v_rejections,
    v_approval_rate,
    v_payouts_released,
    v_trust_score,
    v_category_strengths,
    timezone('utc', now()),
    v_explanation
  )
  on conflict (worker_id) do update
  set verification_status = excluded.verification_status,
      tasks_completed = excluded.tasks_completed,
      proof_submitted = excluded.proof_submitted,
      approvals = excluded.approvals,
      rejections = excluded.rejections,
      approval_rate = excluded.approval_rate,
      payouts_released = excluded.payouts_released,
      trust_score = excluded.trust_score,
      category_strengths = excluded.category_strengths,
      updated_at = excluded.updated_at,
      explanation = excluded.explanation;
end;
$$;

create or replace function public.handle_verification_reputation_refresh()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set verification_status = new.status,
      updated_at = timezone('utc', now())
  where user_id = new.user_id;

  perform public.refresh_reputation_for_worker(new.user_id);
  return new;
end;
$$;

drop trigger if exists trg_verification_refresh on public.verification_records;
create trigger trg_verification_refresh
after insert or update on public.verification_records
for each row
execute function public.handle_verification_reputation_refresh();

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

create or replace function public.submit_proof(
  p_claim_id uuid,
  p_task_id uuid,
  p_proof_text text,
  p_proof_link text,
  p_proof_file_name text,
  p_checklist_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.current_taskverified_user_id();
  v_claim public.task_claims%rowtype;
  v_task public.tasks%rowtype;
  v_submission_id uuid;
begin
  if coalesce(trim(p_proof_text), '') = '' then
    raise exception 'Proof text is required.';
  end if;

  select *
  into v_claim
  from public.task_claims
  where id = p_claim_id
  for update;

  if not found then
    raise exception 'Claim not found.';
  end if;

  if v_claim.worker_id <> v_user_id then
    raise exception 'You can only submit proof for your own claim.';
  end if;

  if v_claim.task_id <> p_task_id then
    raise exception 'Claim and task do not match.';
  end if;

  if v_claim.status <> 'active' then
    raise exception 'Proof can only be submitted for active claims.';
  end if;

  if exists (select 1 from public.submissions where claim_id = p_claim_id) then
    raise exception 'Proof has already been submitted for this claim.';
  end if;

  select *
  into v_task
  from public.tasks
  where id = p_task_id
  for update;

  if not found then
    raise exception 'Task not found.';
  end if;

  if v_task.deadline_at <= timezone('utc', now()) then
    raise exception 'The task deadline has passed.';
  end if;

  if v_task.status not in ('claimed', 'open') then
    raise exception 'Proof can only be submitted while a task is active.';
  end if;

  insert into public.submissions (
    claim_id,
    task_id,
    worker_id,
    proof_text,
    proof_link,
    proof_file_name,
    checklist_items,
    status,
    submitted_at
  )
  values (
    p_claim_id,
    p_task_id,
    v_user_id,
    trim(p_proof_text),
    nullif(trim(coalesce(p_proof_link, '')), ''),
    nullif(trim(coalesce(p_proof_file_name, '')), ''),
    coalesce(p_checklist_items, '[]'::jsonb),
    'submitted',
    timezone('utc', now())
  )
  returning id into v_submission_id;

  update public.task_claims
  set status = 'submitted',
      submitted_at = timezone('utc', now())
  where id = p_claim_id;

  update public.tasks
  set status = 'submitted'
  where id = p_task_id;

  perform public.refresh_reputation_for_worker(v_user_id);

  return v_submission_id;
end;
$$;

create or replace function public.review_submission(
  p_claim_id uuid,
  p_task_id uuid,
  p_decision text,
  p_reviewer_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.current_taskverified_user_id();
  v_task public.tasks%rowtype;
  v_claim public.task_claims%rowtype;
  v_submission public.submissions%rowtype;
  v_review_id uuid;
  v_payout_id uuid;
begin
  if p_decision not in ('approved', 'rejected') then
    raise exception 'Review decision must be approved or rejected.';
  end if;

  if p_decision = 'rejected' and coalesce(trim(coalesce(p_reviewer_notes, '')), '') = '' then
    raise exception 'Reviewer notes are required when rejecting a submission.';
  end if;

  select *
  into v_task
  from public.tasks
  where id = p_task_id
  for update;

  if not found then
    raise exception 'Task not found.';
  end if;

  if v_task.poster_id <> v_user_id then
    raise exception 'Only the task poster can review this submission.';
  end if;

  select *
  into v_claim
  from public.task_claims
  where id = p_claim_id
  for update;

  if not found or v_claim.task_id <> p_task_id then
    raise exception 'Claim not found for the selected task.';
  end if;

  select *
  into v_submission
  from public.submissions
  where claim_id = p_claim_id
  for update;

  if not found then
    raise exception 'Submission not found.';
  end if;

  if v_submission.status <> 'submitted' then
    raise exception 'Only submitted proof can be reviewed.';
  end if;

  insert into public.submission_reviews (
    submission_id,
    claim_id,
    task_id,
    poster_id,
    decision,
    reviewer_notes
  )
  values (
    v_submission.id,
    p_claim_id,
    p_task_id,
    v_user_id,
    p_decision,
    nullif(trim(coalesce(p_reviewer_notes, '')), '')
  )
  returning id into v_review_id;

  update public.submissions
  set status = p_decision,
      reviewed_at = timezone('utc', now()),
      reviewer_notes = nullif(trim(coalesce(p_reviewer_notes, '')), ''),
      updated_at = timezone('utc', now())
  where id = v_submission.id;

  update public.task_claims
  set status = case when p_decision = 'approved' then 'approved' else 'rejected' end
  where id = p_claim_id;

  update public.tasks
  set status = case when p_decision = 'approved' then 'approved' else 'rejected' end
  where id = p_task_id;

  if p_decision = 'approved' then
    insert into public.payouts (
      task_id,
      claim_id,
      submission_id,
      worker_id,
      poster_id,
      amount,
      currency_token,
      transfer_amount_lamports,
      status
    )
    values (
      p_task_id,
      p_claim_id,
      v_submission.id,
      v_claim.worker_id,
      v_user_id,
      v_task.reward_amount,
      'SOL',
      public.compute_devnet_transfer_lamports(v_task.reward_amount),
      'pending'
    )
    on conflict (claim_id) do update
    set submission_id = excluded.submission_id,
        amount = excluded.amount,
        currency_token = excluded.currency_token,
        transfer_amount_lamports = excluded.transfer_amount_lamports,
        failure_reason = null
    returning id into v_payout_id;

    perform public.refresh_payout_record(v_payout_id);
  end if;

  perform public.refresh_reputation_for_worker(v_claim.worker_id);

  return v_review_id;
end;
$$;

create or replace function public.release_payout(p_payout_id uuid)
returns table (
  payout_id uuid,
  poster_wallet_address text,
  worker_wallet_address text,
  transfer_amount_lamports bigint,
  transfer_amount_sol numeric
)
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
    raise exception 'Only the task poster can release this payout.';
  end if;

  perform public.refresh_payout_record(p_payout_id);

  select *
  into v_payout
  from public.payouts
  where id = p_payout_id
  for update;

  if v_payout.status <> 'ready_to_release' then
    raise exception 'Payout is not ready to release. Connect the required Solana wallets first.';
  end if;

  if v_payout.worker_wallet_address is null or v_payout.poster_wallet_address is null then
    raise exception 'Both poster and worker wallets must be connected before release.';
  end if;

  return query
  select
    v_payout.id,
    v_payout.poster_wallet_address,
    v_payout.worker_wallet_address,
    v_payout.transfer_amount_lamports,
    round((v_payout.transfer_amount_lamports::numeric / 1000000000::numeric), 9);
end;
$$;

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

  update public.payouts
  set status = 'failed',
      failure_reason = left(coalesce(trim(p_failure_reason), 'Payout release failed.'), 500),
      tx_signature = nullif(trim(coalesce(p_tx_signature, '')), ''),
      released_at = null
  where id = p_payout_id;
end;
$$;

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

  update public.profiles
  set full_name = coalesce(nullif(trim(coalesce(p_display_name, '')), ''), full_name),
      wallet_address = trim(p_wallet_address),
      wallet_provider = p_provider,
      wallet_connection_status = 'connected',
      updated_at = timezone('utc', now())
  where user_id = v_user_id;

  perform public.sync_payouts_for_user(v_user_id);

  return trim(p_wallet_address);
end;
$$;

create or replace function public.disconnect_wallet(p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := public.current_taskverified_user_id();
  v_profile public.profiles%rowtype;
begin
  select *
  into v_profile
  from public.profiles
  where user_id = v_user_id;

  if not found then
    raise exception 'Profile not found.';
  end if;

  if v_profile.role <> p_role then
    raise exception 'Wallet role does not match the current profile role.';
  end if;

  update public.profiles
  set wallet_address = null,
      wallet_provider = null,
      wallet_connection_status = 'disconnected',
      updated_at = timezone('utc', now())
  where user_id = v_user_id;

  perform public.sync_payouts_for_user(v_user_id);
end;
$$;

grant execute on function public.create_task(text, text, text, text[], integer, text, timestamptz, text, integer) to authenticated;
grant execute on function public.claim_task(uuid) to authenticated;
grant execute on function public.submit_proof(uuid, uuid, text, text, text, jsonb) to authenticated;
grant execute on function public.review_submission(uuid, uuid, text, text) to authenticated;
grant execute on function public.release_payout(uuid) to authenticated;
grant execute on function public.complete_payout_release(uuid, text) to authenticated;
grant execute on function public.fail_payout_release(uuid, text, text) to authenticated;
grant execute on function public.connect_wallet(text, text, text, text, text) to authenticated;
grant execute on function public.disconnect_wallet(text) to authenticated;
