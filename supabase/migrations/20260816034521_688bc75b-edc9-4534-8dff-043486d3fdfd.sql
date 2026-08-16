ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS patient_first_name text,
  ADD COLUMN IF NOT EXISTS patient_last_name text,
  ADD COLUMN IF NOT EXISTS patient_age integer,
  ADD COLUMN IF NOT EXISTS patient_gender text,
  ADD COLUMN IF NOT EXISTS referral text,
  ADD COLUMN IF NOT EXISTS contact_email text;