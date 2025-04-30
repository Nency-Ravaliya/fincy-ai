/*
  # Add subscription fields to profiles table

  1. Changes
    - Add message_count column to track usage
    - Add is_subscribed flag
    - Add subscription_id for PayPal reference
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'message_count'
  ) THEN
    ALTER TABLE profiles ADD COLUMN message_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_subscribed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_subscribed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_id text;
  END IF;
END $$;