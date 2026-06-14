-- Migration 004: Update founder_profiles.industry to TEXT[]

ALTER TABLE founder_profiles 
ALTER COLUMN industry TYPE TEXT[] 
USING ARRAY[industry];
