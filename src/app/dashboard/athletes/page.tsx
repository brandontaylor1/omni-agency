"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, Table as TableIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AthleteTable } from "@/components/athletes/athlete-table";
import { AthleteCard } from "@/components/athletes/athlete-card";
import { AthletesFilters } from "@/components/athletes/athletes-filters";
import { AthleteFilters, Athlete } from "@/types/athlete";
import { filterAthletes } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function AthletesPage() {
  const [view, setView] = useState<"table" | "grid">("table");
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<Athlete[]>([]);
  const [filters, setFilters] = useState<AthleteFilters>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch athletes from Supabase
  useEffect(() => {
    async function fetchAthletes() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("athletes")
          .select("*");

        if (error) {
          throw error;
        }

        setAthletes(data || []);
        setFilteredAthletes(data || []);
      } catch (err: any) {
        console.error("Error fetching athletes:", err);
        setError("Failed to load athletes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAthletes();
  }, []);

  // Apply filters when they change
  const handleFilterChange = (newFilters: AthleteFilters) => {
    setFilters(newFilters);
    setFilteredAthletes(filterAthletes(athletes, newFilters));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Athletes</h1>
          <p className="text-muted-foreground">
            Manage your athletes and view their statistics
          </p>
        </div>
        <Link href="/dashboard/athletes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Athlete
          </Button>
        </Link>
      </div>

      <AthletesFilters 
        onFilterChange={handleFilterChange} 
        defaultFilters={filters} 
      />

      <Tabs 
        defaultValue="table" 
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
            {filteredAthletes.length} athletes
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/10 p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <AthleteTable athletes={filteredAthletes} />
            </TabsContent>

            <TabsContent value="grid" className="mt-0">
              {filteredAthletes.length === 0 ? (
                <div className="rounded-md border py-20 text-center">
                  <p className="text-muted-foreground">No athletes found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredAthletes.map(athlete => (
                    <AthleteCard key={athlete.id} athlete={athlete} />
                  ))}
                </div>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
