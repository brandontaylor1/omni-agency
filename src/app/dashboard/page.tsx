'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardCalendar from '@/components/dashboard/DashboardCalendar';
import { DashboardAgenda } from '@/components/dashboard/DashboardAgenda';
import { TasksPanel } from '@/components/dashboard/TasksPanel';
import { CalendarEventWithAthlete, CalendarTask, CalendarEvent } from '@/types/calendar';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/lib/supabase/client';

export default function DashboardPage() {
  const { organizationId, organizationName } = useOrganization();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEventWithAthlete[]>([]);
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch events from API route to include action_items
      const response = await fetch('/api/calendar-events');
      const result = await response.json();
      let calendarEvents = result.events || [];

      // Process calendar events to include athlete names
      const processedCalendarEvents = calendarEvents.map((event: any) => ({
        ...event,
        athlete_name: event.athlete
          ? `${event.athlete.first_name} ${event.athlete.last_name}`
          : event.athlete_name // fallback if already present
      }));

      // Fetch tasks
      const { data: taskData, error: tasksError } = await supabase
        .from('calendar_tasks')
        .select('*')
        .eq('organization_id', organizationId);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

      setEvents(processedCalendarEvents);
      setTasks(taskData || []);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Filter events for the selected day
  const agendaEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  // Filter tasks for the selected day
  const selectedDateKey = selectedDate.toISOString().slice(0, 10);
  const dailyTasks = tasks.filter(task => task.date === selectedDateKey);

  const handleEventClick = useCallback((event: CalendarEventWithAthlete) => {
    console.log('Event clicked:', event);
  }, []);

  return (
    <div className="h-auto p-6 space-y-6">
      {/*<div>*/}
      {/*  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>*/}
      {/*  <p className="text-muted-foreground">*/}
      {/*    Welcome to your {organizationName || 'agency'} dashboard.*/}
      {/*  </p>*/}
      {/*</div>*/}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 transition-all duration-300">
        {/* Left Column - Agenda and Tasks */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          {/* Today's Agenda */}
          <div className='gap-6'>
            <div className="rounded-lg border bg-card p-4">
              <h2 className="font-semibold text-lg mb-4">Today's Agenda</h2>
              <DashboardAgenda
                  loading={loading}
                  selectedDate={selectedDate}
                  agendaEvents={agendaEvents}
                  onEventClick={handleEventClick}
              />
            </div>

            {/* Tasks Panel */}
            <div className="rounded-lg border bg-card p-4">
              <h2 className="font-semibold text-lg mb-4">Todo List</h2>
              <TasksPanel
                  loading={loading}
                  selectedDate={selectedDate}
                  dailyTasks={dailyTasks}
                  onTasksChange={fetchCalendarData}
              />
            </div>
          </div>

          <h1 className='uppercase tracking-tighter text-5xl'>DASHBOARD</h1>
        </div>

        {/* Right Column - Calendar */}
        <div className="lg:col-span-5 rounded-lg border bg-card p-4">
          <DashboardCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            events={events}
            onEventsChange={fetchCalendarData}
          />
        </div>
      </div>
    </div>
  );
}
