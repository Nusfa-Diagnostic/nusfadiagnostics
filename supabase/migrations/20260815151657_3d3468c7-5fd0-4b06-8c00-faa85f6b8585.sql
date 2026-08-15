create or replace function public.next_customer_code()
returns text
language sql
volatile
set search_path = public
as $$
  select 'ND' || lpad(nextval('public.customer_code_seq')::text, 6, '0')
$$;

select setval('public.customer_code_seq', greatest(100000, (select last_value from public.customer_code_seq)), true);

alter table public.profiles alter column customer_code set default public.next_customer_code();