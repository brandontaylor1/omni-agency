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
import { ContactType, Contact } from "@/types/contact";
import { EventModalForm, EventFormData } from "./EventModalForm";

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
  const [orgContacts, setOrgContacts] = useState<Contact[]>([]);
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
        })) as Contact[];
        setOrgContacts(typedContacts);
      }
    }

    fetchData();
  }, [organizationId]);

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
        } : null,
        action_items: form.action_items ?? []
      } as any;
      // If editing, include the event id
      if (event?.id) {
        eventData.id = event.id;
      }
      const response = await fetch('/api/calendar-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventData })
      });
      if (response.ok) {
        await response.json(); // Only for side effects, not used
      } else {
        // Try to parse error if possible, otherwise fallback
        let errorResult;
        try {
          errorResult = await response.json();
        } catch {
          errorResult = { error: 'Unknown error occurred' };
        }
        console.error('Error saving event:', errorResult.error);
        return;
      }
      onEventSaved?.();
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setLoading(false);
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

              {/* Action Items Section */}
              {event?.action_items && event.action_items.length > 0 && (
                <div className="mt-4">
                  <span className="font-semibold">Action Items:</span>
                  <div className="space-y-2 mt-2">
                    {event.action_items.map((item, idx) => (
                      <div key={idx} className="border rounded p-2 bg-gray-50">
                        <div><span className="font-semibold">Description:</span> {item.description}</div>
                        <div>
                          <span className="font-semibold">Assignees:</span> {
                            item.assignees && item.assignees.length > 0
                              ? item.assignees.map((assigneeId) => {
                                  const contact = orgContacts.find(c => c.id === assigneeId);
                                  return contact ? `${contact.first_name} ${contact.last_name}` : assigneeId;
                                }).join(", ")
                              : "None"
                          }
                        </div>
                        {item.notes && (
                          <div><span className="font-semibold">Notes:</span> {item.notes}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
