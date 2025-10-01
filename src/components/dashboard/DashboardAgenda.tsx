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

interface DashboardAgendaProps {
  loading: boolean;
  selectedDate: Date;
  agendaEvents: CalendarEventWithAthlete[];
  /* @ts-expect-error - Function props are not serializable but this is a client component */
  onEventClick: (event: CalendarEventWithAthlete) => void;
}

export function DashboardAgenda({ loading, agendaEvents, onEventClick }: DashboardAgendaProps) {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading events...</p>
          </div>
        ) : agendaEvents.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            <p>No events for this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {agendaEvents.map((event) => (
              <div
                key={event.id}
                className={`flex items-start justify-between p-3 rounded-md border cursor-pointer ${
                  event.fulfilled
                    ? 'bg-green-50 dark:bg-green-900/10'
                    : new Date(event.date) < new Date()
                    ? 'bg-amber-50 dark:bg-amber-900/10'
                    : 'bg-white dark:bg-gray-950'
                }`}
                onClick={() => onEventClick(event)}
              >
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
                  </div>
                </div>
                <Badge
                  variant={event.fulfilled ? "success" : new Date(event.date) < new Date() ? "outline" : "secondary"}
                  className="text-xs"
                >
                  {event.fulfilled
                    ? 'Completed'
                    : new Date(event.date) < new Date()
                    ? 'Overdue'
                    : 'Scheduled'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
