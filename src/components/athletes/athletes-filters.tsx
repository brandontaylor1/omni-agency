"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  POSITIONS, 
  NIL_TIERS, 
  GRADES, 
  AthleteFilters 
} from "@/types/athlete";

interface AthletesFiltersProps {
  onFilterChange: (filters: AthleteFilters) => void;
  defaultFilters?: AthleteFilters;
}

export function AthletesFilters({ 
  onFilterChange,
  defaultFilters = {} 
}: AthletesFiltersProps) {
  const [filters, setFilters] = useState<AthleteFilters>({
    search: "",
    position: "all",
    nilTier: "all",
    currentGrade: "all",
    sortBy: "name",
    sortDirection: "asc",
    ...defaultFilters
  });

  // Update filters and notify parent
  const updateFilters = (newFilters: Partial<AthleteFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ search: e.target.value });
  };

  // Handle position filter change
  const handlePositionChange = (value: string) => {
    updateFilters({ position: value as any });
  };

  // Handle NIL tier filter change
  const handleNilTierChange = (value: string) => {
    updateFilters({ nilTier: value as any });
  };

  // Handle grade filter change
  const handleGradeChange = (value: string) => {
    updateFilters({ currentGrade: value as any });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    // Format is "field-direction"
    const [sortBy, sortDirection] = value.split("-");
    updateFilters({ 
      sortBy: sortBy as any, 
      sortDirection: sortDirection as "asc" | "desc" 
    });
  };

  // Reset all filters
  const handleReset = () => {
    const resetFilters = {
      search: "",
      position: "all",
      nilTier: "all",
      currentGrade: "all",
      sortBy: "name",
      sortDirection: "asc"
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search athletes..."
          className="pl-8"
          value={filters.search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select 
          value={filters.position} 
          onValueChange={handlePositionChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {POSITIONS.map(position => (
              <SelectItem key={position} value={position}>
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.nilTier} 
          onValueChange={handleNilTierChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="NIL Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All NIL Tiers</SelectItem>
            {NIL_TIERS.map(tier => (
              <SelectItem key={tier} value={tier}>
                {tier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.currentGrade} 
          onValueChange={handleGradeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {GRADES.map(grade => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={`${filters.sortBy}-${filters.sortDirection}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="position-asc">Position (A-Z)</SelectItem>
            <SelectItem value="nilValue-desc">NIL Value (High-Low)</SelectItem>
            <SelectItem value="nilValue-asc">NIL Value (Low-High)</SelectItem>
            <SelectItem value="totalContractValue-desc">
              Contract Value (High-Low)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
