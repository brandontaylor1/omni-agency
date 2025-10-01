"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Table as TableIcon, Plus } from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ContactCard } from "@/components/contacts/contact-card";
import { ContactTable } from "@/components/contacts/contact-table";
import { ContactsFilters } from "@/components/contacts/contacts-filters";
import { ContactFilters, Contact } from "@/types/contact";
import { supabase } from "@/lib/supabase/client";
import { ContactForm } from "@/components/contacts/contact-form";
import { ContactView } from "@/components/contacts/contact-view";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ContactsPage() {
  const router = useRouter();
  const { organizationId, isLoading: isOrgLoading } = useOrganization();
  const [view, setView] = useState<"table" | "grid">("grid"); // Default to grid view
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isViewContactModalOpen, setIsViewContactModalOpen] = useState(false);
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Fetch contacts from Supabase
  const fetchContacts = async () => {
    if (!organizationId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get the current user's auth information
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      // Fetch contacts for the current organization
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("org_id", organizationId);

      if (error) {
        throw error;
      }

      setContacts(data || []);
      setFilteredContacts(data || []);
    } catch (err: any) {
      console.error("Error fetching contacts:", err);
      setError("Failed to load contacts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchContacts();
    }
  }, [organizationId]);

  // Apply filters when they change
  const handleFilterChange = (newFilters: ContactFilters) => {
    setFilters(newFilters);

    let filtered = [...contacts];

    // Apply search filter
    if (newFilters.search) {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(
        contact =>
          contact.first_name?.toLowerCase().includes(searchLower) ||
          contact.last_name?.toLowerCase().includes(searchLower) ||
          contact.company?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower)
      );
    }

    // Apply contact type filter
    if (newFilters.contactType) {
      filtered = filtered.filter(
        contact => contact.contact_type === newFilters.contactType
      );
    }

    // Apply sorting
    if (newFilters.sortBy) {
      const direction = newFilters.sortDirection === 'desc' ? -1 : 1;
      filtered.sort((a, b) => {
        switch (newFilters.sortBy) {
          case 'name':
            return (
              direction *
              (`${a.first_name} ${a.last_name}`).localeCompare(`${b.first_name} ${b.last_name}`)
            );
          case 'company':
            return direction * ((a.company || '').localeCompare(b.company || ''));
          case 'contactType':
            return direction * ((a.contact_type || '').localeCompare(b.contact_type || ''));
          case 'lastContact':
            if (!a.last_contact_date && !b.last_contact_date) return 0;
            if (!a.last_contact_date) return direction;
            if (!b.last_contact_date) return -direction;
            return (
              direction *
              (new Date(a.last_contact_date).getTime() - new Date(b.last_contact_date).getTime())
            );
          default:
            return 0;
        }
      });
    }

    setFilteredContacts(filtered);
  };

  // Handle view contact (navigate to dedicated page)
  const handleViewContact = (contact: Contact) => {
    router.push(`/dashboard/contacts/${contact.id}`);
  };

  // Handle modal actions
  const handleAddContact = () => {
    setSelectedContact(null);
    setIsAddContactModalOpen(true);
  };

  const handleContactSaved = (contact: Contact) => {
    fetchContacts();
    setIsAddContactModalOpen(false);
    setIsEditContactModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your network of contacts and relationships
          </p>
        </div>
        <Button onClick={handleAddContact} disabled={isOrgLoading || !organizationId}>
          <Plus className="mr-2 h-4 w-4" /> Add Contact
        </Button>
      </div>

      <ContactsFilters 
        onFilterChange={handleFilterChange} 
        defaultFilters={filters} 
      />

      <Tabs 
        defaultValue="grid" 
        value={view} 
        onValueChange={(value) => setView(value as "table" | "grid")}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              <span>Table View</span>
            </TabsTrigger>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span>Card View</span>
            </TabsTrigger>
          </TabsList>
          <p className="text-sm text-muted-foreground">
            {filteredContacts.length} contacts
          </p>
        </div>

        {isOrgLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-3">Loading organization data...</span>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/10 p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => fetchContacts()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <ContactTable 
                contacts={filteredContacts} 
                onView={handleViewContact}
              />
            </TabsContent>

            <TabsContent value="grid" className="mt-0">
              {filteredContacts.length === 0 ? (
                <div className="rounded-md border py-20 text-center">
                  <p className="text-muted-foreground">No contacts found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredContacts.map(contact => (
                    <ContactCard 
                      key={contact.id} 
                      contact={contact} 
                      onClick={() => handleViewContact(contact)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Add Contact Modal */}
      <Dialog open={isAddContactModalOpen} onOpenChange={setIsAddContactModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Enter the details for the new contact
            </DialogDescription>
          </DialogHeader>
          <ContactForm 
            onSuccess={handleContactSaved}
            onCancel={() => setIsAddContactModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
