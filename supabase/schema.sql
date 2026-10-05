create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  version integer not null default 0
);

-- RLS włączone bez polityk: dostęp tylko kluczem serwerowym (service_role).
alter table public.app_state enable row level security;
