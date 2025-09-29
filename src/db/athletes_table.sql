-- Create athletes table
CREATE TABLE IF NOT EXISTS public.athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    status TEXT NOT NULL DEFAULT 'active',
    position TEXT,
    jersey_number INTEGER,
    height_ft_in TEXT,
    weight_lbs INTEGER,
    college TEXT,
    nfl_team TEXT,
    draft_year INTEGER,
    draft_round TEXT,
    draft_selection TEXT,
    draft_round_projection TEXT,
    hometown TEXT,
    high_school TEXT,
    hs_coach TEXT,
    hs_coach_phone TEXT,
    previous_colleges TEXT[],
    current_grade TEXT,
    speed TEXT,
    hand_size TEXT,
    arm_length TEXT,
    wingspan TEXT,
    bio TEXT,
    achievements TEXT,
    state TEXT,
    country TEXT DEFAULT 'USA',
    email TEXT,
    phone TEXT,
    instagram TEXT,
    twitter TEXT,
    tiktok TEXT,
    image_url TEXT,
    nil_tier TEXT,
    nil_value INTEGER,
    total_contract_value INTEGER,
    mother_name TEXT,
    mother_phone TEXT,
    mother_email TEXT,
    mother_occupation TEXT,
    mother_company TEXT,
    mother_address TEXT,
    father_name TEXT,
    father_phone TEXT,
    father_email TEXT,
    father_occupation TEXT,
    father_company TEXT,
    father_address TEXT,
    same_address_as_mother BOOLEAN DEFAULT FALSE,
    siblings TEXT,
    scouting_reports JSONB,
    nfl_feedback TEXT,
    nfl_value TEXT,
    nfl_value_grade TEXT,
    nfl_contract_years TEXT,
    nfl_contract_value TEXT,
    nfl_contract_aav TEXT,
    agency_interest BOOLEAN DEFAULT FALSE,
    notes TEXT,
    current_team TEXT,
    sport TEXT DEFAULT 'football',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),

    -- Sport-specific fields that can be extended as needed
    stats JSONB,
    metrics JSONB
);

-- Create trigger to update the updated_at field automatically
CREATE OR REPLACE FUNCTION update_athletes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER athletes_updated_at
BEFORE UPDATE ON public.athletes
FOR EACH ROW
EXECUTE PROCEDURE update_athletes_updated_at();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS athletes_org_id_idx ON public.athletes(org_id);
CREATE INDEX IF NOT EXISTS athletes_last_name_idx ON public.athletes(last_name);
CREATE INDEX IF NOT EXISTS athletes_sport_idx ON public.athletes(sport);
CREATE INDEX IF NOT EXISTS athletes_status_idx ON public.athletes(status);

-- Row Level Security (RLS) policies
-- Enable RLS on athletes table
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view/modify athletes in their organization
CREATE POLICY athletes_org_isolation ON public.athletes
    USING (org_id IN (
        SELECT org_id FROM public.org_members 
        WHERE user_id = auth.uid()
    ))
    WITH CHECK (org_id IN (
        SELECT org_id FROM public.org_members 
        WHERE user_id = auth.uid()
    ));

-- Policy: Only allow users with appropriate roles to insert athletes
CREATE POLICY athletes_insert_policy ON public.athletes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.org_members
            WHERE user_id = auth.uid()
            AND org_id = athletes.org_id
            AND role IN ('owner', 'admin', 'agent')
        )
    );

-- Policy: Only allow users with appropriate roles to update athletes
CREATE POLICY athletes_update_policy ON public.athletes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members
            WHERE user_id = auth.uid()
            AND org_id = athletes.org_id
            AND role IN ('owner', 'admin', 'agent')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.org_members
            WHERE user_id = auth.uid()
            AND org_id = athletes.org_id
            AND role IN ('owner', 'admin', 'agent')
        )
    );

-- Policy: Only allow users with appropriate roles to delete athletes
CREATE POLICY athletes_delete_policy ON public.athletes
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members
            WHERE user_id = auth.uid()
            AND org_id = athletes.org_id
            AND role IN ('owner', 'admin')
        )
    );

-- Comment on table and columns for better documentation
COMMENT ON TABLE public.athletes IS 'Athletes represented by agencies';
COMMENT ON COLUMN public.athletes.org_id IS 'Organization (agency) that represents this athlete';
COMMENT ON COLUMN public.athletes.status IS 'Current status of the athlete (active, inactive, retired, etc.)';
COMMENT ON COLUMN public.athletes.stats IS 'JSON field for storing sport-specific statistics';
COMMENT ON COLUMN public.athletes.metrics IS 'JSON field for storing athlete performance metrics';
