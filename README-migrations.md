# Database Migrations Guide

This guide explains how to set up your database schema for the athlete representation platform.

## Migration Scripts

There are several migration scripts available:

1. `scripts/migrate.ts` - Creates basic organization and membership tables
2. `scripts/user-migration.ts` - Creates the users table needed for authentication
3. `scripts/contract-migration.ts` - Creates tables for contracts and payments
4. `scripts/complete-migrations.ts` - A comprehensive script that creates all tables at once

## Running the Migrations

### Option 1: Using the Complete Migration Script (Recommended)

1. Run the script to generate SQL:
   ```
   npx ts-node scripts/complete-migrations.ts
   ```

2. Copy the generated SQL

3. Go to the Supabase dashboard for your project

4. Navigate to the SQL Editor

5. Paste the SQL and run it

This will create all necessary tables with the proper relationships and security policies.

### Option 2: Running Individual Migrations

If you prefer to migrate in steps:

1. First run the basic migration:
   ```
   npx ts-node scripts/migrate.ts
   ```

2. Then run the users migration:
   ```
   npx ts-node scripts/user-migration.ts
   ```

3. Finally run the contracts migration:
   ```
   npx ts-node scripts/contract-migration.ts
   ```

Copy the SQL output from each script and execute it in the Supabase SQL Editor.

## Troubleshooting

### "Could not find the table 'public.users' in the schema cache"

This error means the users table doesn't exist yet. Run the user-migration script and execute the SQL in your Supabase dashboard.

### Foreign Key Constraints

The migration scripts must be executed in the correct order due to foreign key dependencies:

1. Organizations table first
2. Users table next
3. Org_members table (depends on both organizations and users)
4. Athletes table (depends on organizations)
5. Contracts table (depends on organizations and athletes)
6. Contract_payments table (depends on contracts)

The complete migration script handles this ordering automatically.

## Schema Overview

- **organizations**: Multi-tenant organizations for athlete representation
- **users**: User profiles linked to Supabase Auth
- **org_members**: Junction table linking users to organizations with roles
- **athletes**: Athlete profiles with details
- **contracts**: Endorsement, NIL, and professional contracts
- **contract_payments**: Payment schedules for contracts

All tables have Row Level Security (RLS) policies to ensure data is only accessible to authorized users within the same organization.
