import { Tables } from './supabase';
import { Athlete } from './athlete';

// Type for Contract from the database
export type Contract = Tables<'contracts'>;
export type ContractPayment = Tables<'contract_payments'>;

// Contract with athlete data joined
export interface ContractWithAthlete extends Contract {
  athlete: Pick<Athlete, 'id' | 'first_name' | 'last_name' | 'position' | 'image_url'>;
}

// Contract type options
export const CONTRACT_TYPES = ['endorsement', 'nil', 'professional'] as const;
export type ContractType = typeof CONTRACT_TYPES[number];

// Contract status options
export const CONTRACT_STATUSES = ['draft', 'pending', 'active', 'expired', 'terminated'] as const;
export type ContractStatus = typeof CONTRACT_STATUSES[number];

// Payment type for payment schedule
export interface PaymentSchedule {
  amount: number;
  due_date: string;
  description?: string;
  paid?: boolean;
  paid_date?: string;
}

// Filter options for contracts
export interface ContractFilters {
  search?: string;
  athleteId?: string;
  type?: ContractType | '';
  status?: ContractStatus | '';
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  valueMin?: number;
  valueMax?: number;
  sortBy?: 'athlete' | 'partner' | 'value' | 'startDate' | 'endDate' | 'status';
  sortDirection?: 'asc' | 'desc';
}
