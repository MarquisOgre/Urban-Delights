-- Add phone_number column to profiles if it doesn't already exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_number TEXT;