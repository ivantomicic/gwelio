/*
  # Add unique constraint for temp match sets

  1. Changes
    - Add unique constraint on temp_match_id and set_number
    - This enables upsert operations on temp_match_sets
*/

-- Add unique constraint for upsert operations
ALTER TABLE public.temp_match_sets 
ADD CONSTRAINT temp_match_sets_match_set_unique 
UNIQUE (temp_match_id, set_number);