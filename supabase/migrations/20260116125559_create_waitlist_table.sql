/*
  # Create waitlist table for FlashMenu landing page

  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key) - Unique identifier for each signup
      - `email` (text, unique) - Email address of the prospect
      - `created_at` (timestamptz) - Timestamp when the signup occurred
  
  2. Security
    - Enable RLS on `waitlist` table
    - Add policy for anonymous users to insert their email
    - Add policy for service role to read all waitlist entries
  
  3. Notes
    - Email is unique to prevent duplicate signups
    - Created_at has default value for automatic timestamp
    - Table is optimized for collecting early access requests
*/

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Service role can read waitlist"
  ON waitlist
  FOR SELECT
  TO service_role
  USING (true);