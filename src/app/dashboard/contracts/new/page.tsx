"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarIcon, Trash } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
  SelectValue,
} from "@/components/ui/select";
import {
  CONTRACT_TYPES,
  CONTRACT_STATUSES,
  PaymentSchedule
} from "@/types/contract";
import { supabase } from "@/lib/supabase/client";
import { Athlete } from "@/types/athlete";

export default function NewContractPage() {
  const router = useRouter();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    athlete_id: "",
    partner: "",
    type: "nil" as const, // Default to NIL
    value: "",
    start_date: new Date(),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 12)), // Default to 1 year
    status: "draft" as const,
    notes: "",
    terms_document_url: "",
    payment_schedule: [] as PaymentSchedule[],
  });

  // Fetch athletes for dropdown
  useEffect(() => {
    async function fetchAthletes() {
      try {
        const { data, error } = await supabase
          .from("athletes")
          .select("id, first_name, last_name, position")
          .order("first_name");

        if (error) {
          throw error;
        }

        setAthletes(data || []);
      } catch (err: any) {
        console.error("Error fetching athletes:", err);
        setError("Failed to load athletes. Please try again.");
      }
    }

    fetchAthletes();
  }, []);

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: date }));
    }
  };

  // Payment schedule handlers
  const addPayment = () => {
    // Add a new payment 3 months from the previous payment or start date
    const lastDate = formData.payment_schedule.length > 0 
      ? new Date(formData.payment_schedule[formData.payment_schedule.length - 1].due_date)
      : new Date(formData.start_date);

    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + 3);

    // Calculate default amount (divide remaining value equally)
    const totalPaid = formData.payment_schedule.reduce((sum, payment) => sum + payment.amount, 0);
    const remainingValue = parseFloat(formData.value) - totalPaid;
    const remainingPayments = formData.payment_schedule.length > 0 ? formData.payment_schedule.length : 1;
    const defaultAmount = remainingValue / (remainingPayments + 1);

    const newPayment: PaymentSchedule = {
      amount: Math.round(defaultAmount * 100) / 100, // Round to 2 decimal places
      due_date: nextDate.toISOString().split('T')[0],
      description: `Payment ${formData.payment_schedule.length + 1}`,
      paid: false
    };

    setFormData(prev => ({
      ...prev,
      payment_schedule: [...prev.payment_schedule, newPayment]
    }));
  };

  const updatePayment = (index: number, field: keyof PaymentSchedule, value: any) => {
    setFormData(prev => {
      const updatedSchedule = [...prev.payment_schedule];
      updatedSchedule[index] = {
        ...updatedSchedule[index],
        [field]: value
      };
      return { ...prev, payment_schedule: updatedSchedule };
    });
  };

  const removePayment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      payment_schedule: prev.payment_schedule.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to create a contract");
      }

      // Get the user's organization
      const { data: orgMember, error: orgError } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id)
        .single();

      if (orgError || !orgMember) {
        throw new Error("Failed to find your organization");
      }

      // Validate required fields
      if (!formData.title || !formData.athlete_id || !formData.partner || !formData.value) {
        throw new Error("Please fill in all required fields");
      }

      // Format dates
      const startDate = format(formData.start_date, "yyyy-MM-dd");
      const endDate = format(formData.end_date, "yyyy-MM-dd");

      // Prepare data for insert
      const contract = {
        title: formData.title,
        athlete_id: formData.athlete_id,
        partner: formData.partner,
        type: formData.type,
        value: parseFloat(formData.value),
        start_date: startDate,
        end_date: endDate,
        status: formData.status,
        notes: formData.notes || null,
        terms_document_url: formData.terms_document_url || null,
        payment_schedule: formData.payment_schedule,
        created_by: user.id,
        org_id: orgMember.org_id
      };

      // Insert contract
      const { error: insertError, data } = await supabase
        .from('contracts')
        .insert(contract)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Redirect to contract page
      router.push(`/dashboard/contracts/${data.id}`);
    } catch (err: any) {
      console.error('Error creating contract:', err);
      setError(err.message || 'Failed to create contract. Please try again.');
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
          onClick={() => router.push("/dashboard/contracts")}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Contract</h1>
        <p className="text-muted-foreground">
          Create a new contract or endorsement deal
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Contract Information */}
          <div className="space-y-4 bg-white dark:bg-gray-950 p-6 rounded-lg border">
            <h2 className="text-lg font-semibold">Contract Details</h2>

            <div className="space-y-2">
              <Label htmlFor="title">Contract Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter contract title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="athlete_id">Athlete *</Label>
              <Select
                value={formData.athlete_id}
                onValueChange={(value) => handleSelectChange("athlete_id", value)}
                required
              >
                <SelectTrigger id="athlete_id">
                  <SelectValue placeholder="Select Athlete" />
                </SelectTrigger>
                <SelectContent>
                  {athletes.map(athlete => (
                    <SelectItem key={athlete.id} value={athlete.id}>
                      {athlete.first_name} {athlete.last_name} - {athlete.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="partner">Partner/Company *</Label>
              <Input
                id="partner"
                name="partner"
                placeholder="Enter partner or company name"
                value={formData.partner}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Contract Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange("type", value)}
                  required
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTRACT_STATUSES.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(formData.start_date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => handleDateChange("start_date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date ? format(formData.end_date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) => handleDateChange("end_date", date)}
                      initialFocus
                      fromDate={formData.start_date}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Total Value ($) *</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                placeholder="Enter total contract value"
                value={formData.value}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms_document_url">Terms Document URL</Label>
              <Input
                id="terms_document_url"
                name="terms_document_url"
                placeholder="Enter URL to contract terms document"
                value={formData.terms_document_url}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">Link to the signed contract PDF or document</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Enter any additional notes about this contract"
                value={formData.notes}
                onChange={handleChange}
                className="min-h-[100px]"
              />
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="space-y-4 bg-white dark:bg-gray-950 p-6 rounded-lg border">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Payment Schedule</h2>
              <Button 
                type="button" 
                variant="outline" 
                onClick={addPayment}
                className="text-sm"
              >
                Add Payment
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Define how the contract value will be paid out over time</p>

            {formData.payment_schedule.length === 0 ? (
              <div className="border rounded-md p-8 text-center text-muted-foreground">
                <p>No payment schedule defined.</p>
                <p className="text-sm mt-2">Add payments to track when funds are due.</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {formData.payment_schedule.map((payment, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Payment {index + 1}</h3>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removePayment(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor={`payment-amount-${index}`} className="text-sm">
                          Amount ($)
                        </Label>
                        <Input
                          id={`payment-amount-${index}`}
                          type="number"
                          step="0.01"
                          value={payment.amount}
                          onChange={(e) => updatePayment(index, "amount", parseFloat(e.target.value))}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`payment-date-${index}`} className="text-sm">
                          Due Date
                        </Label>
                        <Input
                          id={`payment-date-${index}`}
                          type="date"
                          value={payment.due_date}
                          onChange={(e) => updatePayment(index, "due_date", e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`payment-desc-${index}`} className="text-sm">
                        Description
                      </Label>
                      <Input
                        id={`payment-desc-${index}`}
                        value={payment.description || ""}
                        onChange={(e) => updatePayment(index, "description", e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-2 text-sm">
                  <div>
                    <span className="font-medium">Total Scheduled:</span>{" "}
                    <span className="text-muted-foreground">
                      ${formData.payment_schedule.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Contract Value:</span>{" "}
                    <span className="text-muted-foreground">
                      ${formData.value || "0.00"}
                    </span>
                  </div>
                </div>

                {parseFloat(formData.value) > 0 &&
                  Math.abs(
                    parseFloat(formData.value) - 
                    formData.payment_schedule.reduce((sum, payment) => sum + payment.amount, 0)
                  ) > 0.01 && (
                    <p className="text-sm text-amber-500">
                      Warning: The total scheduled payments don't match the contract value.
                    </p>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/contracts")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Contract"}
          </Button>
        </div>
      </form>
    </div>
  );
}
