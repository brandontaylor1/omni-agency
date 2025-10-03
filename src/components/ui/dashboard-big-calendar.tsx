"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Users } from "lucide-react"
import { DayPicker } from "react-day-picker"
import type { DayPickerSingleProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import type { CalendarEventWithAthlete } from "@/types/calendar"
import type { Athlete } from "@/types/athlete";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface DashboardBigCalendarProps extends Omit<DayPickerSingleProps, 'components' | 'mode'> {
  eventsByDate?: Record<string, CalendarEventWithAthlete[]>;
  handleEventClick?: (event: CalendarEventWithAthlete) => void;
  onDayClick?: (date: Date) => void;
  onDayDoubleClick?: (date: Date) => void;
  athletes?: Athlete[];
}

const DashboardBigCalendar = React.forwardRef<HTMLDivElement, DashboardBigCalendarProps>(
  function DashboardBigCalendar({
    className,
    classNames,
    showOutsideDays = true,
    eventsByDate = {},
    handleEventClick,
    onDayClick,
    onDayDoubleClick,
    athletes,
    ...props
  }, ref) {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [lastClickTime, setLastClickTime] = React.useState<number>(0);

    React.useImperativeHandle(ref, () => containerRef.current!);

    const handleDayClick = (date: Date) => {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastClickTime;

      if (timeDiff < 300) { // Double click threshold
        onDayDoubleClick?.(date);
      } else {
        onDayClick?.(date);
      }

      setLastClickTime(currentTime);
    };

    const typeColors: Record<string, string> = {
      athlete: "bg-blue-500",
      meeting: "bg-green-500",
      travel: "bg-yellow-500",
      game: "bg-purple-500",
      signing: "bg-orange-500",
      appearance: "bg-pink-500",
      football_camp: "bg-indigo-500",
      other: "bg-gray-400",
    };

    return (
      <div ref={containerRef} className="w-full min-h-[600px] flex">
        <DayPicker
          mode="single"
          showOutsideDays={showOutsideDays}
          className={cn("w-full flex-1", className)}
          classNames={{
            root: "w-full",
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 h-full",
            month: "w-full space-y-4 flex-1",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-xl font-bold pb-2",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              buttonVariants({ variant: "outline" }),
              "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100"
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1 flex-1",
            head_row: "flex w-full",
            head_cell: "text-muted-foreground rounded-md w-full font-medium text-[0.8rem] h-10",
            row: "flex w-full mt-2 flex-1",
            cell: "relative w-full aspect-square p-0.5",
            day: cn(
              buttonVariants({ variant: "ghost" }),
              "h-full w-full p-0 font-normal aria-selected:opacity-100"
            ),
            day_selected: "bg-transparent shadow-[inset_0_0_0_1.5px] shadow-primary hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent/50 focus:text-accent-foreground",
            day_today: "bg-accent/20 text-accent-foreground",
            day_outside: "text-muted-foreground opacity-50",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
            ...classNames,
          }}
          components={{
            IconLeft: () => <ChevronLeft className="h-4 w-4" />,
            IconRight: () => <ChevronRight className="h-4 w-4" />,
            DayContent: ({ date }) => {
              const key = date.toISOString().split('T')[0];
              const events = eventsByDate[key] || [];

              // Helper to get athlete name robustly
              const getAthleteName = (event: CalendarEventWithAthlete) => {
                if (event.athlete_name) return event.athlete_name;
                if (event.athlete_id && athletes && athletes.length > 0) {
                  const athlete = athletes.find(a => a.id === event.athlete_id);
                  if (athlete) {
                    if (athlete.first_name && athlete.last_name) {
                      return `${athlete.first_name} ${athlete.last_name}`;
                    }
                    // No fallback to athlete.name, just use Unknown
                  }
                }
                return "Unknown";
              };

              return (
                <div className="h-full w-full flex flex-col p-2 border rounded-lg hover:bg-accent/10 transition-colors">
                  <span className="text-xl font-extralight">
                    {date.getDate()}
                  </span>
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {events.map((event, idx) => (
                      <div
                        key={event.id || idx}
                        className={cn(
                          "flex items-center gap-1.5 group",
                          event.type === 'game' && "bg-black text-white p-1 rounded"
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (handleEventClick) {
                            handleEventClick(event);
                          }
                        }}
                      >
                        <div
                          className={`flex-shrink-0 h-2 w-2 rounded-full border border-white shadow-sm cursor-pointer group-hover:scale-125 transition-transform ${typeColors[event.type || "other"]}`}
                          title={event.title}
                        />
                        {/* Show athlete name for athlete/game/signing/appearance/football_camp */}
                        {(event.type === 'athlete' ||
                          event.type === 'game' ||
                          event.type === 'signing' ||
                          event.type === 'appearance' ||
                          event.type === 'football_camp') &&
                          (event.athlete_name || (event.athlete_id && athletes && athletes.length > 0)) && (
                          <div className="flex flex-col flex-1 min-w-0">
                            <span
                              className="text-[10px] truncate group-hover:text-foreground transition-colors"
                              title={`${getAthleteName(event)} - ${event.title}`}
                            >
                              {getAthleteName(event)}
                            </span>
                            {event.type === 'game' && event.metadata && (
                              <>
                                <span className="text-[9px] ">
                                  vs {event.metadata.opponent} ({event.metadata.location})
                                </span>
                                {Array.isArray(event.metadata?.attending_members) && event.metadata.attending_members.length > 0 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 text-[9px] mt-0.5">
                                          <Users className="h-2.5 w-2.5" />
                                          <span className="truncate">
                                            {event.metadata?.attending_members?.[0]?.name}
                                            {event.metadata?.attending_members && event.metadata.attending_members.length > 1 &&
                                              ` +${event.metadata.attending_members.length - 1}`}
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="p-2 max-w-[300px]">
                                        <div className="space-y-2">
                                          {event.metadata?.attending_members?.map((member) => (
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
                              </>
                            )}
                          </div>
                        )}
                        {/* Show meeting title for meeting events */}
                        {event.type === 'meeting' && event.title && (
                          <div className="flex flex-col flex-1 min-w-0">
                            <span
                              className="text-[10px] truncate group-hover:text-foreground transition-colors"
                              title={event.title}
                            >
                              {event.title}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            },
          }}
          onDayClick={handleDayClick}
          {...props}
        />
      </div>
    );
  }
);

DashboardBigCalendar.displayName = "DashboardBigCalendar";

export { DashboardBigCalendar };
