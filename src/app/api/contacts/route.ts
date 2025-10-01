import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Verify user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in" },
        { status: 401 }
      );
    }

    // Parse request body
    const contactData = await req.json();

    // Ensure org_id is present
    if (!contactData.org_id) {
      return NextResponse.json(
        { error: "Bad Request: Organization ID is required" },
        { status: 400 }
      );
    }

    // Verify user belongs to the organization
    const { data: orgMembership, error: membershipError } = await supabase
      .from("org_members")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("org_id", contactData.org_id)
      .single();

    if (membershipError || !orgMembership) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to add contacts to this organization" },
        { status: 403 }
      );
    }

    // Insert contact with created_by field
    const { data: contact, error: insertError } = await supabase
      .from("contacts")
      .insert({
        ...contactData,
        created_by: session.user.id
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(contact);
  } catch (error: any) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Verify user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: "Unauthorized: You must be logged in" },
        { status: 401 }
      );
    }

    // Get org_id from query parameters
    const url = new URL(req.url);
    const orgId = url.searchParams.get("org_id");

    if (!orgId) {
      return NextResponse.json(
        { error: "Bad Request: Organization ID is required" },
        { status: 400 }
      );
    }

    // Verify user belongs to the organization
    const { data: orgMembership, error: membershipError } = await supabase
      .from("org_members")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("org_id", orgId)
      .single();

    if (membershipError || !orgMembership) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to view contacts for this organization" },
        { status: 403 }
      );
    }

    // Get contacts for the organization
    const { data: contacts, error: contactsError } = await supabase
      .from("contacts")
      .select("*")
      .eq("org_id", orgId);

    if (contactsError) {
      return NextResponse.json(
        { error: contactsError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(contacts);
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Internal Server Error: " + error.message },
      { status: 500 }
    );
  }
}
