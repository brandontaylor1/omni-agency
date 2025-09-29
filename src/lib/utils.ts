import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Function to format height from inches to feet and inches
export function formatHeight(inches?: number | null): string {
  if (!inches) return 'N/A';
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

// Function to filter and sort athletes based on filters
export function filterAthletes<T extends {
  first_name: string;
  last_name: string;
  position?: string | null;
  nil_tier?: string | null;
  current_grade?: string | null;
  nil_value?: number | null;
  total_contract_value?: number | null;
}>(
  athletes: T[],
  filters: {
    search?: string;
    position?: string;
    nilTier?: string;
    currentGrade?: string;
    sortBy?: 'name' | 'position' | 'nilValue' | 'totalContractValue';
    sortDirection?: 'asc' | 'desc';
  }
): T[] {
  return athletes
    .filter(athlete => {
      // Search filter
      if (filters.search && filters.search.length > 0) {
        const searchTerm = filters.search.toLowerCase();
        const fullName = `${athlete.first_name} ${athlete.last_name}`.toLowerCase();
        if (!fullName.includes(searchTerm)) {
          return false;
        }
      }

      // Position filter
      if (filters.position && filters.position.length > 0) {
        if (athlete.position !== filters.position) {
          return false;
        }
      }

      // NIL tier filter
      if (filters.nilTier && filters.nilTier.length > 0) {
        if (athlete.nil_tier !== filters.nilTier) {
          return false;
        }
      }

      // Grade filter
      if (filters.currentGrade && filters.currentGrade.length > 0) {
        if (athlete.current_grade !== filters.currentGrade) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const sortBy = filters.sortBy || 'name';
      const direction = filters.sortDirection === 'desc' ? -1 : 1;

      switch (sortBy) {
        case 'name':
          const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
          const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
          return nameA.localeCompare(nameB) * direction;

        case 'position':
          const posA = a.position?.toLowerCase() || '';
          const posB = b.position?.toLowerCase() || '';
          return posA.localeCompare(posB) * direction;

        case 'nilValue':
          const nilA = a.nil_value || 0;
          const nilB = b.nil_value || 0;
          return (nilA - nilB) * direction;

        case 'totalContractValue':
          const contractA = a.total_contract_value || 0;
          const contractB = b.total_contract_value || 0;
          return (contractA - contractB) * direction;

        default:
          return 0;
      }
    });
}
