create or replace function public.protect_customer_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.customer_code is distinct from old.customer_code then
    if old.customer_code ~ '^ND[0-9]{6}$' or new.customer_code !~ '^ND[0-9]{6}$' then
      new.customer_code := old.customer_code;
    end if;
  end if;
  return new;
end; $$;