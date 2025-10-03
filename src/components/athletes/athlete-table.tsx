"use client";

import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Athlete } from "@/types/athlete";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface AthleteTableProps {
  athletes: Athlete[];
}

export function AthleteTable({ athletes }: AthleteTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>College</TableHead>
            <TableHead>NFL Team</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Height</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Speed</TableHead>
            <TableHead>Hometown</TableHead>
            <TableHead>High School</TableHead>
            <TableHead>NIL Tier</TableHead>
            <TableHead className="text-right">NIL Value</TableHead>
            <TableHead className="text-right">Total Contracts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {athletes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No athletes found.
              </TableCell>
            </TableRow>
          ) : (
            athletes.map((athlete) => {
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
                <TableRow key={athlete.id}>
                  <TableCell>
                    <Link 
                      href={`/dashboard/athletes/${athlete.id}`}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <Avatar className="h-8 w-8">
                        {athlete.image_url ? (
                          <AvatarImage src={athlete.image_url} alt={`${athlete.first_name} ${athlete.last_name}`} />
                        ) : (
                          <AvatarFallback>{initials}</AvatarFallback>
                        )}
                      </Avatar>
                      <span className="font-medium">
                        {athlete.first_name} {athlete.last_name}
                      </span>
                      {athlete.jersey_number && (
                        <span className="text-muted-foreground">
                          #{athlete.jersey_number}
                        </span>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>{athlete.position}</TableCell>
                  <TableCell>{athlete.college}</TableCell>
                  <TableCell>{athlete.nfl_team}</TableCell>
                  <TableCell>{athlete.current_grade || "N/A"}</TableCell>
                  <TableCell>
                    {athlete.height_ft_in}
                  </TableCell>
                  <TableCell>{athlete.weight_lbs ? `${athlete.weight_lbs} lbs` : "N/A"}</TableCell>
                  <TableCell>{athlete.speed ? `${athlete.speed}s` : "N/A"}</TableCell>
                  <TableCell>
                    {athlete.hometown || "N/A"}
                  </TableCell>
                  <TableCell>{athlete.high_school}</TableCell>
                  <TableCell>
                    {athlete.nil_tier ? (
                      <Badge variant={nilTierVariant || "default"}>
                        {athlete.nil_tier}
                      </Badge>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {athlete.nil_value ? formatCurrency(athlete.nil_value) : "N/A"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {athlete.total_contract_value 
                      ? formatCurrency(athlete.total_contract_value) 
                      : "N/A"}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
