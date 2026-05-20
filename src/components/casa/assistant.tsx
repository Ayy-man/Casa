"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, SendHorizonal } from "lucide-react";
import { useRole } from "@/lib/auth/context";
import {
  ASSISTANT_GREETINGS,
  getAssistantResponse,
  promptsForRole,
} from "@/lib/mock-data/assistant";

/**
 * A single rendered turn in the Assistant conversation. `pending` marks the
 * transient loading indicator that the canned-response timeout replaces.
 */
type Message = {
  id: number;
  speaker: "user" | "assistant";
  text: string;
  pending?: boolean;
};

/**
 * The Assistant — the third top-nav tab. A role-aware chat surface: a greeting
 * bubble, 4 role-aware suggested-prompt chips, a conversation history, and a
 * fixed bottom input bar. Phase 1 demo: canned responses on a 1–2s local
 * timeout, no network, no real LLM (see threat register T-01-15..17).
 */
export function Assistant() {
  const role = useRole();

  // Greeting + chips are derived from the demo role (owner / operations).
  const greeting = ASSISTANT_GREETINGS[role];
  const suggestedPrompts = useMemo(() => promptsForRole(role), [role]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  // Canned-response timers tracked in a ref + cleared on unmount — the
  // page.tsx toast-timer pattern (T-01-16: no unbounded timer accumulation).
  const timers = useRef<Map<number, number>>(new Map());
  const threadEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((id) => window.clearTimeout(id));
      map.clear();
    };
  }, []);

  // Keep the latest turn in view as the conversation grows.
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  /**
   * Send a prompt: push the user bubble + a pending loading bubble, then after
   * a 1–2s timeout swap the loading bubble for the canned response. No network.
   */
  function send(prompt: string) {
    const text = prompt.trim();
    if (!text) return;

    const userId = Date.now() + Math.random();
    const pendingId = userId + 1;
    setMessages((prev) => [
      ...prev,
      { id: userId, speaker: "user", text },
      { id: pendingId, speaker: "assistant", text: "", pending: true },
    ]);
    setDraft("");

    // 1–2s delay (per the Interaction Contract) before the canned reply lands.
    const delay = 1000 + Math.floor(Math.random() * 1000);
    const timeoutId = window.setTimeout(() => {
      const answer = getAssistantResponse(text);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === pendingId
            ? { id: pendingId, speaker: "assistant", text: answer }
            : m
        )
      );
      timers.current.delete(pendingId);
    }, delay);
    timers.current.set(pendingId, timeoutId);
  }

  // Disable input while a canned response is still pending.
  const awaitingReply = messages.some((m) => m.pending);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (awaitingReply) return;
    send(draft);
  }

  return (
    <div
      className="flex flex-col"
      style={{
        maxWidth: 700,
        margin: "0 auto",
        minHeight: "calc(100vh - 70px - 88px)",
      }}
    >
      {/* ── Conversation column ── */}
      <div className="flex-1 pb-6">
        {/* Greeting — a .bubble.them bubble with the role-aware copy. */}
        <div className="chat-row them">
          <div className="flex items-end gap-2.5">
            <span
              className="shrink-0 inline-flex items-center justify-center rounded-full"
              style={{
                width: 30,
                height: 30,
                background: "#EAF1FB",
                color: "#1E5FBF",
              }}
              aria-hidden="true"
            >
              <Bot size={16} strokeWidth={1.5} />
            </span>
            <div>
              <div className="bubble them text-[15px]">{greeting}</div>
            </div>
          </div>
        </div>

        {/* 4 role-aware suggested-prompt chips (.filter-chip base). */}
        <div className="flex flex-wrap gap-2 mt-4 mb-2 pl-[40px]">
          {suggestedPrompts.map((p) => (
            <button
              key={p.prompt}
              type="button"
              className="filter-chip"
              onClick={() => send(p.prompt)}
              disabled={awaitingReply}
            >
              {p.prompt}
            </button>
          ))}
        </div>

        {/* Conversation history — .bubble.them (bot) / .bubble.us (user). */}
        {messages.map((m) => (
          <div key={m.id} className={`chat-row ${m.speaker === "user" ? "us" : "them"}`}>
            {m.speaker === "assistant" ? (
              <div className="flex items-end gap-2.5">
                <span
                  className="shrink-0 inline-flex items-center justify-center rounded-full"
                  style={{
                    width: 30,
                    height: 30,
                    background: "#EAF1FB",
                    color: "#1E5FBF",
                  }}
                  aria-hidden="true"
                >
                  <Bot size={16} strokeWidth={1.5} />
                </span>
                {m.pending ? (
                  <div
                    className="bubble them flex items-center gap-1.5"
                    role="status"
                    aria-live="polite"
                    aria-label="Assistant is typing"
                  >
                    <span className="assistant-dot" />
                    <span className="assistant-dot" />
                    <span className="assistant-dot" />
                  </div>
                ) : (
                  <div className="bubble them text-[15px]">{m.text}</div>
                )}
              </div>
            ) : (
              <div className="bubble us text-[15px]">{m.text}</div>
            )}
          </div>
        ))}
        <div ref={threadEndRef} />
      </div>

      {/* ── Fixed bottom input bar ── */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-white border-t border-rule py-4 flex items-center gap-2.5"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about properties, revenue, or agent actions..."
          aria-label="Message the Assistant"
          className="topbar-search flex-1"
        />
        <button
          type="submit"
          className="btn-sm btn-sm-accent flex items-center gap-1.5"
          disabled={awaitingReply || draft.trim().length === 0}
          aria-label="Send message"
        >
          <SendHorizonal size={14} strokeWidth={1.6} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
