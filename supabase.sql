-- Rode no Supabase SQL Editor.

-- Tabela events (opcional)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  pix_value integer not null,
  created_at timestamptz not null default now()
);

-- Status
do $$
begin
  if not exists (select 1 from pg_type where typname = 'number_status') then
    create type public.number_status as enum ('available', 'chosen', 'paid');
  end if;
end $$;

create table if not exists public.numbers (
  event_id uuid not null references public.events(id) on delete cascade,
  number integer not null,
  status public.number_status not null default 'available',
  taken_by_name text,
  taken_by_whatsapp text,
  payment_type text,
  taken_at timestamptz,
  payment_confirmed boolean not null default false,
  confirmed_by text,
  confirmed_at timestamptz,
  proof_note text,
  primary key (event_id, number)
);

-- Função atômica para escolher número (vira 'chosen')
create or replace function public.claim_number(
  p_event_id uuid,
  p_number integer,
  p_name text,
  p_whatsapp text,
  p_payment_type text default 'pix'
)
returns table (ok boolean, message text)
language plpgsql
as $$
begin
  update public.numbers
  set status = 'chosen',
      taken_by_name = p_name,
      taken_by_whatsapp = p_whatsapp,
      payment_type = p_payment_type,
      taken_at = now(),
      payment_confirmed = false,
      confirmed_by = null,
      confirmed_at = null
  where event_id = p_event_id
    and number = p_number
    and status = 'available';

  if found then
    return query select true, 'Número escolhido ✅ Agora envie o comprovante no WhatsApp.';
  else
    return query select false, 'Esse número já foi escolhido.';
  end if;
end;
$$;

-- Seed exemplo (cria evento + números 1..100)
do $$
declare
  v_event_id uuid;
  i int;
begin
  insert into public.events (title, pix_value)
  values ('Chá rifa do bebê Miguel Gabriel', 45)
  returning id into v_event_id;

  for i in 1..100 loop
    insert into public.numbers (event_id, number)
    values (v_event_id, i);
  end loop;
end $$;
