import { Database } from './supabase';

export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];
export type NewCalendarEvent = Database['public']['Tables']['calendar_events']['Insert'];

export type CalendarTask = Database['public']['Tables']['calendar_tasks']['Row'];
export type NewCalendarTask = Database['public']['Tables']['calendar_tasks']['Insert'];

export type EventType =
  | 'athlete'
  | 'meeting'
  | 'travel'
  | 'game'
  | 'signing'
  | 'appearance'
  | 'football_camp'
  | 'other';

// Game location type
export type GameLocation = 'home' | 'away';

interface EventMetadata {
  opponent?: string;
  location?: GameLocation;
  college?: string;
  attending_members?: Array<{
    id: string;
    name: string;
    type: string;
    email?: string;
    phone?: string;
  }>;
}

// Helper type for the calendar view
export interface CalendarEventWithAthlete extends CalendarEvent {
  athlete_name?: string;
  metadata?: EventMetadata;
  action_items?: EventActionItem[];
}

// Game event specific data interface
export interface GameEventData {
    college: string;
    opponent: string;
    location: GameLocation;
    attending_members: string[];
}

export interface EventActionItem {
  id?: string;
  description: string;
  assignees: string[];
  notes?: string;
  calendar_event_id?: string;
}
