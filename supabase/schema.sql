-- Supabase schema for the company website.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'admin',
  created_at timestamp with time zone default now()
);

create table if not exists public.posts (
  id bigserial primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  status text not null default 'draft',
  hero_image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone,
  author_id uuid references auth.users(id)
);

create table if not exists public.pages (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  content text,
  hero_title text,
  hero_subtitle text,
  updated_at timestamp with time zone default now()
);

create table if not exists public.contact_messages (
  id bigserial primary key,
  name text,
  email text,
  company text,
  phone text,
  topics text[],
  subject text,
  message text,
  download_path text,
  download_filename text,
  hubspot_contact_id text,
  hubspot_synced_at timestamp with time zone,
  hubspot_error text,
  created_at timestamp with time zone default now()
);

alter table public.contact_messages add column if not exists company text;
alter table public.contact_messages add column if not exists phone text;
alter table public.contact_messages add column if not exists topics text[];
alter table public.contact_messages add column if not exists download_path text;
alter table public.contact_messages add column if not exists download_filename text;
alter table public.contact_messages add column if not exists hubspot_contact_id text;
alter table public.contact_messages add column if not exists hubspot_synced_at timestamp with time zone;
alter table public.contact_messages add column if not exists hubspot_error text;

-- Track updated_at on updates
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at
before update on public.pages
for each row
execute procedure public.set_updated_at();

alter table public.posts enable row level security;
alter table public.pages enable row level security;
alter table public.contact_messages enable row level security;
alter table public.profiles enable row level security;

-- Profiles policies
drop policy if exists "Users can read their profile" on public.profiles;
create policy "Users can read their profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert their profile" on public.profiles;
create policy "Users can insert their profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their profile" on public.profiles;
create policy "Users can update their profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Posts policies
drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
  on public.posts for select
  using (status = 'published');

drop policy if exists "Admins full access to posts" on public.posts;
create policy "Admins full access to posts"
  on public.posts for all
  using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  )
  with check (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Pages policies
drop policy if exists "Public can read pages" on public.pages;
create policy "Public can read pages"
  on public.pages for select
  using (true);

drop policy if exists "Admins full access to pages" on public.pages;
create policy "Admins full access to pages"
  on public.pages for all
  using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  )
  with check (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Contact message policies
drop policy if exists "Admins read contact messages" on public.contact_messages;
create policy "Admins read contact messages"
  on public.contact_messages for select
  using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

-- Seed default pages if they do not exist
insert into public.pages (slug, title, hero_title, hero_subtitle, content)
values
  (
    'home',
    'Home',
    'Business Analysis & Systems Engineering',
    'Delivery with measurable outcomes and executive-ready reporting.',
    '<p>Welcome to your new site. Update this content in the admin area or Supabase.</p>'
  ),
  (
    'services',
    'Services',
    'Delivery that connects strategy to execution',
    'Structured consulting, architecture, and product execution.',
    '<p>List your service lines here. Edit the Services page from the admin panel.</p>'
  ),
  (
    'about',
    'About',
    'We align business strategy with reliable delivery',
    'Leaders in analysis, engineering, and program governance.',
    '<p>Tell your story here. Update the About page in the admin area.</p>'
  ),
  (
    'contact',
    'Contact',
    'Ready to talk about your next milestone?',
    'Send us a note and we will respond quickly with next steps.',
    '<p>Add office locations or contact details here.</p>'
  )
on conflict (slug) do nothing;
