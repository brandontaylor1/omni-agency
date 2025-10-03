-- Migration: Add calendar_event_action_items table for event action items
CREATE TABLE calendar_event_action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_event_id uuid NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
  description text NOT NULL,
  notes text,
  assignees uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_event_action_items_event_id ON calendar_event_action_items(calendar_event_id);
