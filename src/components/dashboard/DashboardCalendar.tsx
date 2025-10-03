"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { DashboardBigCalendar } from "@/components/ui/dashboard-big-calendar";
import type { CalendarEventWithAthlete } from "@/types/calendar";
import EventModal from "./EventModal";
import { supabase } from "@/lib/supabase/client";
import type { Athlete } from "@/types/athlete";

type DashboardCalendarProps = {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  events: CalendarEventWithAthlete[];
  onEventsChange: () => Promise<void>;
}

export default function DashboardCalendar({ selectedDate, onDateSelect, events, onEventsChange }: DashboardCalendarProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventWithAthlete | null>(null);
  const [athletes, setAthletes] = useState<Athlete[]>([]);

  useEffect(() => {
    async function fetchAthletes() {
      const { data, error } = await supabase.from("athletes").select("*");
      if (data) setAthletes(data);
    }
    fetchAthletes();
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEventWithAthlete[]> = {};
    events.forEach(event => {
      const eventDate = new Date(event.date);
      const key = eventDate.toISOString().split('T')[0];
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [events]);

  const handleEventClick = useCallback((event: CalendarEventWithAthlete) => {
    setSelectedEvent(event);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedEvent(null);
  }, []);

  const handleAddEventForDate = useCallback(() => {
    setSelectedEvent(null);
    setShowModal(true);
  }, []);

  const handleDayClick = useCallback((date: Date) => {
    onDateSelect(date);
  }, [onDateSelect]);

  const handleDayDoubleClick = useCallback((date: Date) => {
    onDateSelect(date);
    setSelectedEvent(null);
    setShowModal(true);
  }, [onDateSelect]);

  return (
    <div className="flex flex-col h-full">
      <div className="w-full flex justify-between items-center mb-4">
        <span className="font-bold text-lg">Calendar</span>
        <button
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
          onClick={handleAddEventForDate}
        >
          + Add Event
        </button>
      </div>

      <div className="flex-1">
        <DashboardBigCalendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          eventsByDate={eventsByDate}
          onDayClick={handleDayClick}
          onDayDoubleClick={handleDayDoubleClick}
          handleEventClick={handleEventClick}
          athletes={athletes}
        />
      </div>

      <div className="mt-4 flex gap-6 items-center">
        <span className="font-semibold text-sm">Event Types:</span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-500"></span> Athlete
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500"></span> Meeting
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500"></span> Travel
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gray-400"></span> Other
        </span>
      </div>

      {showModal && (
        <EventModal
          event={selectedEvent}
          date={selectedDate}
          onClose={handleCloseModal}
          onEventSaved={onEventsChange}
        />
      )}
    </div>
  );
}
