-- Update calendar_events table to include new event types and metadata
ALTER TABLE public.calendar_events
  DROP CONSTRAINT calendar_events_type_check,
  ADD CONSTRAINT calendar_events_type_check
    CHECK (type IN ('athlete', 'meeting', 'travel', 'game', 'signing', 'appearance', 'football_camp', 'other')),
  ADD COLUMN IF NOT EXISTS metadata JSONB;

