insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from auth.users where lower(email) = 'nusfalabs@gmail.com'
on conflict (user_id, role) do nothing;