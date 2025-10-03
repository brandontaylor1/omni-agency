// API route for calendar events and action items
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EventActionItem } from '@/types/calendar';

// POST: Create or update event with action items in JSONB
export async function POST(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await req.json();
    const { event } = body;
    // event.action_items should be an array
    let eventData: any;
    if (event.id) {
      // Update existing event (including action_items JSONB)
      const { data, error } = await supabase
        .from('calendar_events')
        .update(event)
        .eq('id', event.id)
        .select()
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      eventData = data;
    } else {
      // Create new event (including action_items JSONB)
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([event])
        .select()
        .single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      eventData = data;
    }
    return NextResponse.json({ event: eventData }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

// GET: Fetch events (action_items is now part of each event row)
export async function GET(req: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .select('*');
    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 400 });
    }
    // No join needed, action_items is part of each event
    return NextResponse.json({ events }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
