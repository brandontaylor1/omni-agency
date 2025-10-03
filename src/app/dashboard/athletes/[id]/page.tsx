"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Athlete } from "@/types/athlete";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

        if (error) throw error;
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
  const nilTierVariant = (() => {
    switch (athlete?.nil_tier?.toLowerCase()) {
      case "tier 1":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "tier 2":
        return "bg-purple-500 hover:bg-purple-600 text-white";
      case "tier 3":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "tier 4":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "tier 5":
        return "bg-stone-500 hover:bg-stone-600 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  })();

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
    <div className="h-screen overflow-hidden flex flex-col">
      <div className="p-2 flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-2">
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
            <Button
              variant="destructive"
              size="sm"
              className="flex items-center"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Player header above all columns */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center mb-6">
          <Avatar className="h-24 w-24 border">
            {athlete.image_url ? (
              <AvatarImage
                src={athlete.image_url}
                alt={`${athlete.first_name} ${athlete.last_name}`}
              />
            ) : (
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-5xl uppercase font-bold tracking-tight">
              <span className="font-extralight">{athlete.first_name}</span>
              {athlete.last_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-md text-muted-foreground">
                {athlete.position}{" "}
                {athlete.jersey_number && `#${athlete.jersey_number}`}
              </p>
              {athlete.nil_tier && (
                <Badge className={`${nilTierVariant}`}>{athlete.nil_tier}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* First column: Parent, Team, Physical, Background */}
          <div className="space-y-4">
            {/* Parent Information Section - moved above Team Information */}
            <div className="border rounded-lg p-4 space-y-2">
              <h2 className="uppercase font-extralight underline text-xl">
                Parent
                <span className="font-extrabold">Information</span>
              </h2>
              <div className="grid grid-cols-3 gap-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Mother Name</p>
                  <p className="font-medium text-sm">{athlete.mother_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Mother Phone</p>
                  <p className="font-medium text-sm">{athlete.mother_phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mother Email</p>
                  <p className="font-medium">{athlete.mother_email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Mother Occupation
                  </p>
                  <p className="font-medium">{athlete.mother_occupation || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mother Company</p>
                  <p className="font-medium">{athlete.mother_company || "N/A"}</p>
                </div>
                <div className="col-span-1">
                  <p className="text-sm text-muted-foreground">Mother Address</p>
                  <p className="font-medium">{athlete.mother_address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father Name</p>
                  <p className="font-medium">{athlete.father_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father Phone</p>
                  <p className="font-medium">{athlete.father_phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father Email</p>
                  <p className="font-medium">{athlete.father_email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Father Occupation
                  </p>
                  <p className="font-medium">{athlete.father_occupation || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Father Company</p>
                  <p className="font-medium">{athlete.father_company || "N/A"}</p>
                </div>
                <div className="col-span-">
                  <p className="text-sm text-muted-foreground">Father Address</p>
                  <p className="font-medium">{athlete.father_address || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Siblings</p>
                  <p className="font-medium">{athlete.siblings || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Team Information Section - now below Parent Information */}
            <div className="border rounded-lg p-4 space-y-2">
              <h2 className="uppercase font-extralight underline text-xl">
                Team
                <span className="font-extrabold">Information</span>
              </h2>

              <div className="grid grid-cols-4 gap-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Position/Number
                  </p>
                  <p className="font-medium">
                    {athlete.position}{" "}
                    {athlete.jersey_number && `#${athlete.jersey_number}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-medium">{athlete.current_grade || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">College</p>
                  <p className="font-medium">{athlete.college}</p>
                </div>
                {athlete.nfl_team && (
                  <div>
                    <p className="text-xs text-muted-foreground">NFL Team</p>
                    <p className="font-medium">{athlete.nfl_team}</p>
                  </div>
                )}
                <div className="col-span-1 mt-2">
                  <p className="text-sm text-muted-foreground">
                    Previous Colleges
                  </p>
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
                  <p className="text-xs text-muted-foreground">Height</p>
                  <p className="font-medium">{athlete.height_ft_in || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="font-medium">
                    {athlete.weight_lbs ? `${athlete.weight_lbs} lbs` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Speed (40yd)</p>
                  <p className="font-medium">{athlete.speed || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hand Size</p>
                  <p className="font-medium">{athlete.hand_size || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Arm Length</p>
                  <p className="font-medium">{athlete.arm_length || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Wingspan</p>
                  <p className="font-medium">{athlete.wingspan || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <h2 className="font-semibold text-lg">Player Background</h2>
              <div className="grid grid-cols-3 gap-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Hometown</p>
                  <p className="font-medium">{athlete.hometown || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">High School</p>
                  <p className="font-medium">{athlete.high_school || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">HS Coach</p>
                  <p className="font-medium">{athlete.hs_coach || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">HS Coach Cell</p>
                  <p className="font-medium">{athlete.hs_coach_phone || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Previous Colleges</p>
                  <p className="font-medium">
                    {athlete.previous_colleges && athlete.previous_colleges.length > 0
                      ? athlete.previous_colleges.join(", ")
                      : "None"}
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-xs text-muted-foreground">Bio</p>
                  <p className="font-medium text-sm whitespace-pre-wrap">{athlete.bio || "N/A"}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-xs text-muted-foreground">Achievements</p>
                  <p className="font-medium text-sm whitespace-pre-wrap">{athlete.achievements || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Second column: NIL, Revenue Sharing, Partnerships, Events, Professional Development */}
          <div className="space-y-4">
            <div className="border rounded-lg p-4 space-y-2">
              <h2 className="font-semibold text-lg">NIL Information</h2>
              <div className="grid grid-cols-3 gap-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">NIL Tier</p>
                  <div className="mt-1">
                    <Badge
                      className={`${athlete.nil_tier ? nilTierVariant : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
                    >
                      {athlete.nil_tier || "Not Assigned"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">NIL Value</p>
                  <p className="text-2xl font-bold">
                    {athlete.nil_value ? formatCurrency(athlete.nil_value) : (
                      <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
                        Not Set
                      </Badge>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Contract Value
                  </p>
                  <p className="text-2xl font-bold">
                    {athlete.total_contract_value ? formatCurrency(athlete.total_contract_value) : (
                      <Badge className="bg-gray-500 hover:bg-gray-600 text-white">
                        Not Set
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-2">
              <h2 className="font-semibold text-lg">Revenue Sharing</h2>
              <div className="grid grid-cols-3 gap-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">School Tier</p>
                  <div className="mt-1">
                    <Badge
                      variant="default"
                      className={athlete?.revenue_sharing?.school_tier ? nilTierVariant : undefined}
                    >
                      {athlete?.revenue_sharing?.school_tier || "Not Assigned"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Value</p>
                  <p className="text-2xl font-bold">
                    {athlete?.revenue_sharing?.value ? formatCurrency(athlete.revenue_sharing.value) : (
                      <Badge variant="secondary">Not Set</Badge>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold">
                    {athlete?.revenue_sharing?.total_value ? formatCurrency(athlete.revenue_sharing.total_value) : (
                      <Badge variant="secondary">Not Set</Badge>
                    )}
                  </p>
                </div>
              </div>
            </div>


            {/* Brand Partnerships Section */}
            {Array.isArray(athlete.brand_partnerships) && athlete.brand_partnerships.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg">Brand Partnerships</h2>
                  <Link href={`/dashboard/athletes/${id}/edit`}>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      Manage Partnerships
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                  {athlete.brand_partnerships.map((partnership: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 rounded-md border bg-white dark:bg-gray-950"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{partnership.company}</p>
                          <Badge
                            variant={
                              partnership.status === 'active' ? 'default' :
                              partnership.status === 'completed' ? 'success' :
                              partnership.status === 'pending' ? 'secondary' :
                              'outline'
                            }
                            className="text-xs ml-2"
                          >
                            {partnership.status.charAt(0).toUpperCase() + partnership.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(partnership.date).toLocaleDateString()}
                        </p>
                        {partnership.details && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {partnership.details}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2">
                          {partnership.monetary_value && (
                            <div>
                              <p className="text-xs text-muted-foreground">Monetary Value</p>
                              <p className="text-sm font-medium">
                                {formatCurrency(partnership.monetary_value)}
                              </p>
                            </div>
                          )}
                          {partnership.inkind_value && (
                            <div>
                              <p className="text-xs text-muted-foreground">In-kind Value</p>
                              <p className="text-sm font-medium">
                                {formatCurrency(partnership.inkind_value)}
                              </p>
                            </div>
                          )}
                        </div>
                        {partnership.obligations && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Obligations</p>
                            <p className="text-xs">{partnership.obligations}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events section moved next to School NIL Information */}
            {Array.isArray(athlete.events) && athlete.events.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-md">Scheduled Events</h2>
                  <Link href={`/dashboard/athletes/${id}/edit`}>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      Manage Events
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                  {athlete.events.map((event: any, index: number) => {
                    const eventDate = new Date(event.date);
                    const isOverdue = !event.fulfilled && eventDate < new Date();

                    return (
                      <div
                        key={index}
                        className={`flex items-start justify-between p-3 rounded-md border ${
                          event.fulfilled
                            ? "bg-green-50 dark:bg-green-900/10"
                            : isOverdue
                            ? "bg-amber-50 dark:bg-amber-900/10"
                            : "bg-white dark:bg-gray-950"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 p-1.5 rounded-full ${
                              event.fulfilled
                                ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                            }`}
                          >
                            {event.fulfilled ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString()} at{" "}
                              {new Date(event.date).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {event.description && (
                              <p className="text-xs mt-1 text-muted-foreground">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            event.fulfilled
                              ? "success"
                              : isOverdue
                              ? "destructive"
                              : "default"
                          }
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

            {/* Professional Development Section */}
            {Array.isArray(athlete.professional_development) && athlete.professional_development.length > 0 && (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-md">Professional Development</h2>
                  <Link href={`/dashboard/athletes/${id}/edit`}>
                    <Button variant="link" size="sm" className="h-auto p-0">
                      Manage Activities
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                  {athlete.professional_development.map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 rounded-md border bg-white dark:bg-gray-950"
                    >
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="text-xs font-medium">{activity.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                          {activity.notes && (
                            <p className="text-xs mt-1 text-muted-foreground">
                              {activity.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Third column: Communications Log and Medical History stacked */}
          <div className="space-y-6">
            {/* Communications Log Section */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Communications Log</h2>
                <Button variant="outline" size="sm">Add Communication</Button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {Array.isArray(athlete.communications_log) && athlete.communications_log.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Contacted By</TableHead>
                          <TableHead>Mode</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {athlete.communications_log.map((comm: any) => (
                            <TableRow key={comm.id} className="align-top">
                              <TableCell>{new Date(comm.date).toLocaleDateString()}</TableCell>
                              <TableCell>{comm.contacted_by}</TableCell>
                              <TableCell>{comm.mode}</TableCell>
                              <TableCell>{comm.subject || '-'}</TableCell>
                              <TableCell>
                                <details>
                                  <summary>View</summary>
                                  <div className="mt-2">
                                    <div><strong>Details:</strong> {comm.details}</div>
                                    {comm.action_items && comm.action_items.length > 0 && (
                                        <div className="mt-2">
                                          <strong>Action Items:</strong>
                                          <ul className="list-disc ml-4">
                                            {comm.action_items.map((item: any, idx: number) => (
                                                <li key={idx}>
                                                  {item.description} - <span className="italic">{item.status}</span>
                                                  {item.due_date && ` (Due: ${new Date(item.due_date).toLocaleDateString()})`}
                                                </li>
                                            ))}
                                          </ul>
                                        </div>
                                    )}
                                    {comm.outcome && <div className="mt-2"><strong>Outcome:</strong> {comm.outcome}</div>}
                                    {comm.follow_up_date && <div className="mt-2"><strong>Follow Up:</strong> {new Date(comm.follow_up_date).toLocaleDateString()}</div>}
                                  </div>
                                </details>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">No communications logged.</div>
                )}
              </div>
            </div>

            {/* Medical History Section */}
            <div className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Medical History</h2>
                <Button variant="outline" size="sm">Add Medical Record</Button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {Array.isArray(athlete.medical_history) && athlete.medical_history.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Injury</TableHead>
                          <TableHead>Timetable</TableHead>
                          <TableHead>Doctor(s)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {athlete.medical_history.map((med: any) => (
                            <TableRow key={med.id} className="align-top">
                              <TableCell>{new Date(med.date).toLocaleDateString()}</TableCell>
                              <TableCell>{med.injury}</TableCell>
                              <TableCell>{med.timetable || '-'}</TableCell>
                              <TableCell>{med.doctors_seen ? med.doctors_seen.join(', ') : '-'}</TableCell>
                              <TableCell>{med.status}</TableCell>
                              <TableCell>
                                <details>
                                  <summary>View</summary>
                                  <div className="mt-2">
                                    {med.rehab && <div><strong>Rehab:</strong> {med.rehab}</div>}
                                    {med.notes && <div><strong>Notes:</strong> {med.notes}</div>}
                                    {med.severity && <div><strong>Severity:</strong> {med.severity}</div>}
                                    {med.treatment_type && <div><strong>Treatment:</strong> {med.treatment_type}</div>}
                                  </div>
                                </details>
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">No medical records found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
