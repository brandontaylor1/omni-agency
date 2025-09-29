-- Alter the existing athletes table to add new columns
-- This assumes the athletes table already exists, but needs to be updated
-- with the additional fields

-- First, check if columns exist before adding them
DO $$
BEGIN
    -- Add columns if they don't exist
    -- Personal information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'jersey_number') THEN
        ALTER TABLE public.athletes ADD COLUMN jersey_number INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'height_ft_in') THEN
        ALTER TABLE public.athletes ADD COLUMN height_ft_in TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'weight_lbs') THEN
        ALTER TABLE public.athletes ADD COLUMN weight_lbs INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'college') THEN
        ALTER TABLE public.athletes ADD COLUMN college TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'nfl_team') THEN
        ALTER TABLE public.athletes ADD COLUMN nfl_team TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'speed') THEN
        ALTER TABLE public.athletes ADD COLUMN speed TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'hand_size') THEN
        ALTER TABLE public.athletes ADD COLUMN hand_size TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'arm_length') THEN
        ALTER TABLE public.athletes ADD COLUMN arm_length TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'wingspan') THEN
        ALTER TABLE public.athletes ADD COLUMN wingspan TEXT;
    END IF;

    -- Educational information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'high_school') THEN
        ALTER TABLE public.athletes ADD COLUMN high_school TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'hs_coach') THEN
        ALTER TABLE public.athletes ADD COLUMN hs_coach TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'hs_coach_phone') THEN
        ALTER TABLE public.athletes ADD COLUMN hs_coach_phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'previous_colleges') THEN
        ALTER TABLE public.athletes ADD COLUMN previous_colleges TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'current_grade') THEN
        ALTER TABLE public.athletes ADD COLUMN current_grade TEXT;
    END IF;

    -- Draft and NFL information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'draft_year') THEN
        ALTER TABLE public.athletes ADD COLUMN draft_year INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'draft_round') THEN
        ALTER TABLE public.athletes ADD COLUMN draft_round TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'draft_selection') THEN
        ALTER TABLE public.athletes ADD COLUMN draft_selection TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'draft_round_projection') THEN
        ALTER TABLE public.athletes ADD COLUMN draft_round_projection TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'achievements') THEN
        ALTER TABLE public.athletes ADD COLUMN achievements TEXT;
    END IF;

    -- NIL and contract information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'nil_tier') THEN
        ALTER TABLE public.athletes ADD COLUMN nil_tier TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'nil_value') THEN
        ALTER TABLE public.athletes ADD COLUMN nil_value INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'total_contract_value') THEN
        ALTER TABLE public.athletes ADD COLUMN total_contract_value INTEGER;
    END IF;

    -- Family information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'mother_name') THEN
        ALTER TABLE public.athletes ADD COLUMN mother_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'mother_phone') THEN
        ALTER TABLE public.athletes ADD COLUMN mother_phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'mother_email') THEN
        ALTER TABLE public.athletes ADD COLUMN mother_email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'mother_occupation') THEN
        ALTER TABLE public.athletes ADD COLUMN mother_occupation TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'mother_company') THEN
        ALTER TABLE public.athletes ADD COLUMN mother_company TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'mother_address') THEN
        ALTER TABLE public.athletes ADD COLUMN mother_address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'father_name') THEN
        ALTER TABLE public.athletes ADD COLUMN father_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'father_phone') THEN
        ALTER TABLE public.athletes ADD COLUMN father_phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'father_email') THEN
        ALTER TABLE public.athletes ADD COLUMN father_email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'father_occupation') THEN
        ALTER TABLE public.athletes ADD COLUMN father_occupation TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'father_company') THEN
        ALTER TABLE public.athletes ADD COLUMN father_company TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'father_address') THEN
        ALTER TABLE public.athletes ADD COLUMN father_address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'same_address_as_mother') THEN
        ALTER TABLE public.athletes ADD COLUMN same_address_as_mother BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'siblings') THEN
        ALTER TABLE public.athletes ADD COLUMN siblings TEXT;
    END IF;

    -- Scouting and evaluation
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'scouting_reports') THEN
        ALTER TABLE public.athletes ADD COLUMN scouting_reports JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'nfl_feedback') THEN
        ALTER TABLE public.athletes ADD COLUMN nfl_feedback TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'nfl_value') THEN
        ALTER TABLE public.athletes ADD COLUMN nfl_value TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'nfl_value_grade') THEN
        ALTER TABLE public.athletes ADD COLUMN nfl_value_grade TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'nfl_contract_years') THEN
        ALTER TABLE public.athletes ADD COLUMN nfl_contract_years TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'nfl_contract_value') THEN
        ALTER TABLE public.athletes ADD COLUMN nfl_contract_value TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'nfl_contract_aav') THEN
        ALTER TABLE public.athletes ADD COLUMN nfl_contract_aav TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'agency_interest') THEN
        ALTER TABLE public.athletes ADD COLUMN agency_interest BOOLEAN DEFAULT FALSE;
    END IF;

    -- Rename any columns that need to be renamed for consistency
    -- Check if the old column exists and the new one doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'height_inches') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'height_ft_in') THEN
        ALTER TABLE public.athletes RENAME COLUMN height_inches TO height_ft_in;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'weight') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'weight_lbs') THEN
        ALTER TABLE public.athletes RENAME COLUMN weight TO weight_lbs;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'draft_pick') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'draft_selection') THEN
        ALTER TABLE public.athletes RENAME COLUMN draft_pick TO draft_selection;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'profile_image_url') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'athletes' AND column_name = 'image_url') THEN
        ALTER TABLE public.athletes RENAME COLUMN profile_image_url TO image_url;
    END IF;

END $$;

-- Ensure the proper trigger exists for updated_at
CREATE OR REPLACE FUNCTION update_athletes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS athletes_updated_at ON public.athletes;

-- Recreate trigger
CREATE TRIGGER athletes_updated_at
BEFORE UPDATE ON public.athletes
FOR EACH ROW
EXECUTE PROCEDURE update_athletes_updated_at();

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'athletes' AND indexname = 'athletes_org_id_idx') THEN
        CREATE INDEX athletes_org_id_idx ON public.athletes(org_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'athletes' AND indexname = 'athletes_last_name_idx') THEN
        CREATE INDEX athletes_last_name_idx ON public.athletes(last_name);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'athletes' AND indexname = 'athletes_sport_idx') THEN
        CREATE INDEX athletes_sport_idx ON public.athletes(sport);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'athletes' AND indexname = 'athletes_status_idx') THEN
        CREATE INDEX athletes_status_idx ON public.athletes(status);
    END IF;
END $$;

-- Enable Row Level Security if not already enabled
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid errors
DROP POLICY IF EXISTS athletes_org_isolation ON public.athletes;
DROP POLICY IF EXISTS athletes_insert_policy ON public.athletes;
DROP POLICY IF EXISTS athletes_update_policy ON public.athletes;
DROP POLICY IF EXISTS athletes_delete_policy ON public.athletes;

-- Recreate policies
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

-- Add or update comments on table and columns
COMMENT ON TABLE public.athletes IS 'Athletes represented by agencies';
COMMENT ON COLUMN public.athletes.org_id IS 'Organization (agency) that represents this athlete';
COMMENT ON COLUMN public.athletes.status IS 'Current status of the athlete (active, inactive, retired, etc.)';
COMMENT ON COLUMN public.athletes.stats IS 'JSON field for storing sport-specific statistics';
COMMENT ON COLUMN public.athletes.metrics IS 'JSON field for storing athlete performance metrics';
