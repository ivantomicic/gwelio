/*
  # Fix RLS policies for temp match sets

  1. Changes
    - Drop existing RLS policies for temp_match_sets
    - Create new, more permissive policies that allow both players to manage sets
    - Add better policy names and descriptions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their temp match sets" ON public.temp_match_sets;
DROP POLICY IF EXISTS "Users can create temp match sets" ON public.temp_match_sets;
DROP POLICY IF EXISTS "Users can update their temp match sets" ON public.temp_match_sets;

-- Create new policies
CREATE POLICY "Enable read access for match participants"
  ON public.temp_match_sets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.temp_matches tm
      WHERE tm.id = temp_match_id
      AND (tm.player1_id = auth.uid() OR tm.player2_id = auth.uid())
    )
  );

CREATE POLICY "Enable insert access for match participants"
  ON public.temp_match_sets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.temp_matches tm
      WHERE tm.id = temp_match_id
      AND (tm.player1_id = auth.uid() OR tm.player2_id = auth.uid())
    )
  );

CREATE POLICY "Enable update access for match participants"
  ON public.temp_match_sets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.temp_matches tm
      WHERE tm.id = temp_match_id
      AND (tm.player1_id = auth.uid() OR tm.player2_id = auth.uid())
    )
  );

CREATE POLICY "Enable delete access for match participants"
  ON public.temp_match_sets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.temp_matches tm
      WHERE tm.id = temp_match_id
      AND (tm.player1_id = auth.uid() OR tm.player2_id = auth.uid())
    )
  );