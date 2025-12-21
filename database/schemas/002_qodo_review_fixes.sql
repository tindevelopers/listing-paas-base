-- Migration: QODO Review Fixes
-- Fixes identified issues from code review:
-- 1. Atomic view count increment (prevents race conditions)
-- 2. Unique constraint on stripe_event_id (ensures idempotency)

-- ============================================================================
-- 1. Create atomic increment_view_count function
-- ============================================================================
-- This function atomically increments the view count to avoid race conditions
-- when multiple requests try to increment the count simultaneously.

CREATE OR REPLACE FUNCTION increment_view_count(listing_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE listings
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = listing_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO service_role;

-- ============================================================================
-- 2. Add unique constraint on stripe_webhook_events for idempotency
-- ============================================================================
-- This ensures that duplicate webhook events are properly rejected at the
-- database level, preventing double-processing even with concurrent requests.

-- First, create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint (will fail gracefully if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stripe_webhook_events_stripe_event_id_key'
  ) THEN
    ALTER TABLE stripe_webhook_events
    ADD CONSTRAINT stripe_webhook_events_stripe_event_id_key UNIQUE (stripe_event_id);
  END IF;
END
$$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id 
ON stripe_webhook_events(stripe_event_id);

-- ============================================================================
-- 3. Enable RLS on stripe_webhook_events for security
-- ============================================================================
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service_role can access webhook events (admin only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stripe_webhook_events' 
    AND policyname = 'Service role only'
  ) THEN
    CREATE POLICY "Service role only" ON stripe_webhook_events
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;
