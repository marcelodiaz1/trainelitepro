import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { email, password, userData } = await request.json();

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: userData,
    });

    if (authError) throw authError;

    const { error: dbError } = await supabaseAdmin
      .from("users")
      .upsert({ id: authUser.user.id, email, ...userData });

    if (dbError) throw dbError;

    // IMPORTANT: You MUST return a response here
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("API ERROR:", error.message);
    // IMPORTANT: You MUST return a response here too
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}