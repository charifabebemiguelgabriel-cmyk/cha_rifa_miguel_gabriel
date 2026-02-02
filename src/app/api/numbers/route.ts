import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const eventId = process.env.NEXT_PUBLIC_EVENT_ID!;
  const { data, error } = await supabaseServer
    .from("numbers")
    .select("number,status")
    .eq("event_id", eventId)
    .order("number", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ numbers: data });
}
