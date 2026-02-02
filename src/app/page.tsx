"use client";

import React, { useEffect, useMemo, useState } from "react";

type NumStatus = "available" | "chosen" | "paid";
type Num = { number: number; status: NumStatus };

function getFraldaByNumber(n: number) {
  if (n >= 1 && n <= 30) return "P";
  if (n >= 31 && n <= 70) return "M";
  if (n >= 71 && n <= 100) return "G";
  return "-";
}

export default function Home() {
  const pixValue = 45;
  const pixKey = "412.000.618.29";
  const title = "Chá rifa do bebê Miguel Gabriel";

  const [numbers, setNumbers] = useState<Num[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [paymentType, setPaymentType] = useState<"pix" | "fralda">("pix");
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/numbers", { cache: "no-store" });
    const json = await res.json();
    setNumbers(json.numbers ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const chosenCount = useMemo(
    () => numbers.filter((n) => n.status === "chosen").length,
    [numbers]
  );

  const paidCount = useMemo(
    () => numbers.filter((n) => n.status === "paid").length,
    [numbers]
  );

  const takenCount = chosenCount + paidCount;

  async function claim() {
    if (!selected) return;
    setMsg(null);

    const res = await fetch("/api/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: selected, name, whatsapp, paymentType }),
    });

    const json = await res.json();
    setMsg(json.message);

    if (json.ok) {
      setSelected(null);
      setName("");
      setWhatsapp("");
      await load();
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.hero}>
        <div style={styles.heroGlow} />
        <div style={styles.heroCard}>
          <div style={styles.badge}>Selva elegante • 100 números</div>
          <h1 style={styles.h1}>{title}</h1>
          <p style={styles.sub}>
            Pix: <b>R$ {pixValue},00</b> • Escolhidos: <b>{takenCount}/100</b> • Pagos:{" "}
            <b>{paidCount}</b>
          </p>

          <div style={styles.progressWrap}>
            <div style={styles.progressOuter}>
              <div
                style={{
                  ...styles.progressInner,
                  width: `${Math.min(100, (takenCount / 100) * 100)}%`,
                }}
              />
            </div>
            <span style={styles.progressText}>{100 - takenCount} disponíveis</span>
          </div>
        </div>
      </div>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.h2}>Escolha seu número</h2>
          <div style={styles.legend}>
            <span style={styles.legendItem}>
              <span style={{ ...styles.dot, background: "#2bd576" }} /> disponível
            </span>
            <span style={styles.legendItem}>
              <span style={{ ...styles.dot, background: "#ffc107" }} /> escolhido ⏳
            </span>
            <span style={styles.legendItem}>
              <span style={{ ...styles.dot, background: "#2bd576" }} /> pago ✅
            </span>
          </div>
        </div>

        <div style={styles.grid}>
          {loading ? (
            <p style={styles.loading}>Carregando...</p>
          ) : (
            numbers.map((n) => {
              const disabled = n.status !== "available";
              const isSelected = selected === n.number;

              const stateStyle =
                n.status === "available"
                  ? styles.numAvailable
                  : n.status === "chosen"
                  ? styles.numChosen
                  : styles.numPaid;

              const titleTxt =
                n.status === "available"
                  ? "Disponível"
                  : n.status === "chosen"
                  ? "Já escolhido (aguardando confirmação)"
                  : "Pago confirmado ✅";

              return (
                <button
                  key={n.number}
                  disabled={disabled}
                  onClick={() => setSelected(n.number)}
                  style={{
                    ...styles.numBtn,
                    ...stateStyle,
                    ...(isSelected ? styles.numSelected : {}),
                  }}
                  title={titleTxt}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span>{n.number}</span>
                    {n.status === "paid" && (
                      <span aria-label="Pago" title="Pago confirmado">
                        ✅
                      </span>
                    )}
                    {n.status === "chosen" && (
                      <span aria-label="Pendente" title="Aguardando confirmação">
                        ⏳
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {selected && (
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.h3}>Confirmar número {selected}</h3>
                <p style={styles.modalSub}>
                  Para esse número, a fralda é:{" "}
                  <b style={styles.sizeTag}>{getFraldaByNumber(selected)}</b>
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            <div style={styles.tableBox}>
              <b>Tabela de fraldas</b>
              <div style={{ marginTop: 6, opacity: 0.95 }}>
                1 a 30: <b>P</b> • 31 a 70: <b>M</b> • 71 a 100: <b>G</b>
              </div>
            </div>

            <div style={styles.form}>
              <input
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
              <input
                placeholder="WhatsApp (com DDD)"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                style={styles.input}
              />

              <div style={styles.radioRow}>
                <label style={styles.radio}>
                  <input
                    type="radio"
                    checked={paymentType === "pix"}
                    onChange={() => setPaymentType("pix")}
                  />{" "}
                  Pix
                </label>
                <label style={styles.radio}>
                  <input
                    type="radio"
                    checked={paymentType === "fralda"}
                    onChange={() => setPaymentType("fralda")}
                  />{" "}
                  Fralda
                </label>
              </div>

              <div style={styles.actions}>
                <button onClick={claim} style={styles.primaryBtn}>
                  Confirmar
                </button>
                <button onClick={() => setSelected(null)} style={styles.secondaryBtn}>
                  Cancelar
                </button>
              </div>

              {msg && (
                <p style={styles.msg}>
                  <b>{msg}</b>
                </p>
              )}

              {paymentType === "pix" && (
                <PixBox
                  pixKey={pixKey}
                  amount={pixValue}
                  selectedNumber={selected}
                  userName={name}
                />
              )}

              {paymentType === "fralda" && (
                <FraldaBox selectedNumber={selected} userName={name} userWhatsapp={whatsapp} />
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function PixBox({
  pixKey,
  amount,
  selectedNumber,
  userName,
}: {
  pixKey: string;
  amount: number;
  selectedNumber: number;
  userName: string;
}) {
  const [copied, setCopied] = useState(false);

  const fralda = selectedNumber ? getFraldaByNumber(selectedNumber) : "-";

  const message =
    `Olá! 😊\n` +
    `Chá rifa do bebê Miguel Gabriel\n\n` +
    `✅ Número escolhido: ${selectedNumber}\n` +
    `🧷 Fralda (pela tabela): ${fralda}\n` +
    `👤 Nome: ${userName || "(não informado)"}\n\n` +
    `💰 Pix: R$ ${amount},00\n` +
    `🔑 Chave Pix: ${pixKey}\n\n` +
    `📎 Estou enviando o comprovante agora:`;

  const whatsappMom = "5517988017726";
  const whatsappDad = "5517988163227";

  const waMomLink = `https://wa.me/${whatsappMom}?text=` + encodeURIComponent(message);
  const waDadLink = `https://wa.me/${whatsappDad}?text=` + encodeURIComponent(message);

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = pixKey;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div style={styles.infoBox}>
      <b>Pix</b>
      <div style={{ marginTop: 8 }}>
        Valor: <b>R$ {amount},00</b>
      </div>
      <div style={{ marginTop: 6 }}>
        Chave: <b style={{ userSelect: "all" }}>{pixKey}</b>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <button onClick={copyPix} style={styles.primaryBtn}>
          {copied ? "Copiado ✅" : "Copiar chave Pix"}
        </button>

        <a
          href={waMomLink}
          target="_blank"
          rel="noreferrer"
          style={{
            ...styles.secondaryBtn,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Enviar comprovante • Mamãe
        </a>

        <a
          href={waDadLink}
          target="_blank"
          rel="noreferrer"
          style={{
            ...styles.secondaryBtn,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Enviar comprovante • Papai
        </a>
      </div>

      <div style={{ marginTop: 10, opacity: 0.9 }}>
        Após pagar, envie o comprovante no WhatsApp.
      </div>
    </div>
  );
}

function FraldaBox({
  selectedNumber,
  userName,
  userWhatsapp,
}: {
  selectedNumber: number;
  userName: string;
  userWhatsapp: string;
}) {
  const fralda = getFraldaByNumber(selectedNumber);

  const message =
    `Olá! 😊\n` +
    `Chá rifa do bebê Miguel Gabriel\n\n` +
    `✅ Número escolhido: ${selectedNumber}\n` +
    `🧷 Fralda (pela tabela): ${fralda}\n` +
    `👤 Nome: ${userName || "(não informado)"}\n` +
    `📱 Meu WhatsApp: ${userWhatsapp || "(não informado)"}\n\n` +
    `🚚 Vou entregar a fralda / combinar retirada.`;

  const whatsappMom = "5517988017726";
  const whatsappDad = "5517988163227";

  const waMomLink = `https://wa.me/${whatsappMom}?text=` + encodeURIComponent(message);
  const waDadLink = `https://wa.me/${whatsappDad}?text=` + encodeURIComponent(message);

  return (
    <div style={styles.infoBox}>
      <b>Fralda</b>
      <div style={{ marginTop: 8, opacity: 0.92 }}>
        Para esse número, a fralda é: <b>{fralda}</b>. Combine entrega/retirada com a mamãe ou o papai.
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <a
          href={waMomLink}
          target="_blank"
          rel="noreferrer"
          style={{
            ...styles.secondaryBtn,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Avisar • Mamãe
        </a>

        <a
          href={waDadLink}
          target="_blank"
          rel="noreferrer"
          style={{
            ...styles.secondaryBtn,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          Avisar • Papai
        </a>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(60, 255, 140, 0.10), rgba(0,0,0,0)), linear-gradient(180deg, #070a0f, #06080c)",
    color: "#e9eef8",
    padding: 16,
  },
  hero: {
    position: "relative",
    maxWidth: 980,
    margin: "0 auto",
    paddingTop: 10,
  },
  heroGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(600px 300px at 35% 30%, rgba(43, 213, 118, 0.18), rgba(0,0,0,0))",
    filter: "blur(6px)",
    pointerEvents: "none",
  },
  heroCard: {
    position: "relative",
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10, 14, 22, 0.72)",
    boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  badge: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(43, 213, 118, 0.14)",
    border: "1px solid rgba(43, 213, 118, 0.25)",
    fontSize: 12,
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  h1: { fontSize: 28, margin: 0, lineHeight: 1.15 },
  sub: { margin: "10px 0 0 0", opacity: 0.9 },

  progressWrap: {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  progressOuter: {
    height: 10,
    width: 260,
    borderRadius: 999,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  progressInner: {
    height: "100%",
    borderRadius: 999,
    background: "linear-gradient(90deg, rgba(43,213,118,0.9), rgba(43,213,118,0.5))",
  },
  progressText: { fontSize: 13, opacity: 0.9 },

  section: { maxWidth: 980, margin: "18px auto 0 auto" },
  sectionHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
  },
  h2: { margin: 0, fontSize: 18 },
  legend: { display: "flex", gap: 14, opacity: 0.9, flexWrap: "wrap" },
  legendItem: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 },
  dot: { width: 10, height: 10, borderRadius: 999, display: "inline-block" },

  grid: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "repeat(10, minmax(44px, 1fr))",
    gap: 10,
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10, 14, 22, 0.55)",
    backdropFilter: "blur(10px)",
  },
  loading: { margin: 0, opacity: 0.9 },

  numBtn: {
    height: 42,
    minWidth: 46,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    fontWeight: 800,
    color: "#e9eef8",
    cursor: "pointer",
  },
  numAvailable: { background: "rgba(43, 213, 118, 0.12)" },
  numChosen: {
    background: "rgba(255, 193, 7, 0.14)",
    border: "1px solid rgba(255, 193, 7, 0.25)",
    opacity: 0.75,
    cursor: "not-allowed",
  },
  numPaid: {
    background: "rgba(43, 213, 118, 0.16)",
    border: "1px solid rgba(43, 213, 118, 0.35)",
    opacity: 0.9,
    cursor: "not-allowed",
    fontWeight: 900,
  },
  numSelected: { outline: "2px solid rgba(43, 213, 118, 0.55)", transform: "translateY(-1px)" },

  modal: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(10, 14, 22, 0.78)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", gap: 10 },
  h3: { margin: 0, fontSize: 18 },
  modalSub: { margin: "8px 0 0 0", opacity: 0.9 },
  sizeTag: {
    display: "inline-flex",
    padding: "2px 10px",
    borderRadius: 999,
    background: "rgba(43, 213, 118, 0.14)",
    border: "1px solid rgba(43, 213, 118, 0.25)",
    marginLeft: 6,
  },
  closeBtn: {
    background: "transparent",
    color: "#e9eef8",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 12,
    width: 40,
    height: 36,
    cursor: "pointer",
    opacity: 0.9,
  },

  tableBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px dashed rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.04)",
  },

  form: { marginTop: 12, display: "grid", gap: 10, maxWidth: 520 },
  input: {
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e9eef8",
    outline: "none",
  },
  radioRow: { display: "flex", gap: 16, flexWrap: "wrap", opacity: 0.95 },
  radio: { display: "inline-flex", alignItems: "center", gap: 8 },

  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(43, 213, 118, 0.35)",
    background: "rgba(43, 213, 118, 0.18)",
    color: "#e9eef8",
    fontWeight: 800,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "#e9eef8",
    fontWeight: 700,
    cursor: "pointer",
  },
  msg: { margin: "6px 0 0 0" },

  infoBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.04)",
  },
};
