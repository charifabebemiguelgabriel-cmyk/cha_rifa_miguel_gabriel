import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const eventId = process.env.NEXT_PUBLIC_EVENT_ID!;
  const { data, error } = await supabase
    .from("numbers")
    .select("number,status")
    .eq("event_id", eventId)
    .order("number", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ numbers: data ?? [] });
}
