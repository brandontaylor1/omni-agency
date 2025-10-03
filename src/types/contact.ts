import { Tables } from './supabase';

// Type for the Contact from the database
export interface Contact {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  title: string;
  company: string;
  department: string;
  contact_type: string;
  image_url: string;
  website: string;
  location: string;
  notes: string;
  last_contact_date: string;
  athletes_count: number;
  events_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  org_id: string;
}

// Contact type options
export const CONTACT_TYPES = [
  'Agent', 
  'Family', 
  'Business', 
  'Coach', 
  'Team', 
  'Media', 
  'Sponsor',
  'Other'
] as const;
export type ContactType = typeof CONTACT_TYPES[number];

// Filter options for contacts
export interface ContactFilters {
  search?: string;
  contactType?: ContactType | '';
  sortBy?: 'name' | 'company' | 'contactType' | 'lastContact';
  sortDirection?: 'asc' | 'desc';
}
