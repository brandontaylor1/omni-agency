"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Contact, CONTACT_TYPES, ContactType } from "@/types/contact";
import { supabase } from "@/lib/supabase/client";

interface ContactFormProps {
  contact?: Contact | null;
  onSuccess?: (contact: Contact) => void;
  onCancel?: () => void;
}

export function ContactForm({ contact, onSuccess, onCancel }: ContactFormProps) {
  const router = useRouter();
  const { organizationId, isLoading: isOrgLoading } = useOrganization();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: contact?.first_name || "",
    last_name: contact?.last_name || "",
    email: contact?.email || "",
    phone: contact?.phone || "",
    company: contact?.company || "",
    title: contact?.title || "",
    department: contact?.department || "",
    location: contact?.location || "",
    website: contact?.website || "",
    contact_type: contact?.contact_type ?? null,
    notes: contact?.notes || "",
    image_url: contact?.image_url || "",
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
        throw new Error("You must be logged in to save a contact");
      }

      const contactData = {
        ...formData,
        org_id: organizationId,
      };

      let response;

      if (contact?.id) {
        // Update existing contact
        response = await supabase
          .from("contacts")
          .update(contactData)
          .eq("id", contact.id)
          .select()
          .single();
      } else {
        // Create new contact
        response = await supabase
          .from("contacts")
          .insert({
            ...contactData,
            created_by: user.id,
          })
          .select()
          .single();
      }

      if (response.error) {
        throw response.error;
      }

      if (onSuccess && response.data) {
        onSuccess(response.data);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      console.error("Error saving contact:", err);
      setError(err.message || "Failed to save contact. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            name="first_name"
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
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title/Position</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_type">Contact Type</Label>
          <Select
              value={formData.contact_type ?? undefined}
              onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    contact_type: value as ContactType,
                  }))
              }
          >
            <SelectTrigger id="contact_type">
              <SelectValue placeholder="Select contact type" />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">Profile Image URL</Label>
        <Input
          id="image_url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          placeholder="Additional notes about this contact..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isOrgLoading}>
          {isSubmitting ? "Saving..." : contact ? "Save Changes" : "Add Contact"}
        </Button>
      </div>
    </form>
  );
}
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Contact, CONTACT_TYPES } from "@/types/contact";
// import { supabase } from "@/lib/supabase/client";
// import { useOrganization } from "@/contexts/OrganizationContext";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from "@/components/ui/select";
//
// interface ContactFormProps {
//   contact?: Contact | null;
//   onSuccess?: (contact: Contact) => void;
//   onCancel?: () => void;
// }
//
// export function ContactForm({ contact, onSuccess, onCancel }: ContactFormProps) {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { organizationId } = useOrganization();
//
//   const [formData, setFormData] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone: "",
//     contact_type: "",
//     company: "",
//     title: "",
//     department: "",
//     location: "",
//     website: "",
//     notes: "",
//     image_url: "",
//   });
//
//   useEffect(() => {
//     // If editing an existing contact, populate form data
//     if (contact) {
//       setFormData({
//         first_name: contact.first_name || "",
//         last_name: contact.last_name || "",
//         email: contact.email || "",
//         phone: contact.phone || "",
//         contact_type: contact.contact_type || "",
//         company: contact.company || "",
//         title: contact.title || "",
//         department: contact.department || "",
//         location: contact.location || "",
//         website: contact.website || "",
//         notes: contact.notes || "",
//         image_url: contact.image_url || "",
//       });
//     }
//   }, [contact]);
//
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };
//
//   const handleSelectChange = (name: string, value: string) => {
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };
//
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(null);
//
//     if (!organizationId) {
//       setError("Organization not found. Please refresh or contact support.");
//       setIsSubmitting(false);
//       return;
//     }
//
//     try {
//       const { data: { user }, error: userError } = await supabase.auth.getUser();
//
//       if (userError || !user) {
//         throw new Error("You must be logged in to save a contact");
//       }
//
//       const contactData = {
//         first_name: formData.first_name,
//         last_name: formData.last_name,
//         email: formData.email || null,
//         phone: formData.phone || null,
//         contact_type: formData.contact_type || null,
//         company: formData.company || null,
//         title: formData.title || null,
//         department: formData.department || null,
//         location: formData.location || null,
//         website: formData.website || null,
//         notes: formData.notes || null,
//         image_url: formData.image_url || null,
//       };
//
//       let result;
//
//       if (contact?.id) {
//         // Update existing contact
//         const { data, error: updateError } = await supabase
//           .from("contacts")
//           .update(contactData)
//           .eq("id", contact.id)
//           .select()
//           .single();
//
//         if (updateError) throw updateError;
//         result = data;
//       } else {
//         // Create new contact
//         const { data, error: insertError } = await supabase
//           .from("contacts")
//           .insert({
//             ...contactData,
//             org_id: organizationId,
//             created_by: user.id
//           })
//           .select()
//           .single();
//
//         if (insertError) throw insertError;
//         result = data;
//       }
//
//       if (onSuccess && result) {
//         onSuccess(result);
//       }
//
//     } catch (err: any) {
//       console.error("Error saving contact:", err);
//       setError(err.message || "Failed to save contact. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//
//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       {error && (
//         <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
//           {error}
//         </div>
//       )}
//
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="first_name">First Name*</Label>
//           <Input
//             id="first_name"
//             name="first_name"
//             placeholder="First Name"
//             value={formData.first_name}
//             onChange={handleChange}
//             required
//           />
//         </div>
//
//         <div className="space-y-2">
//           <Label htmlFor="last_name">Last Name*</Label>
//           <Input
//             id="last_name"
//             name="last_name"
//             placeholder="Last Name"
//             value={formData.last_name}
//             onChange={handleChange}
//             required
//           />
//         </div>
//       </div>
//
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="email">Email</Label>
//           <Input
//             id="email"
//             name="email"
//             type="email"
//             placeholder="Email Address"
//             value={formData.email}
//             onChange={handleChange}
//           />
//         </div>
//
//         <div className="space-y-2">
//           <Label htmlFor="phone">Phone</Label>
//           <Input
//             id="phone"
//             name="phone"
//             placeholder="Phone Number"
//             value={formData.phone}
//             onChange={handleChange}
//           />
//         </div>
//       </div>
//
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="contact_type">Contact Type</Label>
//           <Select
//             value={formData.contact_type}
//             onValueChange={(value) => handleSelectChange("contact_type", value)}
//           >
//             <SelectTrigger id="contact_type">
//               <SelectValue placeholder="Select Type" />
//             </SelectTrigger>
//             <SelectContent>
//               {CONTACT_TYPES.map(type => (
//                 <SelectItem key={type} value={type}>
//                   {type}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//
//         <div className="space-y-2">
//           <Label htmlFor="location">Location</Label>
//           <Input
//             id="location"
//             name="location"
//             placeholder="City, State or Country"
//             value={formData.location}
//             onChange={handleChange}
//           />
//         </div>
//       </div>
//
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="company">Company</Label>
//           <Input
//             id="company"
//             name="company"
//             placeholder="Company Name"
//             value={formData.company}
//             onChange={handleChange}
//           />
//         </div>
//
//         <div className="space-y-2">
//           <Label htmlFor="title">Title</Label>
//           <Input
//             id="title"
//             name="title"
//             placeholder="Job Title"
//             value={formData.title}
//             onChange={handleChange}
//           />
//         </div>
//       </div>
//
//       <div className="grid grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="department">Department</Label>
//           <Input
//             id="department"
//             name="department"
//             placeholder="Department"
//             value={formData.department}
//             onChange={handleChange}
//           />
//         </div>
//
//         <div className="space-y-2">
//           <Label htmlFor="website">Website</Label>
//           <Input
//             id="website"
//             name="website"
//             placeholder="Website URL"
//             value={formData.website}
//             onChange={handleChange}
//           />
//         </div>
//       </div>
//
//       <div className="space-y-2">
//         <Label htmlFor="image_url">Profile Image URL</Label>
//         <Input
//           id="image_url"
//           name="image_url"
//           placeholder="Image URL"
//           value={formData.image_url}
//           onChange={handleChange}
//         />
//       </div>
//
//       <div className="space-y-2">
//         <Label htmlFor="notes">Notes</Label>
//         <Textarea
//           id="notes"
//           name="notes"
//           placeholder="Add any relevant notes about this contact"
//           value={formData.notes}
//           onChange={handleChange}
//           rows={4}
//         />
//       </div>
//
//       <div className="flex justify-end space-x-2 pt-4">
//         <Button
//           type="button"
//           variant="outline"
//           onClick={onCancel}
//           disabled={isSubmitting}
//         >
//           Cancel
//         </Button>
//         <Button type="submit" disabled={isSubmitting}>
//           {isSubmitting ? "Saving..." : contact ? "Update Contact" : "Add Contact"}
//         </Button>
//       </div>
//     </form>
//   );
// }
