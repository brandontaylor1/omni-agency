"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from '@/contexts/OrganizationContext';
import Link from "next/link";
import { ArrowLeft, Plus, Calendar as CalendarIcon, X, Check, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  POSITIONS, 
  NIL_TIERS, 
  GRADES,
  PROFESSIONAL_DEVELOPMENT_CATEGORIES
} from "@/types/athlete";
import { supabase } from "@/lib/supabase/client";

// Draft rounds and NFL value grades
const DRAFT_ROUNDS = [
  "1st Round",
  "2nd Round",
  "3rd Round",
  "4th Round",
  "5th Round",
  "6th Round",
  "7th Round",
  "Undrafted"
];

const NFL_VALUE_GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

// Define event type
type AthleteEvent = {
  id: string;
  date: Date;
  title: string;
  description?: string;
  fulfilled: boolean;
};

// Define professional development activity type
type ProfessionalDevelopmentActivity = {
  id: string;
  category: string;
  date: Date;
  notes?: string;
};

export default function NewAthletePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<AthleteEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Partial<AthleteEvent>>({
    title: "",
    description: "",
    fulfilled: false
  });
  const [expandedReport, setExpandedReport] = useState<number | null>(null);
  const [professionalDev, setProfessionalDev] = useState<ProfessionalDevelopmentActivity[]>([]);
  const [isProfDevDialogOpen, setIsProfDevDialogOpen] = useState(false);
  const [currentProfDev, setCurrentProfDev] = useState<Partial<ProfessionalDevelopmentActivity>>({
    category: "",
    notes: ""
  });

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    college: "",
    nfl_team: "",
    position: "",
    jersey_number: "",
    height_ft_in: "",
    weight_lbs: "",
    speed: "",
    hand_size: "",
    arm_length: "",
    wingspan: "",
    hometown: "",
    high_school: "",
    hs_coach: "",
    hs_coach_phone: "",
    previous_colleges: "",
    current_grade: "",
    bio: "",
    achievements: "",
    nil_tier: "",
    nil_value: "",
    total_contract_value: "",
    image_url: "",
    mother_name: "",
    mother_phone: "",
    mother_email: "",
    mother_occupation: "",
    mother_company: "",
    mother_address: "",
    father_name: "",
    father_phone: "",
    father_email: "",
    father_occupation: "",
    father_company: "",
    father_address: "",
    same_address_as_mother: false,
    siblings: "",
    scouting_reports: [{ evaluation: "", grade: "" }],
    nfl_feedback: "",
    nfl_value: "",
    agency_interest: false,
    draft_round_projection: "",
    draft_selection: "",
    nfl_contract_years: "",
    nfl_contract_value: "",
    nfl_contract_aav: "",
    nfl_value_grade: ""
  });

  // Event handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'same_address_as_mother' && checked) {
        // If same_address_as_mother is checked, copy mother's address to father's
        setFormData(prev => ({
          ...prev,
          [name]: checked,
          father_address: prev.mother_address
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else if (name === 'mother_address' && formData.same_address_as_mother) {
      // When mother's address changes and addresses are synced, update father's too
      setFormData(prev => ({
        ...prev,
        [name]: value,
        father_address: value
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  //   first_name: "",
  //   last_name: "",
  //   college: "",
  //   nfl_team: "",
  //   position: "",
  //   jersey_number: "",
  //   height_ft_in: "",
  //   weight_lbs: "",
  //   speed: "",
  //   hand_size: "",
  //   arm_length: "",
  //   wingspan: "",
  //   hometown: "",
  //   high_school: "",
  //   hs_coach: "",
  //   hs_coach_phone: "",
  //   previous_colleges: "",
  //   current_grade: "",
  //   bio: "",
  //   achievements: "",
  //   nil_tier: "",
  //   nil_value: "",
  //   total_contract_value: "",
  //   image_url: "",
  //   // Parent information
  //   mother_name: "",
  //   mother_phone: "",
  //   mother_email: "",
  //   mother_occupation: "",
  //   mother_company: "",
  //   mother_address: "",
  //   father_name: "",
  //   father_phone: "",
  //   father_email: "",
  //   father_occupation: "",
  //   father_company: "",
  //   father_address: "",
  //   same_address_as_mother: false,
  //   siblings: "",
  //   // NFL & Draft information
  //   scouting_reports: [{ evaluation: "", grade: "" }],
  //   nfl_feedback: "",
  //   nfl_value: "",
  //   agency_interest: false,
  //   draft_round_projection: "",
  //   draft_selection: "",
  //   nfl_contract_years: "",
  //   nfl_contract_value: "",
  //   nfl_contract_aav: "",
  //   nfl_value_grade: ""
  //
  // });

  // Event management functions
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleEventFulfilledChange = (checked: boolean) => {
    setCurrentEvent(prev => ({ ...prev, fulfilled: checked }));
  };

  const handleAddEvent = () => {
    if (!currentEvent.title || !date) return;

    const newEvent: AthleteEvent = {
      id: Date.now().toString(), // Simple ID generation
      date: date,
      title: currentEvent.title as string,
      description: currentEvent.description,
      fulfilled: currentEvent.fulfilled || false
    };

    setEvents(prev => [...prev, newEvent]);
    setCurrentEvent({ title: "", description: "", fulfilled: false });
    setIsEventDialogOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const handleToggleFulfilled = (id: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === id ? { ...event, fulfilled: !event.fulfilled } : event
      )
    );
  };

  // Toggle expanded scouting report
  const toggleExpandReport = (index: number) => {
    setExpandedReport(prev => prev === index ? null : index);
  };

  // Professional Development handlers
  const handleProfDevChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProfDev(prev => ({ ...prev, [name]: value }));
  };

  const handleProfDevSelectChange = (value: string) => {
    setCurrentProfDev(prev => ({ ...prev, category: value }));
  };

  const handleAddProfDev = () => {
    if (!currentProfDev.category || !date) return;

    const newActivity: ProfessionalDevelopmentActivity = {
      id: Date.now().toString(), // Simple ID generation
      category: currentProfDev.category,
      date: date,
      notes: currentProfDev.notes
    };

    setProfessionalDev(prev => [...prev, newActivity]);
    setCurrentProfDev({ category: "", notes: "" });
    setIsProfDevDialogOpen(false);
  };

  const handleDeleteProfDev = (id: string) => {
    setProfessionalDev(prev => prev.filter(activity => activity.id !== id));
  };


  // Handle scouting report changes
  const handleScoutingReportChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const updatedReports = [...prev.scouting_reports];
      updatedReports[index] = {
        ...updatedReports[index],
        [field]: value
      };
      return { ...prev, scouting_reports: updatedReports };
    });
  };

  // Remove a scouting report
  const removeScoutingReport = (index: number) => {
    setFormData(prev => {
      const updatedReports = prev.scouting_reports.filter((_, i) => i !== index);
      return { ...prev, scouting_reports: updatedReports.length ? updatedReports : [{ evaluation: "", grade: "" }] };
    });
  };



  // Add this below your other state hooks
  const { organizationId, isLoading: isOrgLoading } = useOrganization();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!organizationId) {
      setError("Organization not found. Please refresh or contact support.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Get current user using the more secure getUser method
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to create an athlete");
      }

      // Prepare data for insert
      const athlete = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        college: formData.college,
        nfl_team: formData.nfl_team || null,
        position: formData.position,
        jersey_number: formData.jersey_number ? parseInt(formData.jersey_number) : null,
        height_ft_in: formData.height_ft_in || null,
        weight_lbs: formData.weight_lbs ? parseInt(formData.weight_lbs) : null,
        speed: formData.speed || null,
        hand_size: formData.hand_size || null,
        arm_length: formData.arm_length || null,
        wingspan: formData.wingspan || null,
        hometown: formData.hometown || null,
        high_school: formData.high_school || null,
        hs_coach: formData.hs_coach || null,
        hs_coach_phone: formData.hs_coach_phone || null,
        previous_colleges: formData.previous_colleges 
          ? formData.previous_colleges.split(',').map(c => c.trim()) 
          : null,
        current_grade: formData.current_grade || null,
        bio: formData.bio || null,
        achievements: formData.achievements || null,
        nil_tier: formData.nil_tier || null,
        nil_value: formData.nil_value ? parseInt(formData.nil_value) : null,
        total_contract_value: formData.total_contract_value 
          ? parseInt(formData.total_contract_value) 
          : null,
        image_url: formData.image_url || null,
        org_id: organizationId, // Use the organization ID from context
        // Parent information
        mother_name: formData.mother_name || null,
        mother_phone: formData.mother_phone || null,
        mother_email: formData.mother_email || null,
        mother_occupation: formData.mother_occupation || null,
        mother_company: formData.mother_company || null,
        mother_address: formData.mother_address || null,
        father_name: formData.father_name || null,
        father_phone: formData.father_phone || null,
        father_email: formData.father_email || null,
        father_occupation: formData.father_occupation || null,
        father_company: formData.father_company || null,
        father_address: formData.father_address || null,
        same_address_as_mother: formData.same_address_as_mother,
        siblings: formData.siblings || null,
        // NFL & Draft information
        scouting_reports: formData.scouting_reports.length > 0 ? 
          formData.scouting_reports.filter(report => report.evaluation.trim() !== "") : null,
        nfl_feedback: formData.nfl_feedback || null,
        nfl_value: formData.nfl_value ? parseInt(formData.nfl_value) : null,
        agency_interest: formData.agency_interest || false,
        draft_round_projection: formData.draft_round_projection || null,
        draft_selection: formData.draft_selection || null,
        nfl_contract_years: formData.nfl_contract_years ? parseInt(formData.nfl_contract_years) : null,
        nfl_contract_value: formData.nfl_contract_value ? parseInt(formData.nfl_contract_value) : null,
        nfl_contract_aav: formData.nfl_contract_aav ? parseInt(formData.nfl_contract_aav) : null,
        nfl_value_grade: formData.nfl_value_grade || null,
        // Events as a JSON array
        events: events.length > 0 ? events.map(event => ({
          date: event.date.toISOString(),
          title: event.title,
          description: event.description || null,
          fulfilled: event.fulfilled
        })) : null,
        professional_development: professionalDev.length > 0 ? professionalDev.map(activity => ({
          category: activity.category,
          date: activity.date.toISOString(),
          notes: activity.notes || null
        })) : null
      };

      // Remove duplicate org_id assignment
      const { org_id: _, ...athleteData } = athlete;

      // Insert athlete
      const { error: insertError, data } = await supabase
        .from('athletes')
        .insert({
          ...athleteData,
          org_id: organizationId
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Redirect to athlete page
      router.push(`/dashboard/athletes/${data.id}`);
    } catch (err: any) {
      console.error('Error creating athlete:', err);
      setError(err.message || 'Failed to create athlete. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push("/dashboard/athletes")}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Athletes
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Athlete</h1>
        <p className="text-muted-foreground">
          Enter the details of the new athlete
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="space-y-4 bg-white dark:bg-gray-950 p-4 rounded-lg border flex flex-col">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label htmlFor="position" className="text-xs">Position *</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => handleSelectChange("position", value)}
                  required
                >
                  <SelectTrigger id="position" className="h-8 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="text-sm">
                    {POSITIONS.map(position => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="jersey_number" className="text-xs">Jersey #</Label>
                <Input
                  id="jersey_number"
                  name="jersey_number"
                  placeholder="#"
                  type="number"
                  value={formData.jersey_number}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="college" className="text-xs">College *</Label>
                <Input
                  id="college"
                  name="college"
                  placeholder="College"
                  value={formData.college}
                  onChange={handleChange}
                  required
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="nfl_team" className="text-xs">NFL Team</Label>
                <Input
                  id="nfl_team"
                  name="nfl_team"
                  placeholder="If applicable"
                  value={formData.nfl_team}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_grade">Current Grade</Label>
              <Select
                value={formData.current_grade}
                onValueChange={(value) => handleSelectChange("current_grade", value)}
              >
                <SelectTrigger id="current_grade">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map(grade => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Enter athlete's biography and background information..."
                value={formData.bio}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                className="min-h-[120px] resize-none"
              />
            </div>

            <div className="space-y-2 mt-4 flex-grow">
              <Label htmlFor="achievements">Achievements</Label>
              <Textarea
                id="achievements"
                name="achievements"
                placeholder="Enter athlete's awards, records, notable performances, and accomplishments..."
                value={formData.achievements}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                className="min-h-[120px] flex-grow resize-none"
              />
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-3 bg-white dark:bg-gray-950 p-4 rounded-lg border">
            <h2 className="text-lg font-semibold">Parent Information</h2>

            {/* Mother Information */}
            <div className="space-y-3 border p-3 rounded-md text-sm">
              <h3 className="font-medium text-base">Mother</h3>

              {/* Name, Phone, Email on one line */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="mother_name" className="text-xs">Name</Label>
                  <Input
                    id="mother_name"
                    name="mother_name"
                    placeholder="Full Name"
                    value={formData.mother_name}
                    onChange={handleChange}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mother_phone" className="text-xs">Phone</Label>
                  <Input
                    id="mother_phone"
                    name="mother_phone"
                    placeholder="Phone Number"
                    value={formData.mother_phone}
                    onChange={handleChange}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mother_email" className="text-xs">Email</Label>
                  <Input
                    id="mother_email"
                    name="mother_email"
                    placeholder="Email Address"
                    type="email"
                    value={formData.mother_email}
                    onChange={handleChange}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Occupation and Company */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="mother_occupation" className="text-xs">Occupation</Label>
                  <Input
                    id="mother_occupation"
                    name="mother_occupation"
                    placeholder="Occupation"
                    value={formData.mother_occupation}
                    onChange={handleChange}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mother_company" className="text-xs">Company</Label>
                  <Input
                    id="mother_company"
                    name="mother_company"
                    placeholder="Company"
                    value={formData.mother_company}
                    onChange={handleChange}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <Label htmlFor="mother_address" className="text-xs">Address</Label>
                <Textarea
                  id="mother_address"
                  name="mother_address"
                  placeholder="Full address"
                  value={formData.mother_address}
                  onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                  className="min-h-[60px] resize-none text-sm"
                />
              </div>
            </div>

            {/* Father Information */}
            <div className="space-y-3 border p-3 rounded-md text-sm">
              <h3 className="font-medium text-base">Father</h3>

              {/* Name, Phone, Email on one line */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="father_name" className="text-xs">Name</Label>
                  <Input
                    id="father_name"
                    name="father_name"
                    placeholder="Full Name"
                    value={formData.father_name}
                    onChange={handleChange}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="father_phone" className="text-xs">Phone</Label>
                  <Input
                    id="father_phone"
                    name="father_phone"
                    placeholder="Phone Number"
                    value={formData.father_phone}
                    onChange={handleChange}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="father_email" className="text-xs">Email</Label>
                  <Input
                    id="father_email"
                    name="father_email"
                    placeholder="Email Address"
                    type="email"
                    value={formData.father_email}
                    onChange={handleChange}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Occupation and Company */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="father_occupation" className="text-xs">Occupation</Label>
                  <Input
                    id="father_occupation"
                    name="father_occupation"
                    placeholder="Occupation"
                    value={formData.father_occupation}
                    onChange={handleChange}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="father_company" className="text-xs">Company</Label>
                  <Input
                    id="father_company"
                    name="father_company"
                    placeholder="Company"
                    value={formData.father_company}
                    onChange={handleChange}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="father_address" className="text-xs">Address</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="same_address_as_mother"
                      name="same_address_as_mother"
                      checked={formData.same_address_as_mother}
                      onCheckedChange={(checked) => {
                        if (checked === true) {
                          setFormData(prev => ({
                            ...prev,
                            same_address_as_mother: true,
                            father_address: prev.mother_address
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            same_address_as_mother: false
                          }));
                        }
                      }}
                      className="h-3 w-3"
                    />
                    <Label htmlFor="same_address_as_mother" className="text-xs font-normal text-muted-foreground">
                      Same as mother
                    </Label>
                  </div>
                </div>
                <Textarea
                  id="father_address"
                  name="father_address"
                  placeholder="Full address"
                  value={formData.father_address}
                  onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                  className="min-h-[60px] resize-none text-sm"
                  disabled={formData.same_address_as_mother}
                />
              </div>
            </div>

            {/* Siblings Information */}
            <div className="space-y-1 text-sm">
              <Label htmlFor="siblings" className="text-xs">Siblings</Label>
              <Textarea
                id="siblings"
                name="siblings"
                placeholder="Enter siblings information (names, ages, etc.)"
                value={formData.siblings}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                className="min-h-[60px] text-sm"
              />
            </div>
          </div>

          {/* Physical & Background */}
                      <div className="space-y-3 bg-white dark:bg-gray-950 p-4 rounded-lg border text-sm">
            <h2 className="text-lg font-semibold">Physical & Background</h2>

            {/* Height, Weight, Speed */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="height_ft_in" className="text-xs">Height (ft&apos;in&quot;)</Label>
                <Input
                  id="height_ft_in"
                  name="height_ft_in"
                  placeholder="6'2\"
                  value={formData.height_ft_in}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="weight_lbs" className="text-xs">Weight (lbs)</Label>
                <Input
                  id="weight_lbs"
                  name="weight_lbs"
                  placeholder="195"
                  type="number"
                  value={formData.weight_lbs}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="speed" className="text-xs">Speed (40yd)</Label>
                <Input
                  id="speed"
                  name="speed"
                  placeholder="4.56"
                  value={formData.speed}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Hand, Arm, Wingspan */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="hand_size" className="text-xs">Hand Size (4-digit)</Label>
                <Input
                  id="hand_size"
                  name="hand_size"
                  placeholder="0912"
                  maxLength={4}
                  value={formData.hand_size}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="arm_length" className="text-xs">Arm Length (4-digit)</Label>
                <Input
                  id="arm_length"
                  name="arm_length"
                  placeholder="3275"
                  maxLength={4}
                  value={formData.arm_length}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="wingspan" className="text-xs">Wingspan (4-digit)</Label>
                <Input
                  id="wingspan"
                  name="wingspan"
                  placeholder="8172"
                  maxLength={4}
                  value={formData.wingspan}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Hometown and High School */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="hometown" className="text-xs">Hometown</Label>
                <Input
                  id="hometown"
                  name="hometown"
                  placeholder="Hometown"
                  value={formData.hometown}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="high_school" className="text-xs">High School</Label>
                <Input
                  id="high_school"
                  name="high_school"
                  placeholder="High School"
                  value={formData.high_school}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* HS Coach and Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="hs_coach" className="text-xs">HS Coach</Label>
                <Input
                  id="hs_coach"
                  name="hs_coach"
                  placeholder="Coach Name"
                  value={formData.hs_coach}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="hs_coach_phone" className="text-xs">HS Coach Cell</Label>
                <Input
                  id="hs_coach_phone"
                  name="hs_coach_phone"
                  placeholder="(555) 123-4567"
                  value={formData.hs_coach_phone}
                  onChange={handleChange}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Previous Colleges */}
            <div className="space-y-1">
              <Label htmlFor="previous_colleges" className="text-xs">Previous Colleges</Label>
              <Input
                id="previous_colleges"
                name="previous_colleges"
                placeholder="Comma-separated list"
                value={formData.previous_colleges}
                onChange={handleChange}
                className="h-8 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple colleges with commas
              </p>
            </div>

            {/* Professional Development */}
            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Professional Development</h3>
                <Dialog open={isProfDevDialogOpen} onOpenChange={setIsProfDevDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Professional Development</DialogTitle>
                      <DialogDescription>
                        Record a professional development activity or training
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="prof-dev-category">Category *</Label>
                        <Select
                          value={currentProfDev.category}
                          onValueChange={handleProfDevSelectChange}
                        >
                          <SelectTrigger id="prof-dev-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROFESSIONAL_DEVELOPMENT_CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prof-dev-date">Date Attended *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prof-dev-notes">Notes</Label>
                        <Textarea
                          id="prof-dev-notes"
                          name="notes"
                          placeholder="Add notes about the activity"
                          value={currentProfDev.notes || ""}
                          onChange={handleProfDevChange}
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsProfDevDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleAddProfDev}>
                        Add Activity
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {professionalDev.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {professionalDev.map(activity => (
                        <TableRow key={activity.id}>
                          <TableCell className="font-medium">{activity.category}</TableCell>
                          <TableCell>{format(activity.date, "MMM d, yyyy")}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {activity.notes || "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProfDev(activity.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs text-center py-3">
                  No professional development activities recorded yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* NIL & Additional Information */}
        <div className="pt-4 border-t grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">NIL & Additional Information</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="nil_tier">NIL Tier</Label>
                <Select
                  value={formData.nil_tier}
                  onValueChange={(value) => handleSelectChange("nil_tier", value)}
                >
                  <SelectTrigger id="nil_tier">
                    <SelectValue placeholder="Select NIL Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {NIL_TIERS.map(tier => (
                      <SelectItem key={tier} value={tier}>
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nil_value">NIL Value ($)</Label>
                <Input
                  id="nil_value"
                  name="nil_value"
                  placeholder="NIL Value"
                  type="number"
                  value={formData.nil_value}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_contract_value">Total Contract Value ($)</Label>
                <Input
                  id="total_contract_value"
                  name="total_contract_value"
                  placeholder="Total Contract Value"
                  type="number"
                  value={formData.total_contract_value}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Profile Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  placeholder="Image URL"
                  value={formData.image_url}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* NFL & Draft Information */}
          <div className="space-y-4 bg-white dark:bg-gray-950 p-4 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">NFL & Draft Information</h2>

            {/* Scouting Reports */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Player Scouting Reports</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      scouting_reports: [...prev.scouting_reports, { evaluation: "", grade: "" }]
                    }));
                  }}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Report
                </Button>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                {formData.scouting_reports.map((report, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex-1 cursor-pointer" onClick={() => toggleExpandReport(index)}>
                        <div className="flex justify-between items-center">
                          <div className="truncate flex-1">
                            {report.evaluation ? 
                              (expandedReport === index ? report.evaluation : report.evaluation.substring(0, 50) + (report.evaluation.length > 50 ? "..." : "")) : 
                              <span className="text-muted-foreground italic">No evaluation</span>
                            }
                          </div>
                          <div className="flex items-center ml-2">
                            {report.grade && (
                              <Badge variant="outline" className="mr-2">
                                Grade: {report.grade}
                              </Badge>
                            )}
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedReport === index ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeScoutingReport(index)}
                        className="ml-2 h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {expandedReport === index && (
                      <div className="space-y-2 mt-3 pt-3 border-t">
                        <div className="space-y-2">
                          <Label htmlFor={`report-${index}-evaluation`}>Evaluation</Label>
                          <Textarea
                            id={`report-${index}-evaluation`}
                            value={report.evaluation}
                            onChange={(e) => handleScoutingReportChange(index, 'evaluation', e.target.value)}
                            placeholder="Enter scouting evaluation..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`report-${index}-grade`}>Grade</Label>
                          <Input
                            id={`report-${index}-grade`}
                            value={report.grade}
                            onChange={(e) => handleScoutingReportChange(index, 'grade', e.target.value)}
                            placeholder="A+, A, B+, etc."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* NFL Feedback */}
            <div className="space-y-2">
              <Label htmlFor="nfl_feedback">NFL Scouting Feedback</Label>
              <Textarea
                id="nfl_feedback"
                name="nfl_feedback"
                placeholder="Enter any NFL scouting feedback..."
                value={formData.nfl_feedback}
                onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)}
                className="min-h-[80px]"
              />
            </div>

            {/* NFL Value and Agency Interest */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nfl_value">NFL Value ($)</Label>
                <Input
                  id="nfl_value"
                  name="nfl_value"
                  placeholder="NFL Value"
                  type="number"
                  value={formData.nfl_value}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-end pb-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="agency_interest"
                    name="agency_interest"
                    checked={formData.agency_interest}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({ ...prev, agency_interest: checked === true }))
                    }}
                  />
                  <Label htmlFor="agency_interest" className="font-medium">
                    Agency Interest for NFL Representation
                  </Label>
                </div>
              </div>
            </div>

            {/* Draft Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="draft_round_projection">Round Projection</Label>
                <Select
                  value={formData.draft_round_projection}
                  onValueChange={(value) => handleSelectChange("draft_round_projection", value)}
                >
                  <SelectTrigger id="draft_round_projection">
                    <SelectValue placeholder="Select Round" />
                  </SelectTrigger>
                  <SelectContent>
                    {DRAFT_ROUNDS.map(round => (
                      <SelectItem key={round} value={round}>
                        {round}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="draft_selection">Draft Selection</Label>
                <Input
                  id="draft_selection"
                  name="draft_selection"
                  placeholder="e.g., '1st Round, Pick 12'"
                  value={formData.draft_selection}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* NFL Contract Information */}
            <div className="space-y-4 border-t pt-4 mt-4">
              <Label className="text-base font-medium">NFL Contract Details</Label>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nfl_contract_years">Years</Label>
                  <Input
                    id="nfl_contract_years"
                    name="nfl_contract_years"
                    placeholder="Years"
                    type="number"
                    value={formData.nfl_contract_years}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nfl_contract_value">Total Value ($)</Label>
                  <Input
                    id="nfl_contract_value"
                    name="nfl_contract_value"
                    placeholder="Total Value"
                    type="number"
                    value={formData.nfl_contract_value}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nfl_contract_aav">AAV ($)</Label>
                  <Input
                    id="nfl_contract_aav"
                    name="nfl_contract_aav"
                    placeholder="Average Annual Value"
                    type="number"
                    value={formData.nfl_contract_aav}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nfl_value_grade">Contract Value Grade</Label>
                <Select
                  value={formData.nfl_value_grade}
                  onValueChange={(value) => handleSelectChange("nfl_value_grade", value)}
                >
                  <SelectTrigger id="nfl_value_grade">
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {NFL_VALUE_GRADES.map(grade => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Calendar and Events */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Schedule & Events</h2>
              <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>
                      Schedule a new event for this athlete
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="event-date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-title">Event Title*</Label>
                      <Input
                        id="event-title"
                        name="title"
                        placeholder="Event title"
                        value={currentEvent.title}
                        onChange={handleEventChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="event-description">Description</Label>
                      <Textarea
                        id="event-description"
                        name="description"
                        placeholder="Event details"
                        value={currentEvent.description || ""}
                        onChange={handleEventChange}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="event-fulfilled"
                        checked={currentEvent.fulfilled}
                        onCheckedChange={handleEventFulfilledChange}
                      />
                      <Label htmlFor="event-fulfilled">
                        Already fulfilled
                      </Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleAddEvent}>
                      Add Event
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-md p-4 bg-white dark:bg-gray-950">
              <div className="mb-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>

              <div>
                <h3 className="font-medium mb-2">Upcoming Events</h3>
                {events.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Event</TableHead>
                          <TableHead>Fulfilled</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map(event => (
                          <TableRow key={event.id}>
                            <TableCell>{format(event.date, "MMM d, yyyy")}</TableCell>
                            <TableCell>
                              <div className="font-medium">{event.title}</div>
                              {event.description && (
                                <div className="text-xs text-muted-foreground line-clamp-1">{event.description}</div>
                              )}
                            </TableCell>
                            <TableCell>
                              <button 
                                type="button" 
                                onClick={() => handleToggleFulfilled(event.id)}
                                className={`p-1 rounded-full ${event.fulfilled ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}
                              >
                                {event.fulfilled ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                              </button>
                            </TableCell>
                            <TableCell>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No events scheduled yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/athletes")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Athlete"}
          </Button>
        </div>
      </form>
    </div>
  );
}
