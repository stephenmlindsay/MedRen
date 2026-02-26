"use client";

import { useMemo, useState } from "react";
import intellectuals from "../data/intellectuals.json";

export default function HomePage() {
  const [selectedId, setSelectedId] = useState(intellectuals[0]?.id ?? "");
  const chosen = useMemo(
    () => intellectuals.find((x) => x.id === selectedId) ?? intellectuals[0],
    [selectedId]
  );
function openingMessage(person) {
  const quote = person?.openingExcerpt ? `“${person.openingExcerpt}”` : "";
  const src = person?.excerptSource ? `— ${person.excerptSource}` : "";
  const header = [quote, src].filter(Boolean).join("\n");
  return (header ? header + "\n\n" : "") + "Any questions?";
}
  const [messages, setMessages] = useState([
  { role: "assistant", content: openingMessage(intellectuals[0]) }
]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  function handleSelect(id) {
    setSelectedId(id);
    const next = intellectuals.find((x) => x.id === id);
    setMessages([{ role: "assistant", content: openingMessage(next) }]);
    setDraft("");
  }

  async function send() {
    const text = draft.trim();
    if (!text || busy || !chosen?.id) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedId: chosen.id, messages: nextMessages })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = await res.json();
      setMessages([...nextMessages, data.message]);
    } catch (e) {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            `Server error: ${e?.message ?? "unknown"}`
        }
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!chosen) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <h1>Medieval Renaissance Chat</h1>
        <p>No intellectuals loaded. Check <code>data/intellectuals.json</code>.</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>Medieval Renaissance Chat</h1>

      <section style={{ display: "flex", gap: 24, alignItems: "flex-start", marginTop: 16, flexWrap: "wrap" }}>
        {/* LEFT: chooser + bio */}
        <div style={{ flex: "1 1 420px", minWidth: 320 }}>
          <h2 style={{ marginTop: 0 }}>Select an intellectual</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {intellectuals.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: p.id === selectedId ? "2px solid black" : "1px solid #ccc",
                  background: p.id === selectedId ? "#f3f3f3" : "white",
                  cursor: "pointer"
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          <h2 style={{ marginTop: 18 }}>{chosen.name}</h2>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <img
              src={chosen.image}
              alt={chosen.name}
              style={{ width: 180, height: 220, objectFit: "cover", borderRadius: 12, border: "1px solid #ddd" }}
            />
            <p style={{ marginTop: 0, lineHeight: 1.45 }}>{chosen.bio}</p>
          </div>

          <h3 style={{ marginTop: 18 }}>Question</h3>
          <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12, background: "#fafafa" }}>
            <em>{chosen.starterQuestion}</em>
          </div>
        </div>

        {/* RIGHT: chat */}
        <div style={{ flex: "1 1 420px", minWidth: 320 }}>
          <h2 style={{ marginTop: 0 }}>Conversation</h2>

          <div
            style={{
              height: 420,
              overflow: "auto",
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 12,
              background: "white"
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.65 }}>
                  {(m?.role ?? "assistant").toUpperCase()} 
                </div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.4 }}>{m.content}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your response…"
              style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
            />
            <button
              onClick={send}
              disabled={busy}
              style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #111", cursor: "pointer" }}
            >
              {busy ? "Thinking…" : "Send"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
