import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Building2, MapPin, Calendar } from "lucide-react";
import { Contact } from "@/types/contact";

interface ContactCardProps {
  contact: Contact;
  onClick?: () => void;
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
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

  return (
    <div 
      onClick={onClick}
      className="block transition-transform hover:scale-102 cursor-pointer"
    >
      <Card className="h-full overflow-hidden hover:border-primary/50">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border">
              {contact.image_url ? (
                <AvatarImage src={contact.image_url} alt={`${contact.first_name} ${contact.last_name}`} />
              ) : (
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {contact.first_name} {contact.last_name}
              </CardTitle>
              <CardDescription>
                {contact.title || "No title"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-2 text-sm">
            {contact.company && (
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>{contact.company}</p>
              </div>
            )}

            {contact.email && (
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="truncate">{contact.email}</p>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>{contact.phone}</p>
              </div>
            )}

            {contact.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="truncate">{contact.location}</p>
              </div>
            )}

            {contact.last_contact_date && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <p>Last Contact: {formatDate(contact.last_contact_date)}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t flex items-center justify-between">
          <div>
            {contact.contact_type && (
              <Badge variant={contactTypeVariant(contact.contact_type) as any} className="mr-2">
                {contact.contact_type}
              </Badge>
            )}
          </div>
          <div className="text-right">
            {contact.athletes_count && (
              <p className="text-sm font-medium">
                {contact.athletes_count} Athletes
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
