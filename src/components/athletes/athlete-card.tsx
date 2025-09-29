import Link from "next/link";
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
import { Athlete } from "@/types/athlete";
import { formatCurrency } from "@/lib/utils";

interface AthleteCardProps {
  athlete: Athlete;
}

export function AthleteCard({ athlete }: AthleteCardProps) {
  // Generate fallback initials for the avatar
  const initials = `${athlete.first_name.charAt(0)}${athlete.last_name.charAt(0)}`;

  // Determine NIL tier badge variant
  const nilTierVariant = athlete.nil_tier?.toLowerCase() as 
    | "elite" 
    | "premium" 
    | "standard" 
    | "developing" 
    | "prospect"
    | undefined;

  return (
    <Link 
      href={`/dashboard/athletes/${athlete.id}`}
      className="block transition-transform hover:scale-102"
    >
      <Card className="h-full overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border">
              {athlete.image_url ? (
                <AvatarImage src={athlete.image_url} alt={`${athlete.first_name} ${athlete.last_name}`} />
              ) : (
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {athlete.first_name} {athlete.last_name}
              </CardTitle>
              <CardDescription>
                {athlete.position} | #{athlete.jersey_number || "N/A"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Team</p>
              <p className="font-medium">{athlete.current_team}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Grade</p>
              <p className="font-medium">{athlete.current_grade || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Height</p>
              <p className="font-medium">
                {athlete.height_inches 
                  ? `${Math.floor(athlete.height_inches / 12)}'${athlete.height_inches % 12}"`
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Weight</p>
              <p className="font-medium">
                {athlete.weight_lbs ? `${athlete.weight_lbs} lbs` : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t flex items-center justify-between">
          <div>
            {athlete.nil_tier && (
              <Badge variant={nilTierVariant || "default"} className="mr-2">
                {athlete.nil_tier}
              </Badge>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">NIL Value</p>
            <p className="font-bold">
              {athlete.nil_value ? formatCurrency(athlete.nil_value) : "N/A"}
            </p>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
