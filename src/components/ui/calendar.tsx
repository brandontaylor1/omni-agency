"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  eventsByDate?: Record<string, any[]>;
  size?: "large" | "default";
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  eventsByDate = {},
  size = "default",
  ...props
}: CalendarProps) {
  // Set sizes based on 'size' prop
  const calendarHeight = size === "large" ? "h-[800px]" : "h-[400px]";
  const cellSize = size === "large" ? "h-48 w-48 p-4" : "h-16 w-16 p-1";

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(`p-3 w-full ${calendarHeight}`, className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-lg font-bold pb-2",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-12 font-normal text-[0.9rem]",
        row: "flex w-full mt-2",
        cell: `${cellSize} text-left align-top relative border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all duration-100`,
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-full w-full font-normal aria-selected:opacity-100 flex flex-col items-start justify-start p-0"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground border-2 border-primary",
        day_today: "bg-accent text-accent-foreground border-2 border-accent",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        DayContent: ({ date }) => {
          const key = date.toISOString().slice(0, 10);
          const events = eventsByDate[key] || [];
          // Color map for event types
          const typeColors: Record<string, string> = {
            athlete: "bg-blue-500",
            meeting: "bg-green-500",
            travel: "bg-yellow-500",
            other: "bg-gray-400",
          };
          return (
            <div className="flex flex-col h-full w-full relative">
              <span className="text-xs font-semibold text-gray-700 absolute top-1 left-2">{date.getDate()}</span>
              {/* Event dots */}
              <div className="flex flex-row gap-1 absolute bottom-1 left-2">
                {events.map((event, idx) => (
                  <span
                    key={idx}
                    className={`h-2 w-2 rounded-full border border-white shadow ${typeColors[event.type || "other"]}`}
                    title={event.title}
                  />
                ))}
              </div>
            </div>
          );
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
