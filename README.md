# Omni Agency - Athlete Representation Platform

A secure, multi-tenant SaaS for athlete-representation agencies built with Next.js 14 and Supabase.

## Core Objectives

* Private, multi-tenant workspace per agency (org) with granular roles
* Fast data entry and retrieval for: contacts, comms, health, brand deals, PD sessions, evals, NIL + NFL value, calendar, awards
* Rich attachments (docs, imaging) and searchable logs
* Tiered grading systems surfaced across dashboards
* Auditability and permissions enforced via RLS

## Tech Stack

* **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind + shadcn/ui, TanStack Query
* **Backend**: Next.js Route Handlers, Supabase JS client
* **Database**: Supabase Postgres with Row Level Security (RLS)
* **Auth**: Supabase Auth
* **Storage**: Supabase Storage buckets

## UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components. It's not a component library, but a collection of reusable components built using Radix UI and Tailwind CSS.

Key benefits:
- Fully customizable and themeable
- Copy-paste components into your project
- No external dependencies to manage
- Accessible and type-safe

To add more components:
