/*
  # Add webhook and temporary match tracking

  1. New Tables
    - `webhooks`
      - `id` (uuid, primary key)
      - `url` (text) - The webhook URL
      - `name` (text) - Display name for the webhook
      - `created_at` (timestamptz)

    - `temp_matches`
      - `id` (uuid, primary key)
      - `player1_id` (uuid) - References users
      - `player2_id` (uuid) - References users
      - `player1_webhook_id` (uuid) - References webhooks
      - `player2_webhook_id` (uuid) - References webhooks
      - `current_set` (integer) - Current set number
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz) - When this temp match should expire

    - `temp_match_sets`
      - `id` (uuid, primary key)
      - `temp_match_id` (uuid) - References temp_matches
      - `set_number` (integer)
      - `player1_score` (integer)
      - `player2_score` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Create webhooks table
CREATE TABLE IF NOT EXISTS public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create temporary matches table
CREATE TABLE IF NOT EXISTS public.temp_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id uuid REFERENCES public.users(id) NOT NULL,
  player2_id uuid REFERENCES public.users(id) NOT NULL,
  player1_webhook_id uuid REFERENCES public.webhooks(id),
  player2_webhook_id uuid REFERENCES public.webhooks(id),
  current_set integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  expires_at timestamptz DEFAULT timezone('utc'::text, now() + interval '24 hours') NOT NULL
);

-- Create temporary match sets table
CREATE TABLE IF NOT EXISTS public.temp_match_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  temp_match_id uuid REFERENCES public.temp_matches(id) ON DELETE CASCADE NOT NULL,
  set_number integer NOT NULL,
  player1_score integer DEFAULT 0 NOT NULL,
  player2_score integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temp_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temp_match_sets ENABLE ROW LEVEL SECURITY;

-- Policies for webhooks
CREATE POLICY "Allow authenticated users to view webhooks"
  ON public.webhooks FOR SELECT
  TO authenticated
  USING (true);

-- Policies for temp_matches
CREATE POLICY "Users can view their temp matches"
  ON public.temp_matches FOR SELECT
  TO authenticated
  USING (
    auth.uid() = player1_id OR 
    auth.uid() = player2_id
  );

CREATE POLICY "Users can create temp matches"
  ON public.temp_matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Players can update their temp matches"
  ON public.temp_matches FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = player1_id OR
    auth.uid() = player2_id
  );

CREATE POLICY "Players can delete their temp matches"
  ON public.temp_matches FOR DELETE
  TO authenticated
  USING (auth.uid() = player1_id);

-- Policies for temp_match_sets
CREATE POLICY "Users can view their temp match sets"
  ON public.temp_match_sets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.temp_matches
      WHERE id = temp_match_id
      AND (player1_id = auth.uid() OR player2_id = auth.uid())
    )
  );

CREATE POLICY "Users can create temp match sets"
  ON public.temp_match_sets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.temp_matches
      WHERE id = temp_match_id
      AND (player1_id = auth.uid() OR player2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their temp match sets"
  ON public.temp_match_sets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.temp_matches
      WHERE id = temp_match_id
      AND (player1_id = auth.uid() OR player2_id = auth.uid())
    )
  );

-- Insert the 6 default webhooks
INSERT INTO public.webhooks (url, name) VALUES
  ('https://hook.eu1.make.com/abc123', 'Webhook 1'),
  ('https://hook.eu1.make.com/def456', 'Webhook 2'),
  ('https://hook.eu1.make.com/ghi789', 'Webhook 3'),
  ('https://hook.eu1.make.com/jkl012', 'Webhook 4'),
  ('https://hook.eu1.make.com/mno345', 'Webhook 5'),
  ('https://hook.eu1.make.com/pqr678', 'Webhook 6')
ON CONFLICT DO NOTHING;

-- Create function to clean up expired temp matches
CREATE OR REPLACE FUNCTION cleanup_expired_temp_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.temp_matches
  WHERE expires_at < now();
END;
$$;

-- Create a scheduled job to clean up expired temp matches (runs every hour)
SELECT cron.schedule(
  'cleanup-expired-temp-matches',
  '0 * * * *', -- Every hour
  'SELECT cleanup_expired_temp_matches();'
);