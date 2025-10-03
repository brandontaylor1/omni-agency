-- Create communications_log table
CREATE TABLE IF NOT EXISTS communications_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    athlete_name TEXT NOT NULL,
    contacted_by TEXT NOT NULL,
    mode TEXT NOT NULL,
    subject TEXT,
    details TEXT NOT NULL,
    action_items JSONB,
    outcome TEXT,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_history table
CREATE TABLE IF NOT EXISTS medical_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    injury TEXT NOT NULL,
    timetable TEXT,
    rehab TEXT,
    doctors_seen TEXT[],
    status TEXT NOT NULL,
    notes TEXT,
    severity TEXT,
    treatment_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brand_partnerships table
CREATE TABLE IF NOT EXISTS brand_partnerships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    company TEXT NOT NULL,
    details TEXT NOT NULL,
    monetary_value INTEGER,
    inkind_value INTEGER,
    obligations TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE communications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_partnerships ENABLE ROW LEVEL SECURITY;

-- Add policies for communications_log
CREATE POLICY "Users can view communications_log for their organization's athletes" ON communications_log
    FOR SELECT
    USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert communications_log for their organization's athletes" ON communications_log
    FOR INSERT
    WITH CHECK (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update communications_log for their organization's athletes" ON communications_log
    FOR UPDATE
    USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete communications_log for their organization's athletes" ON communications_log
    FOR DELETE
    USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

-- Add policies for medical_history
CREATE POLICY "Users can view medical_history for their organization's athletes" ON medical_history
    FOR SELECT
    USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert medical_history for their organization's athletes" ON medical_history
    FOR INSERT
    WITH CHECK (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update medical_history for their organization's athletes" ON medical_history
    FOR UPDATE
    USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete medical_history for their organization's athletes" ON medical_history
    FOR DELETE
    USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

-- Add policies for brand_partnerships
CREATE POLICY "Users can view brand_partnerships for their organization's athletes" ON brand_partnerships
    FOR SELECT
    USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert brand_partnerships for their organization's athletes" ON brand_partnerships
    FOR INSERT
    WITH CHECK (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update brand_partnerships for their organization's athletes" ON brand_partnerships
    FOR UPDATE
    USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete brand_partnerships for their organization's athletes" ON brand_partnerships
    FOR DELETE
    USING (
        athlete_id IN (
            SELECT a.id FROM athletes a
            JOIN organizations o ON a.organization_id = o.id
            JOIN organization_members om ON o.id = om.organization_id
            WHERE om.user_id = auth.uid()
        )
    );
