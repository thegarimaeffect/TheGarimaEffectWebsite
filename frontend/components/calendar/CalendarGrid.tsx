"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CalendarRow, RowStatus } from "@/lib/supabase/database.types";

const POST_TYPES = ["Reel", "Carousel", "Story", "Live", "Post", "UGC"];
const PILLARS = ["Brand", "Product", "Educational", "UGC", "Engagement"];
const ROW_STATUSES: RowStatus[] = ["draft", "ready", "in_production", "posted"];

/**
 * Editable spreadsheet-style calendar grid.
 *
 * mode="pm"     → full edit of content columns, can delete rows
 * mode="client" → read-only content, can edit only the client_inputs column
 *                  (RLS + the DB client-guard trigger enforce this regardless)
 */
export default function CalendarGrid({
  rows,
  calendarId,
  mode,
  editable,
}: {
  rows: CalendarRow[];
  calendarId: string;
  mode: "pm" | "client";
  editable: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Local working copy keyed by row id → field → value
  const [draft, setDraft] = useState<Record<string, Partial<CalendarRow>>>({});

  function val<K extends keyof CalendarRow>(row: CalendarRow, key: K): CalendarRow[K] {
    const d = draft[row.id];
    return d && key in d ? (d[key] as CalendarRow[K]) : row[key];
  }

  function setLocal(rowId: string, key: keyof CalendarRow, value: unknown) {
    setDraft((p) => ({ ...p, [rowId]: { ...p[rowId], [key]: value } }));
  }

  async function commit(rowId: string, key: keyof CalendarRow, value: unknown) {
    setError(null);
    setBusy(rowId);
    try {
      const res = await fetch(`/api/calendar/rows/${rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "save failed");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function addRow() {
    setError(null);
    setBusy("new");
    try {
      const res = await fetch("/api/calendar/rows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendar_id: calendarId,
          row_order: rows.length + 1,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "could not add row");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function removeRow(rowId: string) {
    if (!confirm("Delete this row?")) return;
    setBusy(rowId);
    try {
      const res = await fetch(`/api/calendar/rows/${rowId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "delete failed");
      }
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const pmEdit = mode === "pm" && editable;
  const clientEdit = mode === "client" && editable;

  return (
    <div>
      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-[13px]"
          style={{
            background: "rgba(232,84,122,0.1)",
            color: "#c23b68",
            border: "1px solid rgba(232,84,122,0.3)",
          }}
        >
          ⚠ {error}
        </div>
      )}

      <div
        className="overflow-x-auto rounded-[20px]"
        style={{
          border: "1px solid rgba(232,84,122,0.2)",
          background: "rgba(255,255,255,0.6)",
        }}
      >
        <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 1180 }}>
          <thead>
            <tr
              style={{
                background:
                  "linear-gradient(135deg, rgba(232,84,122,0.12), rgba(184,156,224,0.12))",
              }}
            >
              {[
                "#",
                "Date",
                "Time",
                "Type",
                "Pillar",
                "Ideation",
                "Reference",
                "Caption",
                "Drive",
                "Client Input",
                "Status",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-[10px] tracking-[0.18em] uppercase font-bold px-3 py-3 text-left"
                  style={{ color: "var(--color-text-deep)", whiteSpace: "nowrap" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.id}
                style={{
                  borderTop: "1px solid rgba(232,84,122,0.14)",
                  background:
                    idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.4)",
                  opacity: busy === row.id ? 0.5 : 1,
                }}
              >
                <td className="px-3 py-2 text-[12px] font-bold" style={{ color: "#e8547a" }}>
                  {idx + 1}
                </td>
                <Cell>
                  <input
                    type="date"
                    className="cg-input"
                    disabled={!pmEdit}
                    value={(val(row, "post_date") as string) ?? ""}
                    onChange={(e) => setLocal(row.id, "post_date", e.target.value)}
                    onBlur={(e) =>
                      pmEdit && commit(row.id, "post_date", e.target.value || null)
                    }
                  />
                </Cell>
                <Cell>
                  <input
                    type="time"
                    className="cg-input"
                    disabled={!pmEdit}
                    value={(val(row, "post_time") as string) ?? ""}
                    onChange={(e) => setLocal(row.id, "post_time", e.target.value)}
                    onBlur={(e) =>
                      pmEdit && commit(row.id, "post_time", e.target.value || null)
                    }
                  />
                </Cell>
                <Cell>
                  <select
                    className="cg-input"
                    disabled={!pmEdit}
                    value={(val(row, "post_type") as string) ?? ""}
                    onChange={(e) => {
                      setLocal(row.id, "post_type", e.target.value);
                      if (pmEdit) commit(row.id, "post_type", e.target.value || null);
                    }}
                  >
                    <option value="">—</option>
                    {POST_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Cell>
                <Cell>
                  <select
                    className="cg-input"
                    disabled={!pmEdit}
                    value={(val(row, "pillar") as string) ?? ""}
                    onChange={(e) => {
                      setLocal(row.id, "pillar", e.target.value);
                      if (pmEdit) commit(row.id, "pillar", e.target.value || null);
                    }}
                  >
                    <option value="">—</option>
                    {PILLARS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Cell>
                <Cell wide>
                  <textarea
                    className="cg-input"
                    rows={2}
                    disabled={!pmEdit}
                    value={(val(row, "ideation") as string) ?? ""}
                    onChange={(e) => setLocal(row.id, "ideation", e.target.value)}
                    onBlur={(e) =>
                      pmEdit && commit(row.id, "ideation", e.target.value || null)
                    }
                    placeholder={pmEdit ? "Concept…" : ""}
                  />
                </Cell>
                <Cell wide>
                  <textarea
                    className="cg-input"
                    rows={2}
                    disabled={!pmEdit}
                    value={(val(row, "reference") as string) ?? ""}
                    onChange={(e) => setLocal(row.id, "reference", e.target.value)}
                    onBlur={(e) =>
                      pmEdit && commit(row.id, "reference", e.target.value || null)
                    }
                    placeholder={pmEdit ? "Link / mood…" : ""}
                  />
                </Cell>
                <Cell wide>
                  <textarea
                    className="cg-input"
                    rows={2}
                    disabled={!pmEdit}
                    value={(val(row, "caption") as string) ?? ""}
                    onChange={(e) => setLocal(row.id, "caption", e.target.value)}
                    onBlur={(e) =>
                      pmEdit && commit(row.id, "caption", e.target.value || null)
                    }
                    placeholder={pmEdit ? "Caption…" : ""}
                  />
                </Cell>
                <Cell>
                  <input
                    type="url"
                    className="cg-input"
                    disabled={!pmEdit}
                    value={(val(row, "drive_link") as string) ?? ""}
                    onChange={(e) => setLocal(row.id, "drive_link", e.target.value)}
                    onBlur={(e) =>
                      pmEdit &&
                      commit(row.id, "drive_link", e.target.value.trim() || null)
                    }
                    placeholder={pmEdit ? "https://…" : ""}
                  />
                </Cell>
                <Cell wide>
                  <textarea
                    className="cg-input"
                    rows={2}
                    disabled={!clientEdit}
                    value={(val(row, "client_inputs") as string) ?? ""}
                    onChange={(e) =>
                      setLocal(row.id, "client_inputs", e.target.value)
                    }
                    onBlur={(e) =>
                      clientEdit &&
                      commit(row.id, "client_inputs", e.target.value || null)
                    }
                    placeholder={clientEdit ? "Your notes / approval…" : ""}
                    style={
                      clientEdit
                        ? {
                            background: "rgba(255,240,245,0.9)",
                            border: "1.5px solid rgba(232,84,122,0.4)",
                          }
                        : undefined
                    }
                  />
                </Cell>
                <Cell>
                  <select
                    className="cg-input"
                    disabled={!pmEdit}
                    value={val(row, "status") as string}
                    onChange={(e) => {
                      setLocal(row.id, "status", e.target.value);
                      if (pmEdit) commit(row.id, "status", e.target.value);
                    }}
                  >
                    {ROW_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </Cell>
                <td className="px-2 py-2">
                  {pmEdit && (
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={busy === row.id}
                      className="text-[14px] opacity-60 hover:opacity-100"
                      style={{ color: "#c23b68" }}
                      title="Delete row"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={12}
                  className="px-4 py-10 text-center text-[14px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  No rows yet.{" "}
                  {pmEdit ? "Add the first post below." : "The calendar is being built."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pmEdit && (
        <button
          onClick={addRow}
          disabled={busy === "new"}
          className="mt-4 text-[12px] tracking-[0.2em] uppercase font-bold py-3 px-6 rounded-xl"
          style={{
            background: "rgba(232,84,122,0.1)",
            color: "#e8547a",
            border: "1px solid rgba(232,84,122,0.35)",
          }}
        >
          {busy === "new" ? "Adding…" : "+ Add Row"}
        </button>
      )}

      <style jsx>{`
        :global(.cg-input) {
          width: 100%;
          min-width: 90px;
          padding: 7px 9px;
          border-radius: 8px;
          border: 1px solid rgba(61, 26, 77, 0.14);
          background: rgba(255, 255, 255, 0.8);
          font-size: 12.5px;
          color: var(--color-text-deep);
          font-family: inherit;
          resize: vertical;
        }
        :global(.cg-input:focus) {
          outline: none;
          border-color: #e8547a;
          background: white;
          box-shadow: 0 0 0 3px rgba(232, 84, 122, 0.12);
        }
        :global(.cg-input:disabled) {
          background: transparent;
          border-color: transparent;
          color: var(--color-text-body);
        }
      `}</style>
    </div>
  );
}

function Cell({
  children,
  wide,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <td
      className="px-2 py-2 align-top"
      style={{ minWidth: wide ? 170 : 110 }}
    >
      {children}
    </td>
  );
}
