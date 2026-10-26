-- Dump Creator: subscription state written by the Lemon Squeezy webhook (S2.12).
-- Run once in the Supabase SQL editor (or `supabase db push`).

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'creator', 'studio')),
  -- Lemon Squeezy status: on_trial | active | paused | past_due | unpaid | cancelled | expired
  status text,
  ls_subscription_id text unique,
  ls_customer_id text,
  variant_id text,
  renews_at timestamptz,
  ends_at timestamptz,
  -- Signed customer portal link from Lemon Squeezy, for "Aboneliği yönet".
  portal_url text,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Users can read their own row; only the service role (webhook) writes.
drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);
