-- Add metadata column to calendar_events table
ALTER TABLE calendar_events
ADD COLUMN metadata JSONB DEFAULT NULL;

