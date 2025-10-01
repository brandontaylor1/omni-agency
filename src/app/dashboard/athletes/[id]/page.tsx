"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash, Check, Clock, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Athlete } from "@/types/athlete";
import { formatCurrency, formatHeight } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AthletePageProps {
  params: {
    id: string;
  };
}

export default function AthletePage({ params }: AthletePageProps) {
  const { id } = params;
  const router = useRouter();

  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch athlete data
  useEffect(() => {
    async function fetchAthlete() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("athletes")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        setAthlete(data);
      } catch (err: any) {
        console.error("Error fetching athlete:", err);
        setError("Failed to load athlete details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAthlete();
  }, [id]);

  // Generate fallback initials for the avatar
  const initials = athlete 
    ? `${athlete.first_name.charAt(0)}${athlete.last_name.charAt(0)}`
    : "";

  // Determine NIL tier badge variant
  const nilTierVariant = athlete?.nil_tier?.toLowerCase() as 
    | "elite" 
    | "premium" 
    | "standard" 
    | "developing" 
    | "prospect"
    | undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div className="rounded-md bg-destructive/10 p-6 text-center">
        <p className="text-destructive">{error || "Athlete not found"}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => router.push("/dashboard/athletes")}
        >
          Back to Athletes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push("/dashboard/athletes")}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Athletes
        </Button>

        <div className="flex gap-2">
          <Link href={`/dashboard/athletes/${id}/edit`}>
            <Button variant="outline" size="sm" className="flex items-center">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" size="sm" className="flex items-center">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main athlete info */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <Avatar className="h-24 w-24 border">
              {athlete.image_url ? (
                <AvatarImage src={athlete.image_url} alt={`${athlete.first_name} ${athlete.last_name}`} />
              ) : (
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              )}
            </Avatar>

            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {athlete.first_name} {athlete.last_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xl text-muted-foreground">
                  {athlete.position} {athlete.jersey_number && `#${athlete.jersey_number}`}
                </p>
                {athlete.nil_tier && (
                  <Badge variant={nilTierVariant || "default"}>
                    {athlete.nil_tier}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-lg">Team Information</h2>
                <div className="grid grid-cols-2 gap-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Position/Number</p>
                    <p className="font-medium">{athlete.position} {athlete.jersey_number && `#${athlete.jersey_number}`}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grade</p>
                    <p className="font-medium">{athlete.current_grade || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">College</p>
                    <p className="font-medium">{athlete.college}</p>
                  </div>
                  {athlete.nfl_team && (
                  <div>
                    <p className="text-sm text-muted-foreground">NFL Team</p>
                    <p className="font-medium">{athlete.nfl_team}</p>
                  </div>
                  )}
                  <div className="col-span-2 mt-2">
                    <p className="text-sm text-muted-foreground">Previous Colleges</p>
                    <p className="font-medium">
                      {athlete.previous_colleges && athlete.previous_colleges.length > 0
                        ? athlete.previous_colleges.join(", ")
                        : "None"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-lg">Physical Attributes</h2>
                <div className="grid grid-cols-3 gap-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Height</p>
                    <p className="font-medium">{athlete.height_ft_in || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">
                      {athlete.weight_lbs ? `${athlete.weight_lbs} lbs` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Speed (40yd)</p>
                    <p className="font-medium">{athlete.speed || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hand Size</p>
                    <p className="font-medium">{athlete.hand_size || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Arm Length</p>
                    <p className="font-medium">{athlete.arm_length || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Wingspan</p>
                    <p className="font-medium">{athlete.wingspan || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-lg">Background</h2>
                <div className="grid grid-cols-2 gap-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Hometown</p>
                    <p className="font-medium">{athlete.hometown || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">High School</p>
                    <p className="font-medium">{athlete.high_school || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">HS Coach</p>
                    <p className="font-medium">{athlete.hs_coach || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">HS Coach Cell</p>
                    <p className="font-medium">{athlete.hs_coach_phone || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Previous Colleges</p>
                    <p className="font-medium">
                      {athlete.previous_colleges && athlete.previous_colleges.length > 0
                        ? athlete.previous_colleges.join(", ")
                        : "None"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4 space-y-2">
                <h2 className="font-semibold text-lg">NIL Information</h2>
                <div className="grid grid-cols-1 gap-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">NIL Tier</p>
                    <div className="mt-1">
                      {athlete.nil_tier ? (
                        <Badge variant={nilTierVariant || "default"} className="text-sm">
                          {athlete.nil_tier}
                        </Badge>
                      ) : (
                        <p className="font-medium">Not Assigned</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">NIL Value</p>
                    <p className="text-2xl font-bold">
                      {athlete.nil_value ? formatCurrency(athlete.nil_value) : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Contract Value</p>
                    <p className="text-2xl font-bold">
                      {athlete.total_contract_value 
                        ? formatCurrency(athlete.total_contract_value) 
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

                {/* Brand Partnerships Section */}
                <div className="mb-6 space-y-2">
                  <h3 className="font-semibold text-base">Brand Partnerships</h3>
                  <div className="rounded-md border overflow-hidden">
                    {athlete.brand_partnerships && athlete.brand_partnerships.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Deliverable Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {athlete.brand_partnerships.map((partnership) => (
                                <Dialog key={partnership.id}>
                                  <DialogTrigger asChild>
                                    <TableRow className="cursor-pointer hover:bg-muted/80">
                                      <TableCell>{new Date(partnership.date).toLocaleDateString()}</TableCell>
                                      <TableCell className="font-medium">{partnership.company}</TableCell>
                                      <TableCell className="max-w-[200px] truncate">
                                        {partnership.details}
                                      </TableCell>
                                    </TableRow>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                      <DialogTitle>Edit Brand Partnership</DialogTitle>
                                      <DialogDescription>
                                        Update the partnership details with {partnership.company}.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="partnership-date" className="text-right">
                                          Date
                                        </Label>
                                        <Input
                                            id="partnership-date"
                                            type="date"
                                            defaultValue={partnership.date.split('T')[0]}
                                            className="col-span-3"
                                            readOnly
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="partnership-company" className="text-right">
                                          Company
                                        </Label>
                                        <Input
                                            id="partnership-company"
                                            defaultValue={partnership.company}
                                            className="col-span-3"
                                            readOnly
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="partnership-details" className="text-right">
                                          Details
                                        </Label>
                                        <Textarea
                                            id="partnership-details"
                                            defaultValue={partnership.details}
                                            className="col-span-3"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="partnership-monetary" className="text-right">
                                          Monetary Value
                                        </Label>
                                        <Input
                                            id="partnership-monetary"
                                            type="number"
                                            defaultValue={partnership.monetary_value || ""}
                                            className="col-span-3"
                                            placeholder="$0.00"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="partnership-inkind" className="text-right">
                                          In-kind Value
                                        </Label>
                                        <Input
                                            id="partnership-inkind"
                                            type="number"
                                            defaultValue={partnership.inkind_value || ""}
                                            className="col-span-3"
                                            placeholder="$0.00"
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="partnership-obligations" className="text-right">
                                          Obligations
                                        </Label>
                                        <Textarea
                                            id="partnership-obligations"
                                            defaultValue={partnership.obligations || ""}
                                            className="col-span-3"
                                            placeholder="Posting, signing, appearances, etc."
                                        />
                                      </div>
                                      <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="partnership-status" className="text-right">
                                          Status
                                        </Label>
                                        <Select defaultValue={partnership.status}>
                                          <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="canceled">Canceled</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button type="submit">Save changes</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                            ))}
                          </TableBody>
                        </Table>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">
                          <p>No brand partnerships found</p>
                          <Link href={`/dashboard/athletes/${id}/partnerships/new`}>
                            <Button variant="outline" size="sm" className="mt-2">
                              Add Partnership
                            </Button>
                          </Link>
                        </div>
                    )}
                  </div>
                  {athlete.brand_partnerships && athlete.brand_partnerships.length > 0 && (
                      <div className="flex justify-end">
                        <Link href={`/dashboard/athletes/${id}/partnerships/new`}>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" /> Add Partnership
                          </Button>
                        </Link>
                      </div>
                  )}
                </div>



              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Active Deals</h2>
                  <Link href={`/dashboard/athletes/${id}/deals`}>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="py-8 text-center text-muted-foreground">
                  <p>No active deals</p>
                  <Link href={`/dashboard/athletes/${id}/deals/new`}>
                    <Button variant="outline" size="sm" className="mt-2">
                      Add Deal
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Events section */}
              {athlete.events && athlete.events.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Scheduled Events</h2>
                    <Link href={`/dashboard/athletes/${id}/edit`}>
                      <Button variant="link" size="sm" className="h-auto p-0">
                        Manage Events
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                    {athlete.events.map((event, index) => {
                      const eventDate = new Date(event.date);
                      const isOverdue = !event.fulfilled && eventDate < new Date();

                      return (
                        <div
                          key={index}
                          className={`flex items-start justify-between p-3 rounded-md border ${
                            event.fulfilled
                              ? 'bg-green-50 dark:bg-green-900/10'
                              : isOverdue
                              ? 'bg-amber-50 dark:bg-amber-900/10'
                              : 'bg-white dark:bg-gray-950'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-1 p-1.5 rounded-full ${
                                event.fulfilled
                                  ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                  : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                              }`}
                            >
                              {event.fulfilled ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(event.date).toLocaleDateString()} at{" "}
                                {new Date(event.date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              {event.type === 'game' && event.metadata && (
                                <div className="mt-1 space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    vs {event.metadata.opponent} ({event.metadata.location})
                                    {event.metadata.college && ` - ${event.metadata.college}`}
                                  </p>
                                  {event.metadata.attending_members?.length > 0 && (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Users className="h-3 w-3" />
                                            <span>
                                              {event.metadata.attending_members[0].name}
                                              {event.metadata.attending_members.length > 1 &&
                                                ` +${event.metadata.attending_members.length - 1}`}
                                            </span>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="p-2 max-w-[300px]">
                                          <div className="space-y-2">
                                            {event.metadata.attending_members.map((member) => (
                                              <div key={member.id} className="text-xs">
                                                <div className="font-semibold">{member.name} ({member.type})</div>
                                                {member.email && (
                                                  <div className="text-muted-foreground">{member.email}</div>
                                                )}
                                                {member.phone && (
                                                  <div className="text-muted-foreground">{member.phone}</div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                              )}
                              {event.description && (
                                <p className="text-sm mt-1 text-muted-foreground">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={event.fulfilled ? "success" : isOverdue ? "outline" : "secondary"}
                            className="text-xs"
                          >
                            {event.fulfilled
                              ? "Completed"
                              : isOverdue
                              ? "Overdue"
                              : "Scheduled"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar information */}
        <div className="space-y-6">
          <div className="border rounded-lg p-4 space-y-4">
            <h2 className="font-semibold text-lg">Quick Stats</h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">NIL Value</span>
                <span className="font-bold">
                  {athlete.nil_value ? formatCurrency(athlete.nil_value) : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Contract Value</span>
                <span className="font-bold">
                  {athlete.total_contract_value 
                    ? formatCurrency(athlete.total_contract_value) 
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Active Deals</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">
                  {new Date(athlete.updated_at).toLocaleDateString()}
                </span>
              </div>

              {/* Professional Development Summary */}
              {athlete.professional_development && athlete.professional_development.length > 0 && (
                <div className="border rounded-lg p-4 space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Professional Development</h2>
                    <Link href={`/dashboard/athletes/${id}/edit`}>
                      <Button variant="link" size="sm" className="h-auto p-0">
                        Edit
                      </Button>
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {/* Group activities by category and count them */}
                    {Object.entries(
                      athlete.professional_development.reduce((acc, activity) => {
                        acc[activity.category] = (acc[activity.category] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center py-1 border-b">
                        <span>{category}</span>
                        <Badge variant="outline">{count} {count === 1 ? 'session' : 'sessions'}</Badge>
                      </div>
                    ))}

                    <div className="text-right text-xs text-muted-foreground mt-2">
                      Last session: {new Date(Math.max(...athlete.professional_development.map(a => 
                        new Date(a.date).getTime()))).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
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
              <Link href={`/dashboard/athletes/${id}/deals/new`}>
                <Button variant="outline" className="w-full justify-start">
                  Add New Deal
                </Button>
              </Link>
              <Link href={`/dashboard/athletes/${id}/notes/new`}>
                <Button variant="outline" className="w-full justify-start">
                  Add Note
                </Button>
              </Link>
              <Link href={`/dashboard/athletes/${id}/documents`}>
                <Button variant="outline" className="w-full justify-start">
                  Manage Documents
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
