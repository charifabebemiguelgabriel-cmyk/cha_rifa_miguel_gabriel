"use client";

import { useEffect, useMemo, useState } from "react";

type Item = {
  number: number;
  status: "available" | "chosen" | "paid";
  taken_by_name: string | null;
  taken_by_whatsapp: string | null;
  payment_type: string | null;
  taken_at: string | null;
  payment_confirmed: boolean;
  confirmed_at: string | null;
  proof_note: string | null;
};

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");

  async function load() {
    setLoading(true);
    setMsg(null);
    const res = await fetch(`/api/admin/list?pass=${encodeURIComponent(pass)}`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) {
      setLoading(false);
      setMsg(json.error || "Erro");
      return;
    }
    setItems(json.items ?? []);
    setLoading(false);
  }

  async function confirm(number: number) {
    setMsg(null);
    const res = await fetch("/api/admin/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pass, number, confirmedBy: "admin", proofNote: note || null }),
    });
    const json = await res.json();
    setMsg(json.message);
    if (json.ok) {
      setNote("");
      await load();
    }
  }

  const chosen = useMemo(() => items.filter((i) => i.status === "chosen"), [items]);
  const paid = useMemo(() => items.filter((i) => i.status === "paid"), [items]);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ margin: 0 }}>Admin • Chá rifa do bebê Miguel Gabriel</h1>
      <p style={{ marginTop: 6, opacity: 0.85 }}>
        Escolhidos pendentes: <b>{chosen.length}</b> • Pagos confirmados: <b>{paid.length}</b>
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <input
          placeholder="Senha admin"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", minWidth: 220 }}
        />
        <button
          onClick={load}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontWeight: 700 }}
        >
          Entrar / Atualizar
        </button>
      </div>

      {msg && (
        <p>
          <b>{msg}</b>
        </p>
      )}
      {loading && <p>Carregando...</p>}

      <h2>Pendentes de confirmação (⏳)</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          placeholder="Observação (opcional): ex. comprovante recebido"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd", minWidth: 320 }}
        />
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {chosen.map((i) => (
          <div key={i.number} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <b>Nº {i.number}</b> • {i.payment_type || "—"} <br />
                {i.taken_by_name || "—"} • {i.taken_by_whatsapp || "—"}
              </div>
              <button
                onClick={() => confirm(i.number)}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", fontWeight: 700 }}
              >
                Marcar como pago ✅
              </button>
            </div>
          </div>
        ))}
        {chosen.length === 0 && <p>Sem pendências 🎉</p>}
      </div>

      <h2 style={{ marginTop: 24 }}>Pagos confirmados (✅)</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {paid.map((i) => (
          <div key={i.number} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, opacity: 0.9 }}>
            <b>Nº {i.number}</b> • {i.payment_type || "—"} • pago ✅ <br />
            {i.taken_by_name || "—"} • {i.taken_by_whatsapp || "—"}
          </div>
        ))}
        {paid.length === 0 && <p>Nenhum pago confirmado ainda.</p>}
      </div>
    </main>
  );
}
