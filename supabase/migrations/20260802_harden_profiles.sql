-- Prevent authenticated users from assigning themselves the admin role.
alter table public.profiles alter column role set default 'user';

drop policy if exists "Users can insert their profile" on public.profiles;
drop policy if exists "Users can update their profile" on public.profiles;

-- Profile provisioning and role changes must be performed through a trusted
-- service-role process or directly by an authorized database administrator.

-- Lead tables intentionally have no anonymous insert policy. The website uses
-- validated server-side functions with the service role for all lead writes.
