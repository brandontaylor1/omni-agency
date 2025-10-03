-- Add revenue sharing columns to athletes table
ALTER TABLE athletes
ADD COLUMN revenue_sharing_school_tier VARCHAR(255),
ADD COLUMN revenue_sharing_value INTEGER,
ADD COLUMN revenue_sharing_total_value INTEGER;

