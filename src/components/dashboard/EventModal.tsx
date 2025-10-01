"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";
import { CalendarEventWithAthlete, EventType, NewCalendarEvent, GameLocation } from "@/types/calendar";
import { Athlete } from "@/types/athlete";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ContactType } from "@/types/contact";
import { EventModalForm, EventFormData, ExtendedContact } from "./EventModalForm";

interface EventModalProps {
  event?: CalendarEventWithAthlete | null;
  date: Date;
  onClose: () => void;
  onEventSaved?: () => void;
}

const typeColors: Record<EventType, string> = {
  athlete: "bg-blue-500",
  meeting: "bg-green-500",
  travel: "bg-yellow-500",
  game: "bg-purple-500",
  signing: "bg-orange-500",
  appearance: "bg-pink-500",
  football_camp: "bg-indigo-500",
  other: "bg-gray-400",
};

const EventModal = React.forwardRef<HTMLDivElement, EventModalProps>(({
  event,
  date,
  onClose,
  onEventSaved
}, ref) => {
  const { organizationId } = useOrganization();
  const [isEditing, setIsEditing] = useState(!event);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [orgContacts, setOrgContacts] = useState<ExtendedContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(event?.date ? new Date(event.date) : date);
  const [selectedTime, setSelectedTime] = useState(event?.date ? format(new Date(event.date), "HH:mm") : "09:00");

  const defaultForm: EventFormData = {
    title: "",
    description: "",
    type: "other",
    athlete_id: "",
    fulfilled: false,
    opponent: "",
    location: "home",
    attending_members: []
  };

  const [form, setForm] = useState<EventFormData>(() => {
    const attending_members = event?.metadata?.attending_members?.map(member => ({
      id: member.id,
      name: member.name,
      type: member.type as ContactType,
      email: member.email ?? null,
      phone: member.phone ?? null
    })) ?? [];

    return {
      ...defaultForm,
      title: event?.title ?? "",
      description: event?.description ?? "",
      type: event?.type ?? "other",
      athlete_id: event?.athlete_id ?? "",
      fulfilled: event?.fulfilled ?? false,
      opponent: event?.metadata?.opponent ?? "",
      location: (event?.metadata?.location as GameLocation) ?? "home",
      attending_members
    };
  });

  // Fetch athletes and org contacts
  useEffect(() => {
    async function fetchData() {
      if (!organizationId) return;

      const [athletesResponse, contactsResponse] = await Promise.all([
        supabase
          .from("athletes")
          .select("*")
          .eq("org_id", organizationId),
        supabase
          .from("contacts")
          .select("*")
          .eq("org_id", organizationId)
      ]);

      if (athletesResponse.data) {
        setAthletes(athletesResponse.data);
      }

      if (contactsResponse.data) {
        const typedContacts = contactsResponse.data.map(contact => ({
          ...contact,
          type: contact.type as ContactType
        })) as ExtendedContact[];
        setOrgContacts(typedContacts);
      }
    }

    fetchData();
  }, [organizationId]);

  const handleFormChange = (updates: Partial<EventFormData>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    if (!organizationId) return;

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user?.id) {
        console.error('No authenticated user found');
        return;
      }

      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const eventDateTime = new Date(selectedDate);
      eventDateTime.setHours(hours, minutes, 0, 0);

      const selectedAthlete = athletes.find(a => a.id === form.athlete_id);

      const eventData: NewCalendarEvent = {
        organization_id: organizationId,
        title: form.title,
        description: form.description,
        date: eventDateTime.toISOString(),
        type: form.type,
        athlete_id: form.athlete_id || null,
        fulfilled: form.fulfilled,
        created_by: user.id,
        metadata: form.type === 'game' ? {
          opponent: form.opponent,
          location: form.location,
          college: selectedAthlete?.current_team || '',
          attending_members: form.attending_members.map(member => ({
            id: member.id,
            name: member.name,
            type: member.type,
            email: member.email || null,
            phone: member.phone || null
          }))
        } : null
      };

      if (event?.id && isValidUUID(event.id)) {
        const { error: checkError } = await supabase
          .from("calendar_events")
          .select('*')
          .eq("id", event.id)
          .maybeSingle();

        if (checkError) {
          console.error('Error checking event:', checkError);
          return;
        }

        const { error: updateError } = await supabase
          .from("calendar_events")
          .update(eventData)
          .eq("id", event.id)
          .select('*, athlete:athletes(first_name, last_name)')
          .single();

        if (updateError) {
          console.error('Error updating event:', updateError);
          return;
        }
      } else {
        const { error: insertError } = await supabase
          .from("calendar_events")
          .insert(eventData)
          .select('*, athlete:athletes(first_name, last_name)')
          .single();

        if (insertError) {
          console.error('Error creating event:', insertError);
          return;
        }
      }

      // Update athlete's events if necessary
      if (form.athlete_id && isValidUUID(form.athlete_id)) {
        await updateAthleteEvents(form.athlete_id, eventData, user.id);
      }

      onEventSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAthleteEvents = async (athleteId: string, eventData: NewCalendarEvent, userId: string) => {
    const { data: athleteData, error: athleteError } = await supabase
      .from('athletes')
      .select('events')
      .eq('id', athleteId)
      .single();

    if (!athleteError && athleteData) {
      const currentEvents = Array.isArray(athleteData.events) ? athleteData.events : [];
      const eventIndex = currentEvents.findIndex(e => e.id === event?.id);

      const athleteEventData = {
        id: event?.id,
        title: eventData.title,
        date: eventData.date,
        type: eventData.type,
        description: eventData.description,
        fulfilled: eventData.fulfilled,
        created_by: userId
      };

      const updatedEvents = eventIndex >= 0
        ? currentEvents.map((e, i) => i === eventIndex ? athleteEventData : e)
        : [...currentEvents, athleteEventData];

      const { error: updateError } = await supabase
        .from('athletes')
        .update({ events: updatedEvents })
        .eq('id', athleteId);

      if (updateError) {
        console.error('Error updating athlete events:', updateError);
      }
    }
  };

  const handleDelete = async () => {
    if (!event?.id || !isValidUUID(event.id)) return;

    setLoading(true);
    try {
      await supabase
        .from("calendar_events")
        .delete()
        .eq("id", event.id);

      onEventSaved?.();
      onClose();
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to validate UUID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent ref={ref}>
        <DialogHeader>
          <DialogTitle>{event ? "Event Details" : "Add Event"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {isEditing ? (
            <React.Suspense fallback={<div>Loading...</div>}>
              <EventModalForm
                form={form}
                onChange={(updates: Partial<EventFormData>) => setForm(prev => ({ ...prev, ...updates }))}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                selectedTime={selectedTime}
                onTimeChange={setSelectedTime}
                athletes={athletes}
                orgContacts={orgContacts}
                onCancel={() => event ? setIsEditing(false) : onClose()}
                onSave={handleSave}
                onDelete={event ? handleDelete : undefined}
                loading={loading}
              />
            </React.Suspense>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${typeColors[event?.type || "other"]}`} />
                <Badge variant="secondary">{event?.type}</Badge>
              </div>

              <div>
                <span className="font-semibold">Title:</span> {event?.title}
              </div>

              <div>
                <span className="font-semibold">Date & Time:</span>{" "}
                {event?.date ? format(new Date(event.date), "PPP 'at' p") : format(date, "PPP 'at' p")}
              </div>

              {event?.description && (
                <div>
                  <span className="font-semibold">Description:</span> {event.description}
                </div>
              )}

              {event?.athlete_id && (
                <div>
                  <span className="font-semibold">Athlete:</span> {event.athlete_name}
                </div>
              )}

              <div>
                <span className="font-semibold">Status:</span>{" "}
                {event?.fulfilled ? "Completed" : "Scheduled"}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button onClick={onClose}>Close</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

EventModal.displayName = "EventModal";

export default EventModal;
