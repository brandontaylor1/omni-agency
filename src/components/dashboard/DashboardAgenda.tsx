'use client';

import { Badge } from '@/components/ui/badge';
import { Check, Clock, Users } from 'lucide-react';
import { CalendarEventWithAthlete } from '@/types/calendar';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Contact } from '@/types/contact';
import { Athlete } from '@/types/athlete';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

interface DashboardAgendaProps {
  loading: boolean;
  selectedDate: Date;
  agendaEvents: CalendarEventWithAthlete[];
  orgContacts: Contact[];
  athletes: Athlete[];
  onEventClick: (event: CalendarEventWithAthlete) => void;
}

export function DashboardAgenda({ loading, agendaEvents, orgContacts = [], athletes = [], onEventClick }: DashboardAgendaProps) {
  const [localEvents, setLocalEvents] = useState(agendaEvents);

  useEffect(() => {
    setLocalEvents(agendaEvents);
  }, [agendaEvents]);

  const handleCompleteToggle = async (event: CalendarEventWithAthlete) => {
    const newFulfilled = event.fulfilled === true;
    setLocalEvents((prev) =>
      prev.map((e) =>
        e.id === event.id ? { ...e, fulfilled: !newFulfilled } : e
      )
    );
    await supabase
      .from('calendar_events')
      .update({ fulfilled: !newFulfilled } as Partial<CalendarEventWithAthlete>)
      .eq('id', event.id);
  };

  // Use localEvents for rendering
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading events...</p>
          </div>
        ) : localEvents.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            <p>No events for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {localEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-start justify-between p-3 rounded-md border cursor-pointer relative transition-opacity duration-400 ${
                  event.fulfilled
                    ? 'bg-green-50 dark:bg-green-900/10'
                    : new Date(event.date) < new Date()
                    ? 'bg-amber-50 dark:bg-amber-900/10'
                    : 'bg-white dark:bg-gray-950'
                }`}
                onClick={() => onEventClick(event)}
              >
                {/* Checkbox top-right */}
                <input
                  type="checkbox"
                  checked={!!event.fulfilled}
                  onChange={() => handleCompleteToggle(event)}
                  className="absolute top-2 right-2 h-4 w-4 accent-green-600 cursor-pointer"
                  aria-label="Mark as completed"
                />
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 p-1.5 rounded-full ${
                      event.fulfilled
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}
                  >
                    {event.fulfilled ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Clock className="h-3 w-3" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    {event.type === 'athlete' && event.athlete_id && event.athlete_name && (
                      <Link
                        href={`/dashboard/athletes/${event.athlete_id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {event.athlete_name}
                      </Link>
                    )}
                    {event.type !== 'athlete' && event.athlete_name && (
                      <p className="text-xs text-muted-foreground">
                        {event.athlete_name}
                      </p>
                    )}
                    {event.type === 'game' && event.metadata && (
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          vs {event.metadata.opponent} ({event.metadata.location})
                        </p>
                        {event.metadata.attending_members && event.metadata.attending_members.length > 0 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  <span>
                                    {event.metadata.attending_members[0].name}
                                    {event.metadata.attending_members.length > 1 &&
                                      ` +${event.metadata.attending_members.length - 1}`}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="p-2 max-w-[300px]">
                                <div className="space-y-2">
                                  {event.metadata.attending_members.map((member) => (
                                    <div key={member.id} className="text-xs">
                                      <div className="font-semibold">{member.name} ({member.type})</div>
                                      {member.email && (
                                        <div className="text-muted-foreground">{member.email}</div>
                                      )}
                                      {member.phone && (
                                        <div className="text-muted-foreground">{member.phone}</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    )}
                    {event.description && (
                      <p className="text-sm mt-1 text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    {/* Action Items Section */}
                    {event.action_items && event.action_items.length > 0 && (
                      <div className="mt-2 border rounded bg-gray-50 p-2">
                        <div className="font-semibold text-xs mb-1">Action Items:</div>
                        <ul className="list-disc ml-4">
                          {event.action_items.map((item: any, idx: number) => (
                            <li key={item.id || idx} className="mb-2">
                              <span className="font-medium text-sm">{item.description}</span>
                              {item.assignees && item.assignees.length > 0 && (
                                <span className="ml-2">[
                                  {item.assignees.map((aid: string, i: number) => {
                                    const contact = orgContacts.find((c: Contact) => c.id === aid);
                                    const athlete = athletes.find((a: Athlete) => a.id === aid);
                                    let name = "Unknown";
                                    if (contact) {
                                      name = `${contact.first_name} ${contact.last_name}`;
                                    } else if (athlete) {
                                      name = athlete.first_name && athlete.last_name ? `${athlete.first_name} ${athlete.last_name}` : "Unknown Athlete";
                                    }
                                    return (
                                      <span key={aid} className="inline-block bg-blue-100 text-blue-800 px-1 rounded mr-1">
                                        {name}
                                        {i < item.assignees.length - 1 ? ', ' : ''}
                                      </span>
                                    );
                                  })}
                                ]</span>
                              )}
                              {item.notes && (
                                <span className="ml-2 text-xs text-gray-600">- {item.notes}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                {event.fulfilled ? (
                  <Badge variant="success" className="text-xs">
                    Completed
                  </Badge>
                ) : new Date(event.date) < new Date() ? null : (
                  <Badge variant="secondary" className="text-xs">
                    Scheduled
                  </Badge>
                )}
                {!event.fulfilled && new Date(event.date) < new Date() && (
                  <div className="flex justify-end mt-2">
                    <Badge variant="outline" className="text-xs">
                      Overdue
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
