import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Contact } from "@/types/contact";

interface ContactTableProps {
  contacts: Contact[];
  onView?: (contact: Contact) => void;
}

export function ContactTable({ contacts, onView }: ContactTableProps) {
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
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Last Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No contacts found.
              </TableCell>
            </TableRow>
          ) : (
            contacts.map((contact) => {
              // Generate fallback initials for the avatar
              const initials = 
                (contact.first_name?.[0] || '') + 
                (contact.last_name?.[0] || '');

              return (
                <TableRow 
                  key={contact.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onView && onView(contact)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border">
                        {contact.image_url ? (
                          <AvatarImage 
                            src={contact.image_url} 
                            alt={`${contact.first_name} ${contact.last_name}`} 
                          />
                        ) : (
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                        {contact.title && (
                          <p className="text-xs text-muted-foreground">{contact.title}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {contact.contact_type ? (
                      <Badge variant={contactTypeVariant(contact.contact_type) as any}>
                        {contact.contact_type}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{contact.company || "—"}</TableCell>
                  <TableCell>{contact.email || "—"}</TableCell>
                  <TableCell>{contact.phone || "—"}</TableCell>
                  <TableCell>{formatDate(contact.last_contact_date)}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
