-- Supabase schema for server-side website lead capture.
-- Public clients intentionally receive no direct table policies.

create table if not exists public.contact_messages (
  id bigserial primary key,
  name text,
  email text,
  company text,
  phone text,
  topics text[],
  subject text,
  message text,
  ip_address text,
  download_path text,
  download_filename text,
  hubspot_contact_id text,
  hubspot_synced_at timestamp with time zone,
  hubspot_error text,
  created_at timestamp with time zone default now()
);

alter table public.contact_messages add column if not exists name text;
alter table public.contact_messages add column if not exists email text;
alter table public.contact_messages add column if not exists company text;
alter table public.contact_messages add column if not exists phone text;
alter table public.contact_messages add column if not exists topics text[];
alter table public.contact_messages add column if not exists subject text;
alter table public.contact_messages add column if not exists message text;
alter table public.contact_messages add column if not exists ip_address text;
alter table public.contact_messages add column if not exists download_path text;
alter table public.contact_messages add column if not exists download_filename text;
alter table public.contact_messages add column if not exists hubspot_contact_id text;
alter table public.contact_messages add column if not exists hubspot_synced_at timestamp with time zone;
alter table public.contact_messages add column if not exists hubspot_error text;
alter table public.contact_messages add column if not exists created_at timestamp with time zone default now();

create index if not exists contact_messages_ip_created_at_idx
  on public.contact_messages(ip_address, created_at);

create table if not exists public.intro_call_requests (
  id bigserial primary key,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default now()
);

alter table public.intro_call_requests add column if not exists ip_address text;
alter table public.intro_call_requests add column if not exists user_agent text;
alter table public.intro_call_requests add column if not exists created_at timestamp with time zone default now();

create index if not exists intro_call_requests_ip_created_at_idx
  on public.intro_call_requests(ip_address, created_at);

alter table public.contact_messages enable row level security;
alter table public.intro_call_requests enable row level security;

-- Deliberately remove any legacy anonymous policies. All website writes pass
-- through validated Vercel functions using SUPABASE_SERVICE_ROLE_KEY.
drop policy if exists "Public can insert contact messages" on public.contact_messages;
drop policy if exists "Anonymous users can insert contact messages" on public.contact_messages;
drop policy if exists "Public can insert intro call requests" on public.intro_call_requests;
drop policy if exists "Anonymous users can insert intro call requests" on public.intro_call_requests;
