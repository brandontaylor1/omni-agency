import { Tables } from './supabase';

export const PROFESSIONAL_DEVELOPMENT_CATEGORIES = [
  "Emotional Intelligence Training",
  "Mental Resilience Training",
  "Biomechanical Testing",
  "Neurocognitive Training",
  "Media Training",
  "Interview Preparation",
  "Financial Literacy",
  "Personal Branding",
  "Leadership Development",
  "Nutrition Education"
];

// Type for the Athlete from the database
export type Athlete = Tables<'athletes'>;

// NIL Tier options
export const NIL_TIERS = ['Elite', 'Premium', 'Standard', 'Developing', 'Prospect'] as const;
export type NilTier = typeof NIL_TIERS[number];

// Football positions
export const POSITIONS = [
  // Offense
  'QB', 'RB', 'FB', 'WR', 'TE', 'OT', 'OG', 'C',
  // Defense
  'DE', 'DT', 'NT', 'LB', 'OLB', 'MLB', 'ILB', 'CB', 'FS', 'SS',
  // Special Teams
  'K', 'P', 'LS'
] as const;
export type Position = typeof POSITIONS[number];

// College grade levels
export const GRADES = ['Freshman', 'Sophomore', 'Junior', 'Senior', '5th Year'] as const;
export type Grade = typeof GRADES[number];

// Filter options for athletes
export interface AthleteFilters {
  search?: string;
  position?: Position | '';
  nilTier?: NilTier | '';
  currentGrade?: Grade | '';
  sortBy?: 'name' | 'position' | 'nilValue' | 'totalContractValue';
  sortDirection?: 'asc' | 'desc';
  professional_development?: ProfessionalDevelopmentActivity[] | null;
}

export interface ProfessionalDevelopmentActivity {
  id?: string;
  category: string;
  date: string;
  notes?: string | null;
}

export interface BrandPartnership {
  id: string;
  date: string;
  company: string;
  details: string;
  monetary_value?: number | null;
  inkind_value?: number | null;
  obligations?: string | null;
  status: 'active' | 'completed' | 'pending' | 'canceled';
}
