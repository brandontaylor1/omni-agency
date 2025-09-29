import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Create a Supabase client with the service role key for admin operations
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { name, slug, userId, firstName, lastName, email } = await request.json();

    if (!name || !slug || !userId || !firstName || !lastName || !email) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Create the user record in the users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email: email
      });

    if (userError) {
      console.error('Error creating user record:', userError);
      return NextResponse.json(
        { message: 'Failed to create user record: ' + userError.message },
        { status: 500 }
      );
    }

    // 2. Create the organization using admin privileges
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({ name, slug })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      return NextResponse.json(
        { message: 'Failed to create organization: ' + orgError.message },
        { status: 500 }
      );
    }

    // 3. Add the user as an owner
    const { error: memberError } = await supabaseAdmin
      .from('org_members')
      .insert({
        org_id: org.id,
        user_id: userId,
        role: 'owner',
      });

    if (memberError) {
      console.error('Error adding organization member:', memberError);
      return NextResponse.json(
        { message: 'Failed to add user to organization: ' + memberError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Organization and user created successfully', organization: org },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { message: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
