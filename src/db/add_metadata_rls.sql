-- Enable RLS for the metadata column in calendar_events
CREATE POLICY "Users can update metadata in their organization's events"
ON calendar_events
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
);

