"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import {
  CONTRACT_TYPES,
  CONTRACT_STATUSES,
  ContractWithAthlete,
  ContractFilters
} from "@/types/contract";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

// Helper function to filter contracts
function filterContracts(
  contracts: ContractWithAthlete[], 
  filters: ContractFilters
): ContractWithAthlete[] {
  return contracts.filter(contract => {
    // Filter by search term
    if (filters.search && !contract.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !contract.partner.toLowerCase().includes(filters.search.toLowerCase()) &&
        !`${contract.athlete.first_name} ${contract.athlete.last_name}`.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Filter by athlete ID
    if (filters.athleteId && contract.athlete_id !== filters.athleteId) {
      return false;
    }

    // Filter by contract type
    if (filters.type && contract.type !== filters.type) {
      return false;
    }

    // Filter by contract status
    if (filters.status && contract.status !== filters.status) {
      return false;
    }

    // Filter by start date range
    if (filters.startDateFrom && new Date(contract.start_date) < new Date(filters.startDateFrom)) {
      return false;
    }
    if (filters.startDateTo && new Date(contract.start_date) > new Date(filters.startDateTo)) {
      return false;
    }

    // Filter by end date range
    if (filters.endDateFrom && new Date(contract.end_date) < new Date(filters.endDateFrom)) {
      return false;
    }
    if (filters.endDateTo && new Date(contract.end_date) > new Date(filters.endDateTo)) {
      return false;
    }

    // Filter by value range
    if (filters.valueMin && contract.value < filters.valueMin) {
      return false;
    }
    if (filters.valueMax && contract.value > filters.valueMax) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Default sort by start date descending
    const sortBy = filters.sortBy || 'startDate';
    const direction = filters.sortDirection === 'asc' ? 1 : -1;

    switch (sortBy) {
      case 'athlete':
        return direction * (`${a.athlete.first_name} ${a.athlete.last_name}`)
          .localeCompare(`${b.athlete.first_name} ${b.athlete.last_name}`);
      case 'partner':
        return direction * a.partner.localeCompare(b.partner);
      case 'value':
        return direction * (a.value - b.value);
      case 'startDate':
        return direction * (new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
      case 'endDate':
        return direction * (new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
      case 'status':
        return direction * a.status.localeCompare(b.status);
      default:
        return direction * (new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    }
  });
}

// Component for contract status badge
function ContractStatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "outline" | "destructive" = "outline";

  switch (status) {
    case 'active':
      variant = "default";
      break;
    case 'pending':
      variant = "secondary";
      break;
    case 'expired':
    case 'terminated':
      variant = "destructive";
      break;
  }

  return <Badge variant={variant}>{status}</Badge>;
}

// Filters component
function ContractsFilters({ 
  onFilterChange, 
  defaultFilters 
}: { 
  onFilterChange: (filters: ContractFilters) => void;
  defaultFilters: ContractFilters;
}) {
  const [filters, setFilters] = useState<ContractFilters>(defaultFilters);
  const [isOpen, setIsOpen] = useState(false);

  // Update filters and notify parent
  const updateFilters = (newFilters: Partial<ContractFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      type: "",
      status: "",
      startDateFrom: "",
      startDateTo: "",
      endDateFrom: "",
      endDateTo: "",
      valueMin: undefined,
      valueMax: undefined,
      sortBy: "startDate",
      sortDirection: "desc"
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start mb-6">
      <div className="relative w-full sm:w-72">
        <Input
          placeholder="Search contracts..."
          value={filters.search || ""}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="w-full"
        />
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" /> 
            Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <h4 className="font-medium">Filter Contracts</h4>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contract Type</label>
              <Select
                value={filters.type || ""}
                onValueChange={(value) => updateFilters({ type: value || "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  {CONTRACT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || ""}
                onValueChange={(value) => updateFilters({ status: value || "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {CONTRACT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Start From</label>
                  <Input
                    type="date"
                    value={filters.startDateFrom || ""}
                    onChange={(e) => updateFilters({ startDateFrom: e.target.value })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Start To</label>
                  <Input
                    type="date"
                    value={filters.startDateTo || ""}
                    onChange={(e) => updateFilters({ startDateTo: e.target.value })}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Value Range</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Min ($)</label>
                  <Input
                    type="number"
                    value={filters.valueMin || ""}
                    onChange={(e) => updateFilters({ 
                      valueMin: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Max ($)</label>
                  <Input
                    type="number"
                    value={filters.valueMax || ""}
                    onChange={(e) => updateFilters({ 
                      valueMax: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="h-8"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={filters.sortBy || "startDate"}
                onValueChange={(value) => updateFilters({ sortBy: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="athlete">Athlete Name</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                  <SelectItem value="startDate">Start Date</SelectItem>
                  <SelectItem value="endDate">End Date</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sort Direction</label>
              <Select
                value={filters.sortDirection || "desc"}
                onValueChange={(value) => updateFilters({ sortDirection: value as 'asc' | 'desc' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <div className="ml-auto">
        <Link href="/dashboard/contracts/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Contract
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ContractsPage() {
  const [view, setView] = useState<"table" | "grid">("table");
  const [contracts, setContracts] = useState<ContractWithAthlete[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<ContractWithAthlete[]>([]);
  const [filters, setFilters] = useState<ContractFilters>({
    sortBy: "startDate",
    sortDirection: "desc"
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch contracts from Supabase with athlete information
  useEffect(() => {
    async function fetchContracts() {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("contracts")
          .select(`
            *,
            athlete:athletes(id, first_name, last_name, position, image_url)
          `);

        if (error) {
          throw error;
        }

        // Transform the data to match ContractWithAthlete type
        const contractsWithAthletes = data.map(contract => ({
          ...contract,
          athlete: contract.athlete as any
        })) as ContractWithAthlete[];

        setContracts(contractsWithAthletes);
        setFilteredContracts(filterContracts(contractsWithAthletes, filters));
      } catch (err: any) {
        console.error("Error fetching contracts:", err);
        setError("Failed to load contracts. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchContracts();
  }, []);

  // Apply filters when they change
  const handleFilterChange = (newFilters: ContractFilters) => {
    setFilters(newFilters);
    setFilteredContracts(filterContracts(contracts, newFilters));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contracts & Deals</h1>
        <p className="text-muted-foreground">
          Manage contracts, endorsement deals, and NIL agreements for your athletes
        </p>
      </div>

      <ContractsFilters 
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
              <FileText className="h-4 w-4" />
              <span>Card View</span>
            </TabsTrigger>
          </TabsList>
          <p className="text-sm text-muted-foreground">
            {filteredContracts.length} contracts
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Athlete</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No contracts found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">
                            <Link href={`/dashboard/contracts/${contract.id}`} className="hover:underline">
                              {contract.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link href={`/dashboard/athletes/${contract.athlete_id}`} className="hover:underline">
                              {contract.athlete.first_name} {contract.athlete.last_name}
                            </Link>
                          </TableCell>
                          <TableCell>{contract.partner}</TableCell>
                          <TableCell className="capitalize">{contract.type}</TableCell>
                          <TableCell className="text-right">{formatCurrency(contract.value)}</TableCell>
                          <TableCell>{format(new Date(contract.start_date), "MMM d, yyyy")}</TableCell>
                          <TableCell>{format(new Date(contract.end_date), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <ContractStatusBadge status={contract.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="grid" className="mt-0">
              {filteredContracts.length === 0 ? (
                <div className="rounded-md border py-20 text-center">
                  <p className="text-muted-foreground">No contracts found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContracts.map(contract => (
                    <Link href={`/dashboard/contracts/${contract.id}`} key={contract.id}>
                      <Card className="overflow-hidden hover:border-primary transition-colors">
                        <CardContent className="p-0">
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium truncate">{contract.title}</div>
                              <ContractStatusBadge status={contract.status} />
                            </div>

                            <div className="text-sm text-muted-foreground mb-4">
                              <div className="mb-1">Partner: {contract.partner}</div>
                              <div className="capitalize">Type: {contract.type}</div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="text-sm">
                                <div>{format(new Date(contract.start_date), "MMM d, yyyy")}</div>
                                <div className="text-muted-foreground">to {format(new Date(contract.end_date), "MMM d, yyyy")}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold">{formatCurrency(contract.value)}</div>
                                <div className="text-xs text-muted-foreground">total value</div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t p-3 bg-muted/40 flex items-center">
                            <div className="flex items-center gap-2">
                              {contract.athlete.image_url ? (
                                <img 
                                  src={contract.athlete.image_url} 
                                  alt={`${contract.athlete.first_name} ${contract.athlete.last_name}`}
                                  className="h-6 w-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                                  {contract.athlete.first_name[0]}{contract.athlete.last_name[0]}
                                </div>
                              )}
                              <span className="text-sm font-medium truncate">
                                {contract.athlete.first_name} {contract.athlete.last_name}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
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
