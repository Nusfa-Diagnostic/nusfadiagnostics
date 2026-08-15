create sequence if not exists public.customer_code_seq start 1;

alter table public.profiles add column if not exists customer_code text;

create or replace function public.next_customer_code()
returns text
language sql
volatile
set search_path = public
as $$
  select 'NUSFA-C' || lpad(nextval('public.customer_code_seq')::text, 6, '0')
$$;

update public.profiles set customer_code = public.next_customer_code() where customer_code is null;

alter table public.profiles alter column customer_code set default public.next_customer_code();
alter table public.profiles alter column customer_code set not null;

do $$ begin
  alter table public.profiles add constraint profiles_customer_code_key unique (customer_code);
exception when duplicate_table or duplicate_object then null; end $$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
begin
  insert into public.profiles (id, full_name, email, phone, customer_code)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email, new.raw_user_meta_data ->> 'phone', public.next_customer_code())
  on conflict (id) do nothing;
  return new;
end; $function$;

create or replace function public.protect_customer_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.customer_code is distinct from old.customer_code then
    new.customer_code := old.customer_code;
  end if;
  return new;
end; $$;

drop trigger if exists profiles_protect_customer_code on public.profiles;
create trigger profiles_protect_customer_code before update on public.profiles
for each row execute function public.protect_customer_code();