import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { EventType, GameLocation } from "@/types/calendar";
import { Athlete } from "@/types/athlete";
import { ContactType } from "@/types/contact";

export interface BaseContact {
  id: string;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  type: string;
  org_id: string;
  created_by?: string;
}

export interface ExtendedContact extends BaseContact {
  type: ContactType;
}

export interface SerializedAttendingMember {
  id: string;
  name: string;
  type: ContactType;
  email?: string | null;
  phone?: string | null;
}

export interface EventFormData {
  title: string;
  description: string;
  type: EventType;
  athlete_id: string;
  fulfilled: boolean;
  opponent: string;
  location: GameLocation;
  attending_members: SerializedAttendingMember[];
}

// Export the interface for proper type inference
export interface EventModalFormProps {
  form: EventFormData;
  onChange: (updates: Partial<EventFormData>) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  athletes: Athlete[];
  orgContacts: ExtendedContact[];
  onCancel: () => void;
  onSave: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

const EventModalForm = React.forwardRef<HTMLFormElement, EventModalFormProps>((props, ref) => {
  const {
    form,
    onChange,
    selectedDate,
    onDateChange,
    selectedTime,
    onTimeChange,
    athletes,
    orgContacts,
    onCancel,
    onSave,
    onDelete,
    loading = false
  } = props;

  const selectedAthlete = athletes.find(a => a.id === form.athlete_id);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({ [name]: value } as Partial<EventFormData>);
  };

  const handleAttendingMemberAdd = (contactId: string) => {
    const contact = orgContacts.find(c => c.id === contactId);
    if (!contact) return;

    const newMember: SerializedAttendingMember = {
      id: contact.id,
      name: `${contact.first_name} ${contact.last_name}`,
      type: contact.type,
      email: contact.email,
      phone: contact.phone,
    };

    onChange({
      attending_members: [...form.attending_members.filter(m => m.id !== contactId), newMember]
    });
  };

  const handleAttendingMemberRemove = (memberId: string) => {
    onChange({
      attending_members: form.attending_members.filter(m => m.id !== memberId)
    });
  };

  return (
    <form ref={ref} className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          name="title"
          value={form.title}
          onChange={handleChange}
          className="w-full"
          required
        />
      </div>

      {/* Date and Time Picker */}
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: Date | undefined) => date && onDateChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => onTimeChange(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <Select
          value={form.type}
          onValueChange={(value) => onChange({ type: value as EventType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="athlete">Athlete</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
            <SelectItem value="game">Game</SelectItem>
            <SelectItem value="signing">Signing</SelectItem>
            <SelectItem value="appearance">Appearance</SelectItem>
            <SelectItem value="football_camp">Football Camp</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(form.type === "athlete" || form.type === "game" ||
        form.type === "signing" || form.type === "appearance" ||
        form.type === "football_camp") && (
        <div>
          <label className="block text-sm font-medium mb-1">Athlete</label>
          <Select
            value={form.athlete_id}
            onValueChange={(value) => onChange({ athlete_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select athlete" />
            </SelectTrigger>
            <SelectContent>
              {athletes.map((athlete) => (
                <SelectItem key={athlete.id} value={athlete.id}>
                  {athlete.first_name} {athlete.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {form.type === "game" && (
        <>
          {selectedAthlete?.current_team && (
            <div>
              <label className="block text-sm font-medium mb-1">College/Team</label>
              <Input
                value={selectedAthlete.current_team}
                disabled
                className="w-full bg-gray-50"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Opponent</label>
            <Input
              name="opponent"
              value={form.opponent}
              onChange={handleChange}
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Select
              value={form.location}
              onValueChange={(value) => onChange({ location: value as GameLocation })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="away">Away</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Attending Members</label>
            <Select
              value=""
              onValueChange={handleAttendingMemberAdd}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select members" />
              </SelectTrigger>
              <SelectContent>
                {orgContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name} ({contact.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="mt-2 space-y-1">
              {form.attending_members.map(member => (
                <div key={member.id} className="flex items-center gap-2 bg-gray-100 p-1 rounded">
                  <span className="text-sm">{member.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAttendingMemberRemove(member.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="fulfilled"
          checked={form.fulfilled}
          onChange={(e) => onChange({ fulfilled: e.target.checked })}
        />
        <label htmlFor="fulfilled" className="text-sm">Completed</label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={loading}
          >
            Delete
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || !form.title || !selectedDate}
        >
          Save
        </Button>
      </div>
    </form>
  );
});

EventModalForm.displayName = "EventModalForm";

export { EventModalForm };
