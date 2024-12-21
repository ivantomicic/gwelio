/*
  # Remove cron dependency and add cleanup trigger

  Changes:
  - Remove cron schedule
  - Add trigger to auto-cleanup expired matches on insert/update
*/

-- Drop the previous cleanup attempt if it exists
DROP FUNCTION IF EXISTS cleanup_expired_temp_matches();

-- Create an updated cleanup function that runs on insert/update
CREATE OR REPLACE FUNCTION cleanup_expired_temp_matches()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clean up expired matches
  DELETE FROM public.temp_matches
  WHERE expires_at < now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to run cleanup on temp_matches changes
CREATE TRIGGER cleanup_expired_matches
  AFTER INSERT OR UPDATE
  ON public.temp_matches
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_expired_temp_matches();