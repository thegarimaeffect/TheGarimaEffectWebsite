"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────
type Goal = {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  position: number;
  target_hours: number | null;
  created_at: string;
  archived_at: string | null;
};

type Entry = {
  id: string;
  user_id: string;
  goal_id: string;
  entry_date: string; // YYYY-MM-DD
  hours: number;
  note: string | null;
};

type DailyTotal = {
  user_id: string;
  entry_date: string;
  total_hours: number;
  goals_touched: number;
};

type Props = {
  userEmail: string;
  initialGoals: Goal[];
  initialEntries: Entry[];
  initialTotals: DailyTotal[];
  daysBack: number;
};

// ──────────────────────────────────────────────────────────────────────────
const C = {
  bg: "#070a14",
  surface: "#0d1322",
  surface2: "#131a2e",
  surface3: "#1a2340",
  border: "#1f2942",
  borderHi: "#2c3a5e",
  text: "#e6edf3",
  textDim: "#8b96b3",
  green: "#00ff9c",
  cyan: "#00d4ff",
  amber: "#ffb86c",
  red: "#ff5b6c",
  purple: "#bd93f9",
};

const PRESET_COLORS = [C.green, C.cyan, C.amber, C.purple, C.red, "#ff79c6", "#50fa7b", "#f1fa8c"];

// ──────────────────────────────────────────────────────────────────────────
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildDayList(daysBack: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < daysBack; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function fmtDateRow(iso: string): { line1: string; line2: string; isToday: boolean; isWeekend: boolean } {
  const d = new Date(iso + "T00:00:00");
  const today = todayIso();
  const isToday = iso === today;
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const day = d.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase();
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return { line1: isToday ? "TODAY" : day, line2: date, isToday, isWeekend };
}

// ──────────────────────────────────────────────────────────────────────────
export default function HackerConsole({
  userEmail,
  initialGoals,
  initialEntries,
  initialTotals,
  daysBack,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [visibleDays, setVisibleDays] = useState<number>(daysBack);

  const dayList = useMemo(() => buildDayList(visibleDays), [visibleDays]);

  // Total days actually logged (for the "show more" button to know when to stop)
  const oldestEntryDate = useMemo(() => {
    if (entries.length === 0) return null;
    return entries.reduce(
      (acc, e) => (acc === null || e.entry_date < acc ? e.entry_date : acc),
      null as string | null
    );
  }, [entries]);

  const hasMore = useMemo(() => {
    if (!oldestEntryDate) return false;
    const oldestIso = oldestEntryDate;
    const lastShown = dayList[dayList.length - 1];
    return lastShown > oldestIso;
  }, [oldestEntryDate, dayList]);

  // Map (goal_id|date) → hours for O(1) lookup
  const entryMap = useMemo(() => {
    const m = new Map<string, number>();
    entries.forEach((e) => m.set(`${e.goal_id}|${e.entry_date}`, Number(e.hours)));
    return m;
  }, [entries]);

  // Daily totals (recomputed locally for instant feedback)
  const dailyTotals = useMemo(() => {
    const m = new Map<string, number>();
    entries.forEach((e) => {
      const v = m.get(e.entry_date) || 0;
      m.set(e.entry_date, v + Number(e.hours));
    });
    return m;
  }, [entries]);

  // ── Mutations ──
  const [err, setErr] = useState<string | null>(null);

  const addGoal = useCallback(
    async (name: string) => {
      if (!name.trim()) return;
      const color = PRESET_COLORS[goals.length % PRESET_COLORS.length];
      const position = goals.length;
      const { data, error } = await supabase
        .from("hacker_goals")
        .insert({ name: name.trim(), color, position })
        .select()
        .single();
      if (error) {
        setErr(`Failed to add goal: ${error.message}`);
        console.error("[hacker] addGoal", error);
        return;
      }
      if (data) {
        setErr(null);
        setGoals((g) => [...g, data as Goal]);
      }
    },
    [goals.length, supabase]
  );

  const renameGoal = useCallback(
    async (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const { error } = await supabase.from("hacker_goals").update({ name: trimmed }).eq("id", id);
      if (!error) setGoals((g) => g.map((x) => (x.id === id ? { ...x, name: trimmed } : x)));
    },
    [supabase]
  );

  const archiveGoal = useCallback(
    async (id: string) => {
      if (!confirm("Archive this goal? Past entries are kept.")) return;
      const { error } = await supabase
        .from("hacker_goals")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);
      if (!error) setGoals((g) => g.filter((x) => x.id !== id));
    },
    [supabase]
  );

  const setCell = useCallback(
    async (goalId: string, date: string, hours: number) => {
      // Optimistic local update
      const key = `${goalId}|${date}`;
      setEntries((prev) => {
        const idx = prev.findIndex((e) => e.goal_id === goalId && e.entry_date === date);
        if (hours <= 0) {
          // delete entry
          return idx >= 0 ? prev.filter((_, i) => i !== idx) : prev;
        }
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], hours };
          return next;
        }
        return [
          ...prev,
          { id: `tmp-${Date.now()}`, user_id: "", goal_id: goalId, entry_date: date, hours, note: null },
        ];
      });

      if (hours <= 0) {
        const { error } = await supabase
          .from("hacker_entries")
          .delete()
          .eq("goal_id", goalId)
          .eq("entry_date", date);
        if (error) {
          setErr(`Failed to clear cell: ${error.message}`);
          console.error("[hacker] deleteEntry", error);
        }
      } else {
        const { error } = await supabase
          .from("hacker_entries")
          .upsert(
            { goal_id: goalId, entry_date: date, hours },
            { onConflict: "user_id,goal_id,entry_date" }
          );
        if (error) {
          setErr(`Failed to save hours: ${error.message}`);
          console.error("[hacker] upsertEntry", error);
        }
      }
    },
    [supabase]
  );

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // ── Derived for the chart ──
  const chartDays = dayList.slice(0, 14).reverse(); // 14 days, oldest left
  const chartMax = Math.max(...chartDays.map((d) => dailyTotals.get(d) || 0), 4);

  return (
    <div className="hk-root" style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <TopBar userEmail={userEmail} onSignOut={signOut} />

      <main className="hk-main">
        <AddGoalBar onAdd={addGoal} count={goals.length} />

        {err && (
          <div className="hk-err">
            <span className="hk-mono">!</span> {err}
            <button onClick={() => setErr(null)} className="hk-x" style={{ opacity: 1, marginLeft: "auto" }}>×</button>
          </div>
        )}

        {goals.length > 0 && (
          <div className="hk-howto hk-mono hk-dim">
            ↓ <strong style={{ color: "#00ff9c" }}>burn hours:</strong> click any cell in TODAY's row, type a number (e.g. 2.5), then press Enter or Tab. cells turn green as you log time. the Σ column and chart update instantly.
          </div>
        )}

        <div className="hk-grid-wrap">
          <SpreadsheetGrid
            days={dayList}
            goals={goals}
            entryMap={entryMap}
            dailyTotals={dailyTotals}
            onCellChange={setCell}
            onRenameGoal={renameGoal}
            onArchiveGoal={archiveGoal}
          />

          {goals.length > 0 && (
            <div className="hk-show-more">
              {hasMore ? (
                <button
                  onClick={() => setVisibleDays((n) => n + 30)}
                  className="hk-btn hk-btn-ghost"
                >
                  ↓ show 30 more days
                </button>
              ) : (
                <span className="hk-mono hk-dim" style={{ fontSize: 11 }}>
                  · end of logged history ·
                </span>
              )}
            </div>
          )}
        </div>

        <ChartCard days={chartDays} dailyTotals={dailyTotals} max={chartMax} />
      </main>

      <Styles />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function TopBar({ userEmail, onSignOut }: { userEmail: string; onSignOut: () => void }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return (
    <header className="hk-topbar">
      <div className="hk-brand">
        <span className="hk-blip" /> <span className="hk-mono hk-up">HACKER CONSOLE</span>
        <span className="hk-divider hk-hide-sm">/</span>
        <span className="hk-mono hk-dim hk-hide-sm">{dateStr}</span>
      </div>
      <div className="hk-user">
        <span className="hk-mono hk-dim hk-hide-sm">{userEmail}</span>
        <button onClick={onSignOut} className="hk-btn hk-btn-ghost">sign out</button>
      </div>
    </header>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function AddGoalBar({ onAdd, count }: { onAdd: (name: string) => void; count: number }) {
  const [value, setValue] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
  };
  return (
    <form onSubmit={submit} className="hk-add">
      <span className="hk-prompt">$</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={count === 0 ? "add your first goal — e.g. LeetCode, DSA, Reading…" : "add another goal…"}
        className="hk-input"
        autoFocus={count === 0}
      />
      <button type="submit" className="hk-btn hk-btn-primary" disabled={!value.trim()}>
        + add goal
      </button>
    </form>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function SpreadsheetGrid({
  days,
  goals,
  entryMap,
  dailyTotals,
  onCellChange,
  onRenameGoal,
  onArchiveGoal,
}: {
  days: string[];
  goals: Goal[];
  entryMap: Map<string, number>;
  dailyTotals: Map<string, number>;
  onCellChange: (goalId: string, date: string, hours: number) => void;
  onRenameGoal: (id: string, name: string) => void;
  onArchiveGoal: (id: string) => void;
}) {
  if (goals.length === 0) {
    return (
      <div className="hk-card hk-empty-state">
        <p className="hk-mono hk-dim">
          ↑ start by adding a goal (LeetCode, DSA, Workout, Reading…)
        </p>
        <p className="hk-mono hk-dim" style={{ fontSize: 11, marginTop: 6 }}>
          each goal becomes a column. each day a row. hours go in the cells.
        </p>
      </div>
    );
  }

  return (
    <div className="hk-card hk-grid-card">
      <div className="hk-table-scroll">
        <table className="hk-table">
          <thead>
            <tr>
              <th className="hk-th-date">date</th>
              {goals.map((g) => (
                <th key={g.id} className="hk-th-goal">
                  <GoalHeader
                    goal={g}
                    onRename={(name) => onRenameGoal(g.id, name)}
                    onArchive={() => onArchiveGoal(g.id)}
                  />
                </th>
              ))}
              <th className="hk-th-total">Σ total</th>
            </tr>
          </thead>
          <tbody>
            {days.map((date) => {
              const meta = fmtDateRow(date);
              const total = dailyTotals.get(date) || 0;
              const locked = !meta.isToday;          // only TODAY is editable
              return (
                <tr
                  key={date}
                  className={
                    "hk-row" +
                    (meta.isToday ? " is-today" : "") +
                    (meta.isWeekend ? " is-weekend" : "") +
                    (locked ? " is-locked" : "")
                  }
                >
                  <th className="hk-td-date">
                    <span className="hk-mono hk-dow">{meta.line1}</span>
                    <span className="hk-mono hk-dim hk-date">{meta.line2}</span>
                    {locked && <span className="hk-lock hk-mono" title="closed — cannot be edited">🔒</span>}
                  </th>
                  {goals.map((g) => (
                    <td key={g.id} className="hk-td-cell">
                      <Cell
                        value={entryMap.get(`${g.id}|${date}`)}
                        color={g.color || C.green}
                        locked={locked}
                        onChange={(h) => onCellChange(g.id, date, h)}
                      />
                    </td>
                  ))}
                  <td className="hk-td-total">
                    <span className="hk-mono" style={{ color: total > 0 ? C.green : C.textDim }}>
                      {total > 0 ? total.toFixed(1) : "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function GoalHeader({
  goal,
  onRename,
  onArchive,
}: {
  goal: Goal;
  onRename: (n: string) => void;
  onArchive: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(goal.name);

  const save = () => {
    if (value.trim() && value.trim() !== goal.name) onRename(value);
    setEditing(false);
  };

  return (
    <div className="hk-goal-head">
      <span className="hk-goal-dot" style={{ background: goal.color || C.green }} />
      {editing ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") { setValue(goal.name); setEditing(false); } }}
          className="hk-goal-edit"
          autoFocus
        />
      ) : (
        <span className="hk-goal-name" onDoubleClick={() => setEditing(true)} title="double-click to rename">
          {goal.name}
        </span>
      )}
      <button onClick={onArchive} className="hk-x" title="archive goal" aria-label="archive">×</button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function Cell({
  value,
  color,
  locked,
  onChange,
}: {
  value: number | undefined;
  color: string;
  locked: boolean;          // true = past day, read-only
  onChange: (h: number) => void;
}) {
  const [draft, setDraft] = useState<string>(value && value > 0 ? String(value) : "");
  // Sync local draft when external value changes (e.g. after save or refresh)
  useEffect(() => {
    setDraft(value && value > 0 ? String(value) : "");
  }, [value]);

  const commit = () => {
    if (locked) return;
    if (draft === "") {
      if (value && value > 0) onChange(0);
      return;
    }
    const n = parseFloat(draft);
    if (Number.isNaN(n) || n < 0 || n > 24) {
      setDraft(value && value > 0 ? String(value) : "");
      return;
    }
    if (n !== value) onChange(n);
  };

  const intensity = value && value > 0 ? Math.min(1, value / 6) : 0;
  const display = value && value > 0 ? value.toFixed(value % 1 === 0 ? 0 : 1) : "";

  // Locked past-day cell — render a static view, no editable input
  if (locked) {
    return (
      <div
        className="hk-cell hk-cell-locked"
        title="this day is closed and cannot be edited"
        style={{
          background: intensity > 0 ? `rgba(0,255,156,${0.05 + intensity * 0.14})` : "transparent",
          color: intensity > 0 ? color : C.textDim,
        }}
      >
        {display || "—"}
      </div>
    );
  }

  return (
    <input
      value={draft}
      onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") {
          setDraft(value && value > 0 ? String(value) : "");
          (e.target as HTMLInputElement).blur();
        }
      }}
      inputMode="decimal"
      placeholder="—"
      className="hk-cell"
      style={{
        background: intensity > 0 ? `rgba(0,255,156,${0.08 + intensity * 0.18})` : "transparent",
        color: intensity > 0 ? color : C.textDim,
        borderColor: intensity > 0 ? `${color}55` : "transparent",
      }}
    />
  );
}

// ──────────────────────────────────────────────────────────────────────────
function ChartCard({
  days,
  dailyTotals,
  max,
}: {
  days: string[];
  dailyTotals: Map<string, number>;
  max: number;
}) {
  const total = days.reduce((acc, d) => acc + (dailyTotals.get(d) || 0), 0);
  const avg = total / days.length;
  return (
    <div className="hk-card">
      <div className="hk-card-head">
        <h3 className="hk-mono hk-h">daily total — last 14 days</h3>
        <div className="hk-chart-meta hk-mono hk-dim">
          <span>Σ {total.toFixed(1)}h</span>
          <span style={{ marginLeft: 18 }}>avg {avg.toFixed(1)}h/day</span>
        </div>
      </div>
      <div className="hk-bars">
        {days.map((iso, i) => {
          const h = dailyTotals.get(iso) || 0;
          const pct = (h / max) * 100;
          const isToday = iso === todayIso();
          const d = new Date(iso + "T00:00:00");
          return (
            <div key={iso} className="hk-bar-col" title={`${iso}: ${h.toFixed(1)}h`}>
              <div className="hk-bar-val hk-mono hk-dim">{h > 0 ? h.toFixed(1) : ""}</div>
              <div
                className="hk-bar"
                style={{
                  height: `${Math.max(2, pct)}%`,
                  background: isToday ? C.green : C.cyan,
                  opacity: h === 0 ? 0.15 : 0.9,
                  boxShadow: isToday && h > 0 ? `0 0 12px ${C.green}80` : undefined,
                }}
              />
              <span className="hk-bar-label hk-mono hk-dim">
                {d.toLocaleDateString("en-GB", { weekday: "short" })[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style jsx global>{`
      .hk-root { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
      .hk-mono { font-family: ui-monospace, "SF Mono", "JetBrains Mono", "Consolas", monospace; }
      .hk-up { text-transform: uppercase; letter-spacing: 0.2em; font-size: 12px; font-weight: 700; }
      .hk-dim { color: ${C.textDim}; }
      .hk-hide-sm { display: none; }
      @media (min-width: 768px) { .hk-hide-sm { display: inline; } }

      .hk-topbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 24px;
        border-bottom: 1px solid ${C.border};
        background: rgba(13,19,34,0.85); backdrop-filter: blur(10px);
        position: sticky; top: 0; z-index: 10;
      }
      .hk-brand { display: flex; align-items: center; gap: 12px; }
      .hk-blip {
        width: 8px; height: 8px; border-radius: 999px; background: ${C.green};
        box-shadow: 0 0 12px ${C.green};
        animation: hk-blink 1.6s ease-in-out infinite;
      }
      @keyframes hk-blink { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
      .hk-divider { color: ${C.border}; }
      .hk-user { display: flex; align-items: center; gap: 14px; }

      .hk-main {
        max-width: 1500px;
        margin: 0 auto;
        padding: 24px;
        display: flex; flex-direction: column; gap: 20px;
      }

      /* ADD GOAL BAR */
      .hk-add {
        display: flex; align-items: center; gap: 10px;
        background: ${C.surface};
        border: 1px solid ${C.border};
        border-radius: 14px;
        padding: 14px 18px;
      }
      .hk-prompt { color: ${C.green}; font-family: ui-monospace, monospace; font-size: 18px; }
      .hk-input {
        flex: 1; background: transparent; border: 0; color: ${C.text};
        font-size: 15px; outline: none;
        font-family: ui-monospace, monospace;
      }
      .hk-input::placeholder { color: ${C.textDim}; }

      /* ERROR BANNER */
      .hk-err {
        display: flex; align-items: center; gap: 10px;
        padding: 12px 16px;
        background: rgba(255, 91, 108, 0.08);
        border: 1px solid rgba(255, 91, 108, 0.4);
        color: ${C.red};
        border-radius: 12px;
        font-family: ui-monospace, monospace;
        font-size: 13px;
      }

      /* HOW-TO HINT */
      .hk-howto {
        font-size: 12px;
        padding: 4px 4px 0;
        line-height: 1.6;
      }
      .hk-howto strong { font-weight: 700; letter-spacing: 0.05em; }

      /* CARDS */
      .hk-card {
        background: ${C.surface};
        border: 1px solid ${C.border};
        border-radius: 14px;
        padding: 22px;
        box-shadow: 0 24px 40px rgba(0,0,0,0.3);
      }
      .hk-card-head {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 16px;
      }
      .hk-h {
        font-size: 11px; font-weight: 700; letter-spacing: 0.22em;
        text-transform: uppercase; color: ${C.text}; margin: 0;
      }
      .hk-empty-state { text-align: center; padding: 56px 22px; }

      /* BUTTONS */
      .hk-btn {
        background: transparent; border: 1px solid ${C.border}; color: ${C.text};
        padding: 8px 14px; border-radius: 8px;
        font-family: ui-monospace, monospace; font-size: 12px;
        cursor: pointer; transition: all 0.18s ease;
      }
      .hk-btn:hover { border-color: ${C.green}; color: ${C.green}; }
      .hk-btn-primary {
        background: ${C.green}; color: ${C.bg}; border-color: ${C.green};
        font-weight: 700;
      }
      .hk-btn-primary:hover { background: #22ffaa; color: ${C.bg}; }
      .hk-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
      .hk-btn-ghost { background: transparent; }

      /* GRID / TABLE */
      .hk-grid-card { padding: 0; overflow: hidden; }
      .hk-table-scroll { overflow-x: auto; max-height: 70vh; overflow-y: auto; }
      .hk-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-size: 13px;
        min-width: 480px;
      }
      .hk-table th, .hk-table td {
        padding: 0;
        border-bottom: 1px solid ${C.border};
      }
      .hk-table thead th {
        position: sticky; top: 0;
        background: ${C.surface2};
        border-bottom: 1px solid ${C.borderHi};
        font-family: ui-monospace, monospace;
        font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em;
        color: ${C.textDim};
        padding: 14px 12px;
        text-align: left;
        z-index: 2;
      }
      .hk-th-date {
        position: sticky; left: 0; z-index: 3 !important;
        min-width: 110px;
      }
      .hk-th-goal { min-width: 140px; }
      .hk-th-total { min-width: 80px; text-align: right; padding-right: 18px !important; }

      .hk-row { transition: background 0.12s ease; }
      .hk-row:hover { background: ${C.surface2}; }
      .hk-row.is-weekend { background: rgba(255,255,255,0.012); }
      .hk-row.is-today {
        background: rgba(0,255,156,0.04);
        border-left: 3px solid ${C.green};
      }
      .hk-row.is-today .hk-td-date { color: ${C.green}; }

      .hk-td-date {
        position: sticky; left: 0;
        background: ${C.surface};
        padding: 14px 14px;
        text-align: left;
        font-weight: 600;
        z-index: 1;
        border-right: 1px solid ${C.border};
        display: flex; flex-direction: column; gap: 2px;
      }
      .hk-row:hover .hk-td-date { background: ${C.surface2}; }
      .hk-row.is-today .hk-td-date { background: rgba(0,255,156,0.04); }
      .hk-dow { font-size: 12px; letter-spacing: 0.14em; }
      .hk-date { font-size: 10px; letter-spacing: 0.1em; }

      .hk-td-cell { padding: 8px; }
      .hk-cell {
        width: 100%;
        background: transparent;
        border: 1px dashed transparent;
        border-radius: 6px;
        padding: 8px 10px;
        color: ${C.text};
        font-family: ui-monospace, monospace;
        font-size: 13px;
        text-align: center;
        outline: none;
        transition: all 0.15s ease;
      }
      .hk-cell::placeholder { color: ${C.textDim}; }
      .hk-cell:hover { border-color: ${C.borderHi}; background: ${C.surface2}; }
      .hk-cell:focus {
        border-color: ${C.green} !important;
        background: rgba(0,255,156,0.08) !important;
        box-shadow: 0 0 0 2px rgba(0,255,156,0.15);
      }
      .hk-cell-locked {
        cursor: not-allowed;
        user-select: none;
        opacity: 0.85;
      }
      .hk-cell-locked:hover { background: transparent !important; border-color: transparent !important; }
      .hk-lock {
        font-size: 9px;
        margin-left: 6px;
        opacity: 0.5;
      }
      .hk-row.is-locked { opacity: 0.92; }

      .hk-show-more {
        display: flex; justify-content: center;
        padding: 14px 0 4px;
      }

      .hk-td-total {
        text-align: right;
        padding: 14px 18px;
        font-weight: 700;
        font-size: 13px;
        border-left: 1px solid ${C.border};
        background: ${C.surface2};
      }

      /* GOAL HEADER (in <th>) */
      .hk-goal-head { display: flex; align-items: center; gap: 8px; }
      .hk-goal-dot { width: 7px; height: 7px; border-radius: 999px; flex-shrink: 0; box-shadow: 0 0 8px currentColor; }
      .hk-goal-name {
        color: ${C.text}; font-family: inherit; cursor: text;
        text-transform: none; letter-spacing: 0;
      }
      .hk-goal-edit {
        background: ${C.surface3}; border: 1px solid ${C.borderHi};
        color: ${C.text}; border-radius: 4px;
        padding: 2px 6px; outline: none;
        font-family: ui-monospace, monospace; font-size: 11px;
        width: 100px;
      }
      .hk-x {
        background: transparent; border: 0; color: ${C.textDim};
        cursor: pointer; padding: 0 4px; font-size: 16px;
        margin-left: auto; line-height: 1; opacity: 0;
        transition: opacity 0.15s, color 0.15s;
      }
      .hk-th-goal:hover .hk-x { opacity: 1; }
      .hk-x:hover { color: ${C.red}; }

      /* CHART */
      .hk-chart-meta { display: flex; align-items: center; font-size: 11px; }
      .hk-bars {
        display: grid;
        grid-template-columns: repeat(14, 1fr);
        gap: 5px;
        align-items: end;
        height: 160px;
      }
      .hk-bar-col {
        display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
        height: 100%;
        position: relative;
      }
      .hk-bar-val {
        font-size: 9px;
        margin-bottom: 4px;
        height: 12px;
      }
      .hk-bar {
        width: 100%;
        border-radius: 3px 3px 0 0;
        min-height: 2px;
        transition: opacity 0.18s ease, height 0.4s ease;
      }
      .hk-bar-label { font-size: 9px; margin-top: 6px; }
    `}</style>
  );
}
