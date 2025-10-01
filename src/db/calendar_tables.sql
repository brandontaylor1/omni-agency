-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    date TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('athlete', 'meeting', 'travel', 'other')),
    fulfilled BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- Create calendar_tasks table
CREATE TABLE IF NOT EXISTS public.calendar_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON public.calendar_events;
DROP TRIGGER IF EXISTS update_calendar_tasks_updated_at ON public.calendar_tasks;

-- Create triggers for updated_at
CREATE TRIGGER update_calendar_events_updated_at
    BEFORE UPDATE ON public.calendar_events
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_calendar_tasks_updated_at
    BEFORE UPDATE ON public.calendar_tasks
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for calendar_events
DROP POLICY IF EXISTS "Users can view events in their organization" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can create events in their organization" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update events in their organization" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete events in their organization" ON public.calendar_events;

-- Create policies for calendar_events
CREATE POLICY "Users can view events in their organization"
    ON public.calendar_events
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.org_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create events in their organization"
    ON public.calendar_events
    FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id
            FROM public.org_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update events in their organization"
    ON public.calendar_events
    FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.org_members
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id
            FROM public.org_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete events in their organization"
    ON public.calendar_events
    FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.org_members
            WHERE user_id = auth.uid()
        )
    );

-- Drop existing policies for calendar_tasks
DROP POLICY IF EXISTS "Users can view tasks in their organization" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can create tasks in their organization" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can update tasks in their organization" ON public.calendar_tasks;
DROP POLICY IF EXISTS "Users can delete tasks in their organization" ON public.calendar_tasks;

-- Create policies for calendar_tasks
CREATE POLICY "Users can view tasks in their organization"
    ON public.calendar_tasks
    FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.org_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks in their organization"
    ON public.calendar_tasks
    FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id
            FROM public.org_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks in their organization"
    ON public.calendar_tasks
    FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.org_members
            WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id
            FROM public.org_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tasks in their organization"
    ON public.calendar_tasks
    FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.org_members
            WHERE user_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_organization_id ON public.calendar_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_athlete_id ON public.calendar_events(athlete_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_organization_id ON public.calendar_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_calendar_tasks_date ON public.calendar_tasks(date);
