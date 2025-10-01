"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase,
  User,
  Globe,
  Edit,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Contact } from "@/types/contact";
import { supabase } from "@/lib/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContactViewProps {
  contact: Contact;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ContactView({ contact, onEdit, onDelete, onClose }: ContactViewProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate fallback initials for the avatar
  const initials = 
    (contact.first_name?.[0] || '') + 
    (contact.last_name?.[0] || '');

  // Determine contact type badge variant
  const contactTypeVariant = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "agent": return "default";
      case "family": return "secondary";
      case "business": return "outline";
      case "coach": return "destructive";
      case "team": return "blue";
      case "media": return "purple";
      case "sponsor": return "yellow";
      default: return "default";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteContact = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contact.id);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      onDelete();
    } catch (err: any) {
      console.error("Error deleting contact:", err);
      setError(err.message || "Failed to delete contact. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16 border">
            {contact.image_url ? (
              <AvatarImage src={contact.image_url} alt={`${contact.first_name} ${contact.last_name}`} />
            ) : (
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">
              {contact.first_name} {contact.last_name}
            </h2>
            <div className="flex items-center mt-1 text-muted-foreground">
              {contact.title && <span className="mr-2">{contact.title}</span>}
              {contact.contact_type && (
                <Badge variant={contactTypeVariant(contact.contact_type) as any}>
                  {contact.contact_type}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-3">Contact Information</h3>
            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{contact.email}</p>
                  </div>
                </div>
              )}

              {contact.phone && (
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{contact.phone}</p>
                  </div>
                </div>
              )}

              {contact.location && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p>{contact.location}</p>
                  </div>
                </div>
              )}

              {contact.website && (
                <div className="flex items-start">
                  <Globe className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a 
                      href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {contact.website}
                    </a>
                  </div>
                </div>
              )}

              {contact.last_contact_date && (
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Contact</p>
                    <p>{formatDate(contact.last_contact_date)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          {(contact.company || contact.title || contact.department) && (
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-3">Professional Information</h3>
              <div className="space-y-3">
                {contact.company && (
                  <div className="flex items-start">
                    <Building2 className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p>{contact.company}</p>
                    </div>
                  </div>
                )}

                {contact.title && (
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p>{contact.title}</p>
                    </div>
                  </div>
                )}

                {contact.department && (
                  <div className="flex items-start">
                    <User className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p>{contact.department}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          {contact.notes && (
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-medium mb-3">Notes</h3>
              <div className="whitespace-pre-wrap text-sm">
                {contact.notes}
              </div>
            </div>
          )}

          {/* Dates Information */}
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-3">Record Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{formatDate(contact.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p>{formatDate(contact.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Athletes */}
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-3">Related Athletes</h3>
            {contact.athletes_count ? (
              <p>Associated with {contact.athletes_count} athletes</p>
            ) : (
              <p className="text-sm text-muted-foreground">No associated athletes</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t pt-4 mt-4 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact "{contact.first_name} {contact.last_name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteContact}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
import { useState } from "react";
import { 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Calendar, 
  Globe, 
  User, 
  Briefcase,
  Edit,
  Trash
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/contact";
import { supabase } from "@/lib/supabase/client";

interface ContactViewProps {
  contact: Contact;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}

export function ContactView({ contact, onEdit, onDelete, onClose }: ContactViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate fallback initials for the avatar
  const initials = 
    (contact.first_name?.[0] || '') + 
    (contact.last_name?.[0] || '');

  // Determine contact type badge variant
  const contactTypeVariant = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case "agent": return "default";
      case "family": return "secondary";
      case "business": return "outline";
      case "coach": return "destructive";
      case "team": return "blue";
      case "media": return "purple";
      case "sponsor": return "yellow";
      default: return "default";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contact.id);

      if (error) throw error;

      if (onDelete) onDelete();
    } catch (err: any) {
      console.error("Error deleting contact:", err);
      setError(err.message || "Failed to delete contact");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar className="h-16 w-16 border">
          {contact.image_url ? (
            <AvatarImage src={contact.image_url} alt={`${contact.first_name} ${contact.last_name}`} />
          ) : (
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1">
          <h2 className="text-2xl font-bold">
            {contact.first_name} {contact.last_name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {contact.title && (
              <p className="text-muted-foreground">
                {contact.title}
              </p>
            )}
            {contact.contact_type && (
              <Badge variant={contactTypeVariant(contact.contact_type) as any}>
                {contact.contact_type}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 sm:self-start">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit} 
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1"
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Contact Information
            </h3>

            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{contact.email}</p>
                  </div>
                </div>
              )}

              {contact.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{contact.phone}</p>
                  </div>
                </div>
              )}

              {contact.location && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{contact.location}</p>
                  </div>
                </div>
              )}

              {contact.website && (
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a 
                      href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      {contact.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Company Information
            </h3>

            <div className="space-y-3">
              {contact.company && (
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{contact.company}</p>
                  </div>
                </div>
              )}

              {contact.title && (
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Title</p>
                    <p className="font-medium">{contact.title}</p>
                  </div>
                </div>
              )}

              {contact.department && (
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Department</p>
                    <p className="font-medium">{contact.department}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
              Relationship Details
            </h3>

            <div className="space-y-3">
              {contact.last_contact_date && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Contact</p>
                    <p className="font-medium">{formatDate(contact.last_contact_date)}</p>
                  </div>
                </div>
              )}

              {contact.created_at && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Added On</p>
                    <p className="font-medium">{formatDate(contact.created_at)}</p>
                  </div>
                </div>
              )}

              {contact.athletes_count && (
                <div className="flex items-start">
                  <User className="h-5 w-5 mr-3 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Associated Athletes</p>
                    <p className="font-medium">{contact.athletes_count} athletes</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {contact.notes && (
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                Notes
              </h3>
              <div className="whitespace-pre-wrap text-sm">
                {contact.notes}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
