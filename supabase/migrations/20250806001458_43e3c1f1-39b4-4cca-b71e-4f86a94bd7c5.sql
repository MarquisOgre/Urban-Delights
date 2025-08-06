-- Confirm the admin user's email
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    updated_at = NOW()
WHERE email = 'admin@artisandelights.com';

-- Ensure the profile exists for the admin user
INSERT INTO public.profiles (user_id, email, full_name)
SELECT id, email, 'Admin User'
FROM auth.users 
WHERE email = 'admin@artisandelights.com'
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- Ensure the admin role exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users 
WHERE email = 'admin@artisandelights.com'
ON CONFLICT (user_id, role) DO NOTHING;