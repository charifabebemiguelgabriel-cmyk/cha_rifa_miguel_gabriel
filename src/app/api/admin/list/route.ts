import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pass = url.searchParams.get("pass");
  if (pass !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const eventId = process.env.NEXT_PUBLIC_EVENT_ID!;
  const { data, error } = await supabaseServer
    .from("numbers")
    .select("number,status,taken_by_name,taken_by_whatsapp,payment_type,taken_at,payment_confirmed,confirmed_at,proof_note")
    .eq("event_id", eventId)
    .order("number", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}
