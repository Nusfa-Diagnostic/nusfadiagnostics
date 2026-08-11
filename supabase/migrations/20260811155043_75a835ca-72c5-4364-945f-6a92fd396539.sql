
-- ========== ROLES ==========
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(auth.uid(), 'admin')
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());
create policy "admins read all roles" on public.user_roles for select to authenticated using (public.is_admin());
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ========== SHARED ==========
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ========== PROFILES ==========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  address text,
  city text,
  pincode text,
  gender text,
  date_of_birth date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "admin read profiles" on public.profiles for select to authenticated using (public.is_admin());
create policy "admin manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger profiles_updated_at before update on public.profiles for each row execute function public.update_updated_at_column();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email, new.raw_user_meta_data ->> 'phone')
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ========== CATEGORIES ==========
create table public.test_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.test_categories to anon, authenticated;
grant all on public.test_categories to service_role;
alter table public.test_categories enable row level security;
create policy "public read categories" on public.test_categories for select to anon, authenticated using (is_active = true or public.is_admin());
create policy "admin manage categories" on public.test_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger test_categories_updated_at before update on public.test_categories for each row execute function public.update_updated_at_column();

-- ========== TESTS ==========
create table public.tests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.test_categories(id) on delete set null,
  price numeric(10,2) not null default 0,
  mrp numeric(10,2),
  discount_percent int,
  image_url text,
  short_description text,
  description text,
  why_required text,
  preparation text,
  fasting_required text,
  sample_type text,
  report_time text,
  faqs jsonb not null default '[]'::jsonb,
  related_test_ids uuid[] not null default '{}',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tests_category_idx on public.tests(category_id);
create index tests_featured_idx on public.tests(is_featured) where is_active;
grant select on public.tests to anon, authenticated;
grant all on public.tests to service_role;
alter table public.tests enable row level security;
create policy "public read tests" on public.tests for select to anon, authenticated using (is_active = true or public.is_admin());
create policy "admin manage tests" on public.tests for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger tests_updated_at before update on public.tests for each row execute function public.update_updated_at_column();

-- ========== PACKAGES ==========
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  price numeric(10,2) not null default 0,
  mrp numeric(10,2),
  discount_percent int,
  image_url text,
  short_description text,
  description text,
  includes text[] not null default '{}',
  benefits text[] not null default '{}',
  preparation text,
  report_time text,
  faqs jsonb not null default '[]'::jsonb,
  related_package_ids uuid[] not null default '{}',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.packages to anon, authenticated;
grant all on public.packages to service_role;
alter table public.packages enable row level security;
create policy "public read packages" on public.packages for select to anon, authenticated using (is_active = true or public.is_admin());
create policy "admin manage packages" on public.packages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger packages_updated_at before update on public.packages for each row execute function public.update_updated_at_column();

create table public.package_tests (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  test_id uuid not null references public.tests(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (package_id, test_id)
);
create index package_tests_pkg_idx on public.package_tests(package_id);
grant select on public.package_tests to anon, authenticated;
grant all on public.package_tests to service_role;
alter table public.package_tests enable row level security;
create policy "public read package_tests" on public.package_tests for select to anon, authenticated using (true);
create policy "admin manage package_tests" on public.package_tests for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ========== HERO SLIDES ==========
create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  image_url text,
  cta_text text,
  cta_link text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.hero_slides to anon, authenticated;
grant all on public.hero_slides to service_role;
alter table public.hero_slides enable row level security;
create policy "public read slides" on public.hero_slides for select to anon, authenticated using (is_active = true or public.is_admin());
create policy "admin manage slides" on public.hero_slides for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger hero_slides_updated_at before update on public.hero_slides for each row execute function public.update_updated_at_column();

-- ========== OFFERS ==========
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  discount_text text,
  coupon_code text,
  starts_at date,
  ends_at date,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.offers to anon, authenticated;
grant all on public.offers to service_role;
alter table public.offers enable row level security;
create policy "public read offers" on public.offers for select to anon, authenticated using (is_active = true or public.is_admin());
create policy "admin manage offers" on public.offers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger offers_updated_at before update on public.offers for each row execute function public.update_updated_at_column();

-- ========== TESTIMONIALS ==========
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  rating int not null default 5,
  message text not null,
  avatar_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.testimonials to anon, authenticated;
grant all on public.testimonials to service_role;
alter table public.testimonials enable row level security;
create policy "public read testimonials" on public.testimonials for select to anon, authenticated using (is_active = true or public.is_admin());
create policy "admin manage testimonials" on public.testimonials for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger testimonials_updated_at before update on public.testimonials for each row execute function public.update_updated_at_column();

-- ========== FAQS ==========
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.faqs to anon, authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;
create policy "public read faqs" on public.faqs for select to anon, authenticated using (is_active = true or public.is_admin());
create policy "admin manage faqs" on public.faqs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger faqs_updated_at before update on public.faqs for each row execute function public.update_updated_at_column();

-- ========== SITE SETTINGS ==========
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admin manage settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.update_updated_at_column();

insert into public.site_settings (key, value) values
 ('contact', '{"phones":["7808563842","9065307353"],"home_collection_phone":"7808563842","whatsapp":"917808563842","email":"nusfadiagnostic@gmail.com","address":"Narainapur, Ramnagar, West Champaran, Bihar – 845106","map_embed":"https://www.google.com/maps?q=Ramnagar,+West+Champaran,+Bihar+845106&output=embed"}'::jsonb),
 ('social', '{"facebook":"","instagram":"","youtube":"","twitter":""}'::jsonb),
 ('footer', '{"text":"NUSFA DIAGNOSTIC — Trusted Diagnostics, Closer to You."}'::jsonb),
 ('sections', '{"offers":true,"testimonials":true,"faq":true,"contact":true,"map":true}'::jsonb);

-- ========== BOOKINGS ==========
create type public.booking_status as enum ('new','confirmed','sample_collected','processing','report_ready','completed','cancelled');
create type public.payment_status as enum ('pending','paid','refunded','failed');
create type public.collection_type as enum ('home_collection','lab_visit');

create sequence public.booking_number_seq start 1001;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text not null unique default ('NUS-' || nextval('public.booking_number_seq')::text),
  customer_id uuid not null references auth.users(id) on delete cascade,
  contact_name text,
  contact_phone text,
  collection_type public.collection_type not null default 'home_collection',
  address text,
  city text,
  pincode text,
  scheduled_date date,
  scheduled_time text,
  amount numeric(10,2) not null default 0,
  payment_status public.payment_status not null default 'pending',
  payment_method text,
  status public.booking_status not null default 'new',
  customer_notes text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bookings_customer_idx on public.bookings(customer_id);
create index bookings_status_idx on public.bookings(status);
grant select, insert on public.bookings to authenticated;
grant update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "own bookings select" on public.bookings for select to authenticated using (customer_id = auth.uid());
create policy "own bookings insert" on public.bookings for insert to authenticated with check (customer_id = auth.uid());
create policy "admin all bookings" on public.bookings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger bookings_updated_at before update on public.bookings for each row execute function public.update_updated_at_column();

create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  item_type text not null check (item_type in ('test','package')),
  test_id uuid references public.tests(id) on delete set null,
  package_id uuid references public.packages(id) on delete set null,
  item_name text not null,
  price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
create index booking_items_booking_idx on public.booking_items(booking_id);
grant select, insert on public.booking_items to authenticated;
grant all on public.booking_items to service_role;
alter table public.booking_items enable row level security;
create policy "own booking items select" on public.booking_items for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_id and b.customer_id = auth.uid()));
create policy "own booking items insert" on public.booking_items for insert to authenticated
  with check (exists (select 1 from public.bookings b where b.id = booking_id and b.customer_id = auth.uid()));
create policy "admin booking items" on public.booking_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ========== REPORTS ==========
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete set null,
  title text not null,
  file_path text not null,
  file_size bigint,
  notes text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reports_customer_idx on public.reports(customer_id);
grant select on public.reports to authenticated;
grant all on public.reports to service_role;
alter table public.reports enable row level security;
create policy "own published reports" on public.reports for select to authenticated using (customer_id = auth.uid() and is_published = true);
create policy "admin reports" on public.reports for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger reports_updated_at before update on public.reports for each row execute function public.update_updated_at_column();

-- ========== NOTIFICATIONS ==========
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, is_read);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifications select" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "own notifications update" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin notifications" on public.notifications for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- notify customer on booking status change / report publish
create or replace function public.notify_booking_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, title, body, link)
    values (new.customer_id, 'Booking ' || new.booking_number || ' updated',
            'Status changed to ' || replace(new.status::text, '_', ' '),
            '/account/bookings/' || new.id::text);
  end if;
  return new;
end; $$;
create trigger bookings_notify after update on public.bookings for each row execute function public.notify_booking_status();

create or replace function public.notify_report_published()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_published and (tg_op = 'INSERT' or old.is_published is distinct from new.is_published) then
    insert into public.notifications (user_id, title, body, link)
    values (new.customer_id, 'Your report is ready', new.title, '/account/reports');
  end if;
  return new;
end; $$;
create trigger reports_notify after insert or update on public.reports for each row execute function public.notify_report_published();
