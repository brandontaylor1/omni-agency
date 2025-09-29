"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Athlete } from "@/types/athlete";
import { formatCurrency, formatHeight } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";

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
  );
}
