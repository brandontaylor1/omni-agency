import { Tables } from './supabase';

// Type for the Contact from the database
export type Contact = Tables<'contacts'> & {
  created_by?: string;
};

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
