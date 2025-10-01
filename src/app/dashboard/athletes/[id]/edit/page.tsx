"use client";

import { useState, useEffect } from "react";
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

import { AthleteEvent } from "@/types/athlete";

// Modified AthleteEvent for form state (with Date object instead of string)
type FormAthleteEvent = Omit<AthleteEvent, 'date'> & {
  id: string;
  date: Date;
  description?: string | null;
};

// Modified ProfessionalDevelopmentActivity for form state (with Date object instead of string)
type FormProfessionalDevelopmentActivity = {
  id: string;
  category: string;
  date: Date;
  notes?: string | null;
};

interface EditAthletePageProps {
  params: {
    id: string;
  };
}

export default function EditAthletePage({ params }: EditAthletePageProps) {
  const { id } = params;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<FormAthleteEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Partial<FormAthleteEvent>>({
    title: "",
    description: "",
    fulfilled: false
  });
  const [expandedReport, setExpandedReport] = useState<number | null>(null);
  const [professionalDev, setProfessionalDev] = useState<FormProfessionalDevelopmentActivity[]>([]);
  const [isProfDevDialogOpen, setIsProfDevDialogOpen] = useState(false);
  const [currentProfDev, setCurrentProfDev] = useState<Partial<FormProfessionalDevelopmentActivity>>({
    category: "",
    notes: ""
  });

  // Brand Partnerships state
  const [brandPartnerships, setBrandPartnerships] = useState<any[]>([]);
  const [isPartnershipDialogOpen, setIsPartnershipDialogOpen] = useState(false);
  const [currentPartnership, setCurrentPartnership] = useState({
    id: "",
    date: new Date(),
    company: "",
    details: "",
    monetary_value: "",
    inkind_value: "",
    obligations: "",
    status: "active"
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

  // Get organization ID for the form
  const { organizationId, isLoading: isOrgLoading } = useOrganization();

  // Fetch athlete data
  useEffect(() => {
    async function fetchAthlete() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("athletes")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        // Convert database data to form format
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          college: data.college || "",
          nfl_team: data.nfl_team || "",
          position: data.position || "",
          jersey_number: data.jersey_number?.toString() || "",
          height_ft_in: data.height_ft_in || "",
          weight_lbs: data.weight_lbs?.toString() || "",
          speed: data.speed || "",
          hand_size: data.hand_size || "",
          arm_length: data.arm_length || "",
          wingspan: data.wingspan || "",
          hometown: data.hometown || "",
          high_school: data.high_school || "",
          hs_coach: data.hs_coach || "",
          hs_coach_phone: data.hs_coach_phone || "",
          previous_colleges: data.previous_colleges ? data.previous_colleges.join(', ') : "",
          current_grade: data.current_grade || "",
          bio: data.bio || "",
          achievements: data.achievements || "",
          nil_tier: data.nil_tier || "",
          nil_value: data.nil_value?.toString() || "",
          total_contract_value: data.total_contract_value?.toString() || "",
          image_url: data.image_url || "",
          mother_name: data.mother_name || "",
          mother_phone: data.mother_phone || "",
          mother_email: data.mother_email || "",
          mother_occupation: data.mother_occupation || "",
          mother_company: data.mother_company || "",
          mother_address: data.mother_address || "",
          father_name: data.father_name || "",
          father_phone: data.father_phone || "",
          father_email: data.father_email || "",
          father_occupation: data.father_occupation || "",
          father_company: data.father_company || "",
          father_address: data.father_address || "",
          same_address_as_mother: data.same_address_as_mother || false,
          siblings: data.siblings || "",
          scouting_reports: data.scouting_reports 
            ? Array.isArray(data.scouting_reports) 
              ? data.scouting_reports 
              : [{ evaluation: "", grade: "" }]
            : [{ evaluation: "", grade: "" }],
          nfl_feedback: data.nfl_feedback || "",
          nfl_value: data.nfl_value?.toString() || "",
          agency_interest: data.agency_interest || false,
          draft_round_projection: data.draft_round_projection || "",
          draft_selection: data.draft_selection || "",
          nfl_contract_years: data.nfl_contract_years?.toString() || "",
          nfl_contract_value: data.nfl_contract_value?.toString() || "",
          nfl_contract_aav: data.nfl_contract_aav?.toString() || "",
          nfl_value_grade: data.nfl_value_grade || ""
        });

        // Handle events if they exist
        if (data.events && Array.isArray(data.events)) {
          const parsedEvents = data.events.map(evt => ({
            id: evt.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
            date: new Date(evt.date),
            title: evt.title,
            description: evt.description || undefined,
            fulfilled: evt.fulfilled || false
          }));
          setEvents(parsedEvents);
        }

        // Handle professional development if it exists
        if (data.professional_development && Array.isArray(data.professional_development)) {
          const parsedProfDev = data.professional_development.map(item => ({
            id: item.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
            category: item.category,
            date: new Date(item.date),
            notes: item.notes || undefined
          }));
          setProfessionalDev(parsedProfDev);
        }

        // Handle brand partnerships if they exist
        if (data.brand_partnerships && Array.isArray(data.brand_partnerships)) {
          const parsedPartnerships = data.brand_partnerships.map(partnership => ({
            id: partnership.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
            date: new Date(partnership.date),
            company: partnership.company,
            details: partnership.details,
            monetary_value: partnership.monetary_value?.toString() || "",
            inkind_value: partnership.inkind_value?.toString() || "",
            obligations: partnership.obligations || "",
            status: partnership.status
          }));
          setBrandPartnerships(parsedPartnerships);
        }
      } catch (err: any) {
        console.error("Error fetching athlete:", err);
        setError("Failed to load athlete details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAthlete();
  }, [id]);

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

    const newEvent: FormAthleteEvent = {
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

    const newActivity: FormProfessionalDevelopmentActivity = {
      id: Date.now().toString(), // Simple ID generation
      category: currentProfDev.category,
      date: date,
      notes: currentProfDev.notes || null
    };

    setProfessionalDev(prev => [...prev, newActivity]);
    setCurrentProfDev({ category: "", notes: "" });
    setIsProfDevDialogOpen(false);
  };

  const handleDeleteProfDev = (id: string) => {
    setProfessionalDev(prev => prev.filter(activity => activity.id !== id));
  };

  // Partnership handlers
  const handlePartnershipChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentPartnership(prev => ({ ...prev, [name]: value }));
  };

  const handlePartnershipSelectChange = (value: string) => {
    setCurrentPartnership(prev => ({ ...prev, status: value }));
  };

  const handleAddPartnership = () => {
    if (!currentPartnership.company || !date) return;

    const newPartnership = {
      id: Date.now().toString(),
      date: date,
      company: currentPartnership.company,
      details: currentPartnership.details,
      monetary_value: currentPartnership.monetary_value ? parseInt(currentPartnership.monetary_value) : null,
      inkind_value: currentPartnership.inkind_value ? parseInt(currentPartnership.inkind_value) : null,
      obligations: currentPartnership.obligations || null,
      status: currentPartnership.status
    };

    setBrandPartnerships(prev => [...prev, newPartnership]);
    setCurrentPartnership({
      id: "",
      date: new Date(),
      company: "",
      details: "",
      monetary_value: "",
      inkind_value: "",
      obligations: "",
      status: "active"
    });
    setIsPartnershipDialogOpen(false);
  };

  const handleDeletePartnership = (id: string) => {
    setBrandPartnerships(prev => prev.filter(partnership => partnership.id !== id));
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

  // Handle form submission for updating athlete
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user using the more secure getUser method
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to update an athlete");
      }

      // Prepare data for update
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
          id: event.id,
          date: event.date.toISOString(),
          title: event.title,
          description: event.description || null,
          fulfilled: event.fulfilled
        })) : null,
        professional_development: professionalDev.length > 0 ? professionalDev.map(activity => ({
          id: activity.id,
          category: activity.category,
          date: activity.date.toISOString(),
          notes: activity.notes || null
        })) : null,
        brand_partnerships: brandPartnerships.length > 0 ? brandPartnerships.map(partnership => ({
          id: partnership.id,
          date: partnership.date.toISOString(),
          company: partnership.company,
          details: partnership.details,
          monetary_value: partnership.monetary_value ? parseInt(partnership.monetary_value) : null,
          inkind_value: partnership.inkind_value ? parseInt(partnership.inkind_value) : null,
          obligations: partnership.obligations || null,
          status: partnership.status
        })) : null
      };

      // Update athlete
      const { error: updateError } = await supabase
        .from('athletes')
        .update(athlete)
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Redirect to athlete page
      router.push(`/dashboard/athletes/${id}`);
    } catch (err: any) {
      console.error('Error updating athlete:', err);
      setError(err.message || 'Failed to update athlete. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push(`/dashboard/athletes/${id}`)}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Athlete
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Athlete</h1>
        <p className="text-muted-foreground">
          Update the details of {formData.first_name} {formData.last_name}
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
                <Label htmlFor="hand_size" className="text-xs">Hand Size</Label>
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
                <Label htmlFor="arm_length" className="text-xs">Arm Length</Label>
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
                <Label htmlFor="wingspan" className="text-xs">Wingspan</Label>
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

          {/* Brand Partnerships Section */}
          <div className="space-y-4 border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Brand Partnerships</Label>
              <Dialog open={isPartnershipDialogOpen} onOpenChange={setIsPartnershipDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Partnership
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Brand Partnership</DialogTitle>
                    <DialogDescription>
                      Enter the details of the brand partnership.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="partnership-date">Date *</Label>
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
                      <Label htmlFor="partnership-company">Company *</Label>
                      <Input
                        id="partnership-company"
                        name="company"
                        placeholder="Company name"
                        value={currentPartnership.company}
                        onChange={handlePartnershipChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnership-details">Details *</Label>
                      <Textarea
                        id="partnership-details"
                        name="details"
                        placeholder="Partnership details"
                        value={currentPartnership.details}
                        onChange={handlePartnershipChange}
                        required
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="partnership-monetary">Monetary Value ($)</Label>
                        <Input
                          id="partnership-monetary"
                          name="monetary_value"
                          placeholder="0.00"
                          type="number"
                          value={currentPartnership.monetary_value}
                          onChange={handlePartnershipChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="partnership-inkind">In-kind Value ($)</Label>
                        <Input
                          id="partnership-inkind"
                          name="inkind_value"
                          placeholder="0.00"
                          type="number"
                          value={currentPartnership.inkind_value}
                          onChange={handlePartnershipChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnership-obligations">Obligations</Label>
                      <Textarea
                        id="partnership-obligations"
                        name="obligations"
                        placeholder="Posting, signing, appearances, etc."
                        value={currentPartnership.obligations || ""}
                        onChange={handlePartnershipChange}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="partnership-status">Status</Label>
                      <Select
                        value={currentPartnership.status}
                        onValueChange={handlePartnershipSelectChange}
                      >
                        <SelectTrigger id="partnership-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsPartnershipDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleAddPartnership}>
                      Add Partnership
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {brandPartnerships.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brandPartnerships.map(partnership => (
                      <TableRow key={partnership.id}>
                        <TableCell>{format(partnership.date, "MMM d, yyyy")}</TableCell>
                        <TableCell className="font-medium">{partnership.company}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {partnership.details}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            partnership.status === 'active' ? 'default' :
                            partnership.status === 'completed' ? 'success' :
                            partnership.status === 'pending' ? 'secondary' :
                            'outline'
                          }>
                            {partnership.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePartnership(partnership.id)}
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
                No brand partnerships recorded yet
              </p>
            )}
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
                <h3 className="font-medium mb-2">Events</h3>
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
            onClick={() => router.push(`/dashboard/athletes/${id}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>

  );
}
