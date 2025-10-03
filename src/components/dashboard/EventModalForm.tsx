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
import { Contact } from "@/types/contact";

export interface SerializedAttendingMember {
  id: string;
  name: string;
  type: ContactType;
  email?: string | null;
  phone?: string | null;
}

export interface EventActionItem {
  description: string;
  assignees: string[];
  notes?: string;
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
  action_items?: EventActionItem[];
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
  orgContacts: Contact[];
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
      type: contact.contact_type as ContactType,
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

  // Action Items Handlers
  const handleActionItemChange = (idx: number, field: keyof EventActionItem, value: any) => {
    const updated = (form.action_items ?? []).map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    onChange({ action_items: updated });
  };

  const handleActionItemAssigneesChange = (idx: number, assignees: string[]) => {
    const updated = (form.action_items ?? []).map((item, i) =>
      i === idx ? { ...item, assignees } : item
    );
    onChange({ action_items: updated });
  };

  const handleAddActionItem = () => {
    onChange({ action_items: [...(form.action_items ?? []), { description: "", assignees: [], notes: "" }] });
  };

  const handleRemoveActionItem = (idx: number) => {
    const updated = (form.action_items ?? []).filter((_, i) => i !== idx);
    onChange({ action_items: updated });
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
        {/* Wrap label in a fragment to ensure valid JSX */}
        <span>
          <label htmlFor="fulfilled" className="text-sm">Completed</label>
        </span>
      </div>

      {/* Action Items Section */}
      <div className="border rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <label className="font-semibold text-lg">Action Items (optional)</label>
          <Button type="button" size="sm" onClick={handleAddActionItem}>
            + Add Action Item
          </Button>
        </div>
        {(form.action_items ?? []).length === 0 && (
          <p className="text-muted-foreground text-sm">No action items added.</p>
        )}
        {(form.action_items ?? []).map((item, idx) => (
          <div key={idx} className="border rounded p-3 mb-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Input
                placeholder="Action item description"
                value={item.description}
                onChange={e => handleActionItemChange(idx, "description", e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveActionItem(idx)}>
                ×
              </Button>
            </div>
            <div className="mb-2">
              <label className="block text-xs font-medium mb-1">Assignees (optional)</label>
              <Select
                value=""
                onValueChange={assignee => {
                  const current = item.assignees || [];
                  if (!current.includes(assignee)) {
                    handleActionItemAssigneesChange(idx, [...current, assignee]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignees" />
                </SelectTrigger>
                <SelectContent>
                  {orgContacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name} ({contact.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Show selected assignees */}
              <div className="flex flex-wrap gap-1 mt-2">
                {item.assignees.map(aid => {
                  const contact = orgContacts.find(c => c.id === aid);
                  if (!contact) return null;
                  return (
                    <span key={aid} className="bg-gray-200 px-2 py-1 rounded text-xs">
                      {contact.first_name} {contact.last_name}
                      <button type="button" className="ml-1 text-red-500" onClick={() => handleActionItemAssigneesChange(idx, item.assignees.filter(id => id !== aid))}>
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Notes/Discussion (optional)</label>
              <Textarea
                placeholder="Add notes or discussion points..."
                value={item.notes ?? ""}
                onChange={e => handleActionItemChange(idx, "notes", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        ))}
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
