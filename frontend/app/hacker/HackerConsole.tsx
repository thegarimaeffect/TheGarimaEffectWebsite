"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────
type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "normal" | "high" | "critical";
  category: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  position: number;
  created_at: string;
  completed_at: string | null;
};

type DailyHours = { user_id: string; log_date: string; hours: number };
type Today = { done_today: number; open_count: number; hours_today: number };

type Props = {
  userEmail: string;
  initialTasks: Task[];
  initialDaily: DailyHours[];
  initialToday: Today;
};

// ──────────────────────────────────────────────────────────────────────────
// Aesthetic — terminal/hacker dark theme, isolated from brand
// ──────────────────────────────────────────────────────────────────────────
const C = {
  bg: "#070a14",
  surface: "#0d1322",
  surface2: "#131a2e",
  border: "#1f2942",
  text: "#e6edf3",
  textDim: "#8b96b3",
  green: "#00ff9c",
  cyan: "#00d4ff",
  amber: "#ffb86c",
  red: "#ff5b6c",
  purple: "#bd93f9",
};

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  low: C.textDim,
  normal: C.cyan,
  high: C.amber,
  critical: C.red,
};

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────
export default function HackerConsole({
  userEmail,
  initialTasks,
  initialDaily,
  initialToday,
}: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [daily, setDaily] = useState<DailyHours[]>(initialDaily);
  const [today, setToday] = useState<Today>(initialToday);
  const [, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const [t, d, td] = await Promise.all([
      supabase.from("hacker_tasks").select("*").order("position").order("created_at", { ascending: false }),
      supabase.from("hacker_daily_hours").select("*"),
      supabase.from("hacker_today").select("*").single(),
    ]);
    if (t.data) setTasks(t.data as Task[]);
    if (d.data) setDaily(d.data as DailyHours[]);
    if (td.data) setToday(td.data as Today);
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="hk-root" style={{ background: C.bg, color: C.text, minHeight: "100vh" }}>
      <TopBar userEmail={userEmail} onSignOut={signOut} />

      <main className="hk-main">
        {/* Left: tasks (wide) */}
        <section className="hk-col-wide">
          <AddTask onAdded={refresh} supabase={supabase} />
          <TasksList
            tasks={tasks}
            onChanged={refresh}
            supabase={supabase}
            startTransition={startTransition}
          />
        </section>

        {/* Right: calendar + today stats + chart (narrow) */}
        <section className="hk-col-narrow">
          <TodayCard today={today} />
          <Calendar daily={daily} />
          <HoursChart daily={daily} />
        </section>
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
        <span className="hk-divider">/</span>
        <span className="hk-mono hk-dim">{dateStr}</span>
      </div>
      <div className="hk-user">
        <span className="hk-mono hk-dim hk-hide-sm">{userEmail}</span>
        <button onClick={onSignOut} className="hk-btn hk-btn-ghost">sign out</button>
      </div>
    </header>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function AddTask({
  onAdded,
  supabase,
}: {
  onAdded: () => void;
  supabase: ReturnType<typeof createClient>;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("normal");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    await supabase.from("hacker_tasks").insert({
      title: title.trim(),
      priority,
      status: "todo",
    });
    setTitle("");
    setBusy(false);
    onAdded();
  };

  return (
    <form onSubmit={submit} className="hk-add">
      <span className="hk-prompt">$</span>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="add a task and press enter…"
        className="hk-input"
        autoFocus
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Task["priority"])}
        className="hk-select"
      >
        <option value="low">low</option>
        <option value="normal">normal</option>
        <option value="high">high</option>
        <option value="critical">critical</option>
      </select>
      <button type="submit" disabled={busy} className="hk-btn hk-btn-primary">
        {busy ? "…" : "add"}
      </button>
    </form>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function TasksList({
  tasks,
  onChanged,
  supabase,
  startTransition,
}: {
  tasks: Task[];
  onChanged: () => void;
  supabase: ReturnType<typeof createClient>;
  startTransition: React.TransitionStartFunction;
}) {
  const [filter, setFilter] = useState<"open" | "today" | "all" | "done">("open");

  const visible = useMemo(() => {
    if (filter === "open") return tasks.filter((t) => t.status !== "done");
    if (filter === "done") return tasks.filter((t) => t.status === "done");
    if (filter === "today") {
      const today = new Date().toISOString().slice(0, 10);
      return tasks.filter((t) =>
        t.status !== "done" && (t.due_date === today || t.due_date === null)
      );
    }
    return tasks;
  }, [tasks, filter]);

  const cycleStatus = async (t: Task) => {
    const next: Task["status"] =
      t.status === "todo" ? "in_progress" :
      t.status === "in_progress" ? "done" : "todo";
    startTransition(async () => {
      await supabase.from("hacker_tasks").update({ status: next }).eq("id", t.id);
      onChanged();
    });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await supabase.from("hacker_tasks").delete().eq("id", id);
    onChanged();
  };

  const logTime = async (t: Task) => {
    const raw = prompt(`Log hours for "${t.title}"\n(e.g. 0.5, 1.25, 3)`);
    if (!raw) return;
    const h = parseFloat(raw);
    if (!h || h <= 0 || h > 24) return alert("Enter a number between 0 and 24");
    const note = prompt("Optional note") || null;
    await supabase.from("hacker_time_logs").insert({ task_id: t.id, hours: h, note });
    onChanged();
  };

  return (
    <div className="hk-card">
      <div className="hk-card-head">
        <h2 className="hk-mono hk-h">tasks</h2>
        <div className="hk-tabs">
          {(["open", "today", "done", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`hk-tab ${filter === f ? "is-active" : ""}`}
            >
              {f}
              {f === "open" && (
                <span className="hk-tab-count">{tasks.filter(t=>t.status!=="done").length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && (
        <p className="hk-empty hk-mono hk-dim">no tasks yet — add one above</p>
      )}

      <ul className="hk-tasks">
        {visible.map((t) => (
          <li key={t.id} className={`hk-task hk-task-${t.status}`}>
            <button
              onClick={() => cycleStatus(t)}
              className={`hk-status hk-status-${t.status}`}
              title="click to cycle status"
            >
              {t.status === "todo" && "◯"}
              {t.status === "in_progress" && "◐"}
              {t.status === "done" && "●"}
            </button>

            <span
              className="hk-priority-dot"
              style={{ background: PRIORITY_COLOR[t.priority] }}
              title={t.priority}
            />

            <span className="hk-task-title">{t.title}</span>

            {t.category && <span className="hk-tag">#{t.category}</span>}

            <div className="hk-task-actions">
              <button onClick={() => logTime(t)} className="hk-btn hk-btn-ghost hk-btn-sm" title="log time">
                ⏱ log
              </button>
              <button onClick={() => remove(t.id)} className="hk-btn hk-btn-ghost hk-btn-sm" title="delete">
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function TodayCard({ today }: { today: Today }) {
  return (
    <div className="hk-card">
      <h3 className="hk-mono hk-h">today</h3>
      <div className="hk-stat-row">
        <Stat value={Number(today.hours_today || 0).toFixed(1)} label="hours logged" accent={C.green} />
        <Stat value={String(today.done_today || 0)} label="done today" accent={C.cyan} />
        <Stat value={String(today.open_count || 0)} label="open" accent={C.amber} />
      </div>
    </div>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="hk-stat">
      <div className="hk-stat-num hk-mono" style={{ color: accent }}>{value}</div>
      <div className="hk-stat-label hk-mono hk-dim">{label}</div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function Calendar({ daily }: { daily: DailyHours[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstWeekday = (first.getDay() + 6) % 7; // make Monday=0
  const days = last.getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let i = 1; i <= days; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const hoursByDate: Record<string, number> = {};
  daily.forEach((d) => { hoursByDate[d.log_date] = Number(d.hours); });
  const monthLabel = first.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="hk-card">
      <h3 className="hk-mono hk-h">calendar — {monthLabel}</h3>
      <div className="hk-cal-grid">
        {["m","t","w","t","f","s","s"].map((d, i) => (
          <div key={i} className="hk-cal-dow hk-mono hk-dim">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="hk-cal-cell hk-cal-empty" />;
          const iso = new Date(year, month, day).toISOString().slice(0, 10);
          const h = hoursByDate[iso] || 0;
          const isToday = day === today.getDate();
          return (
            <div
              key={i}
              className={`hk-cal-cell ${isToday ? "is-today" : ""}`}
              title={h ? `${h}h logged` : ""}
            >
              <span className="hk-cal-day hk-mono">{day}</span>
              {h > 0 && <span className="hk-cal-dot" style={{ opacity: Math.min(1, h / 6) }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function HoursChart({ daily }: { daily: DailyHours[] }) {
  // Build last 14 days
  const days: { date: string; hours: number; label: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const found = daily.find((x) => x.log_date === iso);
    days.push({
      date: iso,
      hours: found ? Number(found.hours) : 0,
      label: d.toLocaleDateString("en-GB", { weekday: "short" })[0],
    });
  }
  const max = Math.max(...days.map((d) => d.hours), 4);
  const total = days.reduce((a, b) => a + b.hours, 0);

  return (
    <div className="hk-card">
      <div className="hk-card-head">
        <h3 className="hk-mono hk-h">hours — last 14d</h3>
        <span className="hk-mono hk-dim">Σ {total.toFixed(1)}h</span>
      </div>
      <div className="hk-bars">
        {days.map((d, i) => {
          const h = (d.hours / max) * 100;
          const isToday = i === days.length - 1;
          return (
            <div key={d.date} className="hk-bar-col" title={`${d.date}: ${d.hours}h`}>
              <div
                className="hk-bar"
                style={{
                  height: `${Math.max(2, h)}%`,
                  background: isToday ? C.green : C.cyan,
                  opacity: d.hours === 0 ? 0.2 : 0.9,
                }}
              />
              <span className="hk-bar-label hk-mono hk-dim">{d.label}</span>
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
      .hk-root {
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
      }
      .hk-mono { font-family: ui-monospace, "SF Mono", "JetBrains Mono", "Consolas", monospace; }
      .hk-up { text-transform: uppercase; letter-spacing: 0.2em; font-size: 12px; font-weight: 700; }
      .hk-dim { color: ${C.textDim}; }
      .hk-hide-sm { display: none; }
      @media (min-width: 640px) { .hk-hide-sm { display: inline; } }

      /* TOP BAR */
      .hk-topbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 18px 28px;
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

      /* MAIN GRID */
      .hk-main {
        display: grid;
        grid-template-columns: 1fr;
        gap: 18px;
        padding: 26px 22px;
        max-width: 1400px;
        margin: 0 auto;
      }
      @media (min-width: 960px) {
        .hk-main { grid-template-columns: 1.6fr 1fr; padding: 32px; gap: 24px; }
      }
      .hk-col-wide, .hk-col-narrow {
        display: flex; flex-direction: column; gap: 18px;
      }

      /* CARD */
      .hk-card {
        background: ${C.surface};
        border: 1px solid ${C.border};
        border-radius: 14px;
        padding: 20px 22px;
        box-shadow: 0 1px 0 rgba(255,255,255,0.03), 0 24px 40px rgba(0,0,0,0.3);
      }
      .hk-card-head {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 14px;
      }
      .hk-h {
        font-size: 12px; font-weight: 700; letter-spacing: 0.2em;
        text-transform: uppercase; color: ${C.text};
        margin: 0;
      }

      /* ADD TASK */
      .hk-add {
        display: flex; align-items: stretch; gap: 8px;
        background: ${C.surface};
        border: 1px solid ${C.border};
        border-radius: 14px;
        padding: 10px 14px;
        margin-bottom: 0;
      }
      .hk-prompt { color: ${C.green}; font-family: ui-monospace, monospace; align-self: center; }
      .hk-input {
        flex: 1; background: transparent; border: 0; color: ${C.text};
        font-size: 14px; outline: none;
      }
      .hk-input::placeholder { color: ${C.textDim}; }
      .hk-select {
        background: ${C.surface2}; border: 1px solid ${C.border}; color: ${C.text};
        font-family: ui-monospace, monospace; font-size: 12px;
        padding: 6px 10px; border-radius: 8px; outline: none;
      }

      /* BUTTONS */
      .hk-btn {
        background: transparent; border: 1px solid ${C.border}; color: ${C.text};
        padding: 6px 12px; border-radius: 8px;
        font-family: ui-monospace, monospace; font-size: 12px;
        cursor: pointer; transition: all 0.18s ease;
      }
      .hk-btn:hover { border-color: ${C.green}; color: ${C.green}; }
      .hk-btn-primary {
        background: ${C.green}; color: ${C.bg}; border-color: ${C.green};
        font-weight: 700;
      }
      .hk-btn-primary:hover { background: #22ffaa; color: ${C.bg}; }
      .hk-btn-ghost { background: transparent; }
      .hk-btn-sm { padding: 4px 8px; font-size: 11px; }

      /* TABS */
      .hk-tabs { display: flex; gap: 4px; }
      .hk-tab {
        background: transparent; border: 0; color: ${C.textDim};
        font-family: ui-monospace, monospace; font-size: 11px;
        padding: 6px 10px; border-radius: 6px;
        cursor: pointer; text-transform: lowercase;
        display: inline-flex; align-items: center; gap: 6px;
      }
      .hk-tab:hover { color: ${C.text}; background: ${C.surface2}; }
      .hk-tab.is-active { color: ${C.green}; background: rgba(0,255,156,0.08); }
      .hk-tab-count {
        background: ${C.surface2}; color: ${C.textDim};
        font-size: 10px; padding: 1px 6px; border-radius: 99px;
      }
      .hk-tab.is-active .hk-tab-count { background: rgba(0,255,156,0.15); color: ${C.green}; }

      /* TASKS LIST */
      .hk-tasks { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
      .hk-task {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 10px; border-radius: 10px;
        transition: background 0.18s ease;
      }
      .hk-task:hover { background: ${C.surface2}; }
      .hk-task-done .hk-task-title { color: ${C.textDim}; text-decoration: line-through; }

      .hk-status {
        background: transparent; border: 0; cursor: pointer;
        font-size: 22px; line-height: 1; color: ${C.textDim};
        transition: color 0.18s ease;
        padding: 0; width: 28px; height: 28px;
      }
      .hk-status-todo { color: ${C.textDim}; }
      .hk-status-in_progress { color: ${C.cyan}; }
      .hk-status-done { color: ${C.green}; }
      .hk-status:hover { transform: scale(1.1); }

      .hk-priority-dot {
        width: 8px; height: 8px; border-radius: 999px;
        flex-shrink: 0;
      }
      .hk-task-title {
        flex: 1; color: ${C.text}; font-size: 14px;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .hk-tag {
        background: ${C.surface2}; color: ${C.purple};
        font-family: ui-monospace, monospace; font-size: 11px;
        padding: 2px 8px; border-radius: 99px;
      }
      .hk-task-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.18s ease; }
      .hk-task:hover .hk-task-actions { opacity: 1; }
      @media (max-width: 640px) { .hk-task-actions { opacity: 1; } }

      .hk-empty { padding: 24px 0; text-align: center; }

      /* STATS */
      .hk-stat-row {
        display: grid; grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
      }
      .hk-stat {
        text-align: center;
        background: ${C.surface2};
        border-radius: 10px;
        padding: 14px 4px;
      }
      .hk-stat-num { font-size: 28px; font-weight: 700; line-height: 1; }
      .hk-stat-label { font-size: 10px; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.15em; }

      /* CALENDAR */
      .hk-cal-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
      }
      .hk-cal-dow { font-size: 10px; text-align: center; padding: 4px 0; text-transform: uppercase; }
      .hk-cal-cell {
        aspect-ratio: 1;
        position: relative;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        border-radius: 8px;
        background: ${C.surface2};
        font-size: 12px;
      }
      .hk-cal-empty { background: transparent; }
      .hk-cal-day { color: ${C.text}; }
      .hk-cal-cell.is-today {
        background: ${C.green};
        box-shadow: 0 0 14px rgba(0,255,156,0.6);
      }
      .hk-cal-cell.is-today .hk-cal-day { color: ${C.bg}; font-weight: 700; }
      .hk-cal-dot {
        position: absolute; bottom: 4px;
        width: 5px; height: 5px; border-radius: 999px;
        background: ${C.cyan};
      }
      .hk-cal-cell.is-today .hk-cal-dot { background: ${C.bg}; opacity: 0.7; }

      /* BARS */
      .hk-bars {
        display: grid;
        grid-template-columns: repeat(14, 1fr);
        gap: 4px;
        align-items: end;
        height: 130px;
      }
      .hk-bar-col {
        display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
        height: 100%;
      }
      .hk-bar {
        width: 100%;
        border-radius: 3px 3px 0 0;
        min-height: 2px;
        transition: opacity 0.18s ease;
      }
      .hk-bar-label { font-size: 9px; margin-top: 6px; }
    `}</style>
  );
}
