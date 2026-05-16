"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { Message } from "@/lib/supabase/database.types";

interface Participant {
  name: string;
  role: string;
}

/**
 * Campaign chat. Admin + PM + client only (interns are blocked at the RLS
 * level, so even if this rendered for them the insert/select would fail).
 * Realtime subscription with a 15s polling fallback, mirroring NotificationBell.
 */
export default function ChatPanel({
  threadId,
  currentUserId,
  participants,
}: {
  threadId: string;
  currentUserId: string;
  participants: Record<string, Participant>;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const supabase = createClient();

    const load = async () => {
      try {
        const { data } = await supabase
          .from("messages")
          .select("*")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: true })
          .limit(200);
        if (!alive) return;
        setMessages((data ?? []) as Message[]);
      } catch {
        /* keep last good state */
      }
    };
    load();

    let ch: ReturnType<typeof supabase.channel> | null = null;
    try {
      ch = supabase
        .channel(`chat-${threadId}-${uid}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `thread_id=eq.${threadId}`,
          },
          () => load()
        )
        .subscribe();
    } catch {
      /* realtime optional — polling covers it */
    }

    const t = setInterval(load, 15_000);
    return () => {
      alive = false;
      if (ch) {
        try {
          supabase.removeChannel(ch);
        } catch {
          /* swallow */
        }
      }
      clearInterval(t);
    };
  }, [threadId, uid]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setError(null);
    setSending(true);
    const supabase = createClient();
    const { error } = await supabase.from("messages").insert({
      thread_id: threadId,
      author_id: currentUserId,
      body: text,
    });
    if (error) {
      setError(error.message);
      setSending(false);
      return;
    }
    setBody("");
    setSending(false);
  }

  return (
    <div className="glass p-0 overflow-hidden flex flex-col" style={{ height: 560 }}>
      <div
        className="px-6 py-4"
        style={{ borderBottom: "1px solid rgba(232,84,122,0.18)" }}
      >
        <p
          className="text-[10px] tracking-[0.4em] uppercase font-bold"
          style={{ color: "#e8547a" }}
        >
          ✦ Conversation
        </p>
        <p
          className="text-[13px] mt-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          Admin · Project Manager · Client
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-5 space-y-3"
      >
        {messages.length === 0 && (
          <p
            className="text-[13px] italic text-center py-12"
            style={{ color: "var(--color-text-muted)" }}
          >
            No messages yet — say hello.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.author_id === currentUserId;
          const who = participants[m.author_id];
          return (
            <div
              key={m.id}
              className="flex flex-col"
              style={{ alignItems: mine ? "flex-end" : "flex-start" }}
            >
              <div
                className="max-w-[78%] px-4 py-3 rounded-2xl"
                style={{
                  background: mine
                    ? "linear-gradient(135deg, #e8547a, #b89ce0)"
                    : "rgba(255,255,255,0.8)",
                  color: mine ? "white" : "var(--color-text-deep)",
                  border: mine
                    ? "1px solid rgba(255,255,255,0.4)"
                    : "1px solid rgba(232,84,122,0.18)",
                  borderBottomRightRadius: mine ? 4 : 16,
                  borderBottomLeftRadius: mine ? 16 : 4,
                }}
              >
                {!mine && (
                  <p
                    className="text-[10px] tracking-[0.18em] uppercase font-bold mb-1"
                    style={{ color: "#c23b68" }}
                  >
                    {who?.name || "Someone"}
                    {who?.role ? ` · ${who.role.replace("_", " ")}` : ""}
                  </p>
                )}
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">
                  {m.body}
                </p>
              </div>
              <span
                className="text-[10px] mt-1 px-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                {new Date(m.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <p
          className="text-[12px] px-5 py-2"
          style={{ color: "#c23b68" }}
        >
          ⚠ {error}
        </p>
      )}

      <form
        onSubmit={send}
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderTop: "1px solid rgba(232,84,122,0.18)" }}
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
          maxLength={4000}
          className="flex-1 px-4 py-3 rounded-full text-[14px]"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(232,84,122,0.25)",
            color: "var(--color-text-deep)",
          }}
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="cta-solid"
          style={{ padding: "12px 24px", fontSize: 12 }}
        >
          {sending ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
