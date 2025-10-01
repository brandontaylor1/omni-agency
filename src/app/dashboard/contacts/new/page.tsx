"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from '@/contexts/OrganizationContext';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export default function NewContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { organizationId, isLoading: isOrgLoading } = useOrganization();

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    department: "",
    location: "",
    website: "",
    contact_type: "",
    notes: "",
    image_url: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to create a contact");
      }

      // Insert contact
      const { error: insertError, data } = await supabase
        .from('contacts')
        .insert({
          ...formData,
          org_id: organizationId,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Redirect to contact page
      router.push(`/dashboard/contacts/${data.id}`);
    } catch (err: any) {
      console.error('Error creating contact:', err);
      setError(err.message || 'Failed to create contact. Please try again.');
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
          onClick={() => router.push("/dashboard/contacts")}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contacts
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Contact</h1>
        <p className="text-muted-foreground">
          Enter the details of the new contact
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-950 p-6 rounded-lg border">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Import and use ContactForm component here */}
        </form>
      </div>
    </div>
  );
}
