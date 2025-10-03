-- Migration: Add action_items JSONB column to calendar_events and migrate existing action items
ALTER TABLE calendar_events ADD COLUMN action_items JSONB DEFAULT '[]';

-- Migrate existing action items from calendar_event_action_items to calendar_events.action_items
DO $$
DECLARE
  event RECORD;
  items JSONB;
BEGIN
  FOR event IN SELECT id FROM calendar_events LOOP
    SELECT COALESCE(jsonb_agg(to_jsonb(a) - 'calendar_event_id' - 'created_at' - 'updated_at'), '[]')
    INTO items
    FROM calendar_event_action_items a
    WHERE a.calendar_event_id = event.id;
    UPDATE calendar_events SET action_items = items WHERE id = event.id;
  END LOOP;
END $$;

-- (Optional) Drop the old action items table after migration is verified
-- DROP TABLE IF EXISTS calendar_event_action_items;

