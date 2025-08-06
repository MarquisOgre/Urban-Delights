-- Create admin user in user_roles table
-- First, let's check if the admin user exists and create the role
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'admin@artisandelights.com',
  crypt('123456', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create profile for admin
INSERT INTO public.profiles (id, user_id, full_name, email)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Admin User',
  'admin@artisandelights.com'
) ON CONFLICT (user_id) DO NOTHING;

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'admin'::app_role
) ON CONFLICT (user_id, role) DO NOTHING;