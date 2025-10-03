"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash, Calendar, Mail, Phone, MapPin, Building2, Briefcase, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Contact } from "@/types/contact";
import { supabase } from "@/lib/supabase/client";
import { ContactForm } from "@/components/contacts/contact-form";

interface ContactPageProps {
  params: {
    id: string;
  };
}

export default function ContactPage({ params }: ContactPageProps) {
  const { id } = params;
  const router = useRouter();

  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch contact data
  useEffect(() => {
    async function fetchContact() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("contacts")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        setContact(data);
      } catch (err: any) {
        console.error("Error fetching contact:", err);
        setError("Failed to load contact details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchContact();
  }, [id]);

  // Generate fallback initials for the avatar
  const initials = contact 
    ? `${contact.first_name?.[0] || ''}${contact.last_name?.[0] || ''}`
    : "";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="rounded-md bg-destructive/10 p-6 text-center">
        <p className="text-destructive">{error || "Contact not found"}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push("/dashboard/contacts")}
        >
          Back to Contacts
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Inline editing logic
  if (isEditing && contact) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
        <ContactForm
          contact={contact}
          onSuccess={(updatedContact) => {
            setContact(updatedContact);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
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

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" className="flex items-center">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main contact info */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <Avatar className="h-24 w-24 border">
              {contact.image_url ? (
                <AvatarImage src={contact.image_url} alt={`${contact.first_name} ${contact.last_name}`} />
              ) : (
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              )}
            </Avatar>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {contact.first_name} {contact.last_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xl text-muted-foreground">
                  {contact.title || "No title"}
                </p>
                {contact.contact_type && (
                  <Badge variant={contactTypeVariant(contact.contact_type) as any}>
                    {contact.contact_type}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-lg">Contact Information</h2>
                <div className="space-y-3">
                  {contact.email && (
                    <div className="flex">
                      <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{contact.email}</p>
                      </div>
                    </div>
                  )}

                  {contact.phone && (
                    <div className="flex">
                      <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{contact.phone}</p>
                      </div>
                    </div>
                  )}

                  {contact.location && (
                    <div className="flex">
                      <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{contact.location}</p>
                      </div>
                    </div>
                  )}

                  {contact.website && (
                    <div className="flex">
                      <div className="h-5 w-5 mr-3 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="2" y1="12" x2="22" y2="12"></line>
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                      </div>
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

              <div className="border rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-lg">Company Information</h2>
                <div className="space-y-3">
                  {contact.company && (
                    <div className="flex">
                      <Building2 className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{contact.company}</p>
                      </div>
                    </div>
                  )}

                  {contact.title && (
                    <div className="flex">
                      <Briefcase className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Title</p>
                        <p className="font-medium">{contact.title}</p>
                      </div>
                    </div>
                  )}

                  {contact.department && (
                    <div className="flex">
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
              <div className="border rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-lg">Relationship Details</h2>
                <div className="space-y-3">
                  {contact.last_contact_date && (
                    <div className="flex">
                      <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Contact</p>
                        <p className="font-medium">{formatDate(contact.last_contact_date)}</p>
                      </div>
                    </div>
                  )}

                  {contact.contact_type && (
                    <div className="flex">
                      <div className="h-5 w-5 mr-3 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Type</p>
                        <Badge variant={contactTypeVariant(contact.contact_type) as any} className="mt-1">
                          {contact.contact_type}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {contact.notes && (
                <div className="border rounded-lg p-4 space-y-2">
                  <h2 className="font-semibold text-lg">Notes</h2>
                  <div className="whitespace-pre-wrap text-sm">
                    {contact.notes}
                  </div>
                </div>
              )}

              {/* Associated Athletes */}
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Associated Athletes</h2>
                  <Button variant="outline" size="sm">View All</Button>
                </div>

                {contact.athletes_count ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      This contact is associated with {contact.athletes_count} athletes.
                    </p>
                    {/* List would go here when we have the data */}
                  </div>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    <p>No associated athletes</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Association
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar information */}
        <div className="space-y-6">
          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-lg">Quick Stats</h2>
            <div className="space-y-2">
              {contact.athletes_count && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Associated Athletes</span>
                  <span className="font-bold">{contact.athletes_count}</span>
                </div>
              )}

              {contact.events_count && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Events</span>
                  <span className="font-bold">{contact.events_count}</span>
                </div>
              )}

              {contact.last_contact_date && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Last Contact</span>
                  <span className="font-medium">{formatDate(contact.last_contact_date)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">
                  {formatDate(contact.updated_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-lg">Recent Activity</h2>
            <div className="py-8 text-center text-muted-foreground">
              <p>No recent activity</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-lg">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Link href={`/dashboard/contacts/${id}/notes/new`}>
                <Button variant="outline" className="w-full justify-start">
                  Add Note
                </Button>
              </Link>
              <Link href={`/dashboard/contacts/${id}/events/new`}>
                <Button variant="outline" className="w-full justify-start">
                  Schedule Event
                </Button>
              </Link>
              <Link href={`/dashboard/contacts/${id}/athletes/link`}>
                <Button variant="outline" className="w-full justify-start">
                  Link to Athlete
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
