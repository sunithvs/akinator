-- Migration to allow multiple profiles per user
-- Remove the unique constraint on user_id

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_key;

-- If you want to keep some constraint, you could add a composite unique constraint
-- For example, unique combination of user_id and display_name:
-- ALTER TABLE profiles ADD CONSTRAINT profiles_user_display_unique UNIQUE (user_id, display_name);