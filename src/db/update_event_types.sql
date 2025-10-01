-- Drop the existing check constraint
ALTER TABLE calendar_events
DROP CONSTRAINT calendar_events_type_check;

-- Add the new check constraint with additional event types
ALTER TABLE calendar_events
ADD CONSTRAINT calendar_events_type_check
CHECK (type IN ('athlete', 'meeting', 'travel', 'game', 'signing', 'appearance', 'football_camp', 'other'));
