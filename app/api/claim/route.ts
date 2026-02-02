import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const eventId = process.env.NEXT_PUBLIC_EVENT_ID!;
  const body = await req.json();
  const { number, name, whatsapp, paymentType } = body ?? {};

  if (!number || !name || !whatsapp) {
    return NextResponse.json(
      { ok: false, message: "Preencha nome e WhatsApp." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseServer.rpc("claim_number", {
    p_event_id: eventId,
    p_number: Number(number),
    p_name: String(name).trim(),
    p_whatsapp: String(whatsapp).trim(),
    p_payment_type: paymentType ? String(paymentType) : "pix",
  });

  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json(data?.[0] ?? { ok: false, message: "Erro inesperado" });
}
