"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CONTACT_TYPES, ContactFilters } from "@/types/contact";

type SortBy = "name" | "company" | "contactType" | "lastContact";
type SortDirection = "asc" | "desc";

interface ContactsFiltersProps {
  onFilterChange: (filters: ContactFilters) => void;
  defaultFilters?: ContactFilters;
}

export function ContactsFilters({
                                  onFilterChange,
                                  defaultFilters = {},
                                }: ContactsFiltersProps) {
  // Initialize once from props
  const [filters, setFilters] = useState<ContactFilters>(() => defaultFilters);

  // Keep a stable ref to the latest onFilterChange to avoid effect loops
  const onFilterChangeRef = useRef(onFilterChange);
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // Only run when filters actually change
  useEffect(() => {
    onFilterChangeRef.current(filters);
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  // Use 'all' as a sentinel; never write '' into state
  const handleContactTypeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      contactType: value === "all" ? "all" : (value as ContactFilters["contactType"]),
    }));
  };

  // Use 'default' as a sentinel for “no explicit sort”
  const handleSortByChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value === "default" ? undefined : (value as SortBy),
    }));
  };

  const handleSortDirectionChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sortDirection: value as SortDirection }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search contacts..."
                className="pl-9"
                value={filters.search ?? ""}
                onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-1 gap-4">
            {/* Contact Type */}
            <Select
                value={filters.contactType ?? "all"}
                onValueChange={handleContactTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Contact Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contact Types</SelectItem>
                {CONTACT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
                value={filters.sortBy ?? "default"}
                onValueChange={handleSortByChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Order</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="contactType">Contact Type</SelectItem>
                <SelectItem value="lastContact">Last Contact</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Direction (only when a real sort is chosen) */}
            {filters.sortBy && (
                <Select
                    value={filters.sortDirection ?? "asc"}
                    onValueChange={handleSortDirectionChange}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
            )}
          </div>
        </div>

        {(filters.search ||
            (filters.contactType && filters.contactType !== "all") ||
            filters.sortBy) && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
        )}
      </div>
  );
}


