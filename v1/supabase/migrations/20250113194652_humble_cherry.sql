/*
  # Create user profiles and financial data tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `monthly_income` (integer)
      - `income_sources` (text[])
      - `expenses` (jsonb)
      - `savings_goal` (integer)
      - `savings_purpose` (text)
      - `has_budget` (boolean)
      - `tracks_expenses` (boolean)
      - `financial_challenges` (text)
      - `has_loans` (boolean)
      - `loan_details` (jsonb)
      - `advice_frequency` (text)
      - `advice_preferences` (text[])
      - `onboarding_completed` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on profiles table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_income integer,
  income_sources text[],
  expenses jsonb,
  savings_goal integer,
  savings_purpose text,
  has_budget boolean,
  tracks_expenses boolean,
  financial_challenges text,
  has_loans boolean,
  loan_details jsonb,
  advice_frequency text,
  advice_preferences text[],
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);