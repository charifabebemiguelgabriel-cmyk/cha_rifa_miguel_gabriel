import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json();
  const { pass, number, confirmedBy, proofNote } = body ?? {};

  if (pass !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false, message: "Não autorizado" }, { status: 401 });
  }

  const eventId = process.env.NEXT_PUBLIC_EVENT_ID!;
  const { error } = await supabaseServer
    .from("numbers")
    .update({
      status: "paid",
      payment_confirmed: true,
      confirmed_by: confirmedBy || "admin",
      confirmed_at: new Date().toISOString(),
      proof_note: proofNote || null,
    })
    .eq("event_id", eventId)
    .eq("number", Number(number));

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, message: "Pagamento confirmado ✅" });
}
