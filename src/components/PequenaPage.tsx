import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { Category } from "../types";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { formatStopwatch } from "../lib/time";
import { categoryStyles } from "../lib/categoryStyles";

type PequenaStatus = {
  is_running: boolean;
  task_title: string | null;
  category: Category | null;
  priority: "low" | "medium" | "high" | null;
  started_at: number | null;
  planned_seconds: number | null;
  time_spent_seconds: number | null;
};

const CATEGORY_LABEL_ES: Record<Category, string> = {
  work: "trabajo",
  study: "estudio",
  projects: "un proyecto",
};

const PRIORITY_LABEL_ES: Record<"low" | "medium" | "high", string> = {
  low: "baja",
  medium: "media",
  high: "alta",
};

const POLL_MS = 8000;

/** Public, no-login page at /pequena — lets my girlfriend check whether I'm currently
 *  working, without exposing anything else in the app. Reads via the `get_pequena_status`
 *  Postgres function (see supabase/pequena.sql), which only ever returns the current
 *  running task's title/category/priority/timing, never the rest of the account's data. */
export function PequenaPage() {
  const [status, setStatus] = useState<PequenaStatus | null>(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    document.title = "Para mi pequeña 🤎";
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    async function fetchStatus() {
      const { data, error } = await supabase!.rpc("get_pequena_status");
      if (cancelled) return;
      if (error) {
        console.error("Failed to load pequeña status:", error.message);
      } else {
        const row = Array.isArray(data) ? (data[0] ?? null) : data;
        setStatus(row);
      }
      setLoading(false);
    }
    fetchStatus();
    const id = setInterval(fetchStatus, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Tick every second while something's running, for a live elapsed/remaining display.
  useEffect(() => {
    if (!status?.is_running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status?.is_running]);

  const isRunning = Boolean(status?.is_running);
  const plannedSeconds = status?.planned_seconds ?? 0;
  const spentSeconds =
    isRunning && status?.started_at != null && status.time_spent_seconds != null
      ? Math.min(
          status.time_spent_seconds +
            Math.max(0, Math.floor((now - status.started_at) / 1000)),
          plannedSeconds,
        )
      : (status?.time_spent_seconds ?? 0);
  const remainingSeconds = Math.max(0, plannedSeconds - spentSeconds);
  const pct =
    plannedSeconds > 0
      ? Math.min(100, (spentSeconds / plannedSeconds) * 100)
      : 0;
  const styles = status?.category ? categoryStyles[status.category] : null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-130 flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex items-center gap-2">
        <Heart size={20} className="fill-current text-priority-high" />
        <h1 className="text-lg font-semibold text-text">Para mi pequeña</h1>
        <Heart size={20} className="fill-current text-priority-high" />
      </div>

      {!isSupabaseConfigured || loading ? (
        <p className="text-sm text-text-muted">Cargando…</p>
      ) : isRunning ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-sm text-text">
            Mi amor, ahora mismo estoy concentrado en el trabajo, pero te tengo
            presente. Ya casi termino 🤎
          </p>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
            {status?.task_title && (
              <div className="flex items-center justify-center gap-1.5 text-sm text-text">
                {styles && (
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${styles.dot}`}
                  />
                )}
                <span className="font-medium">{status.task_title}</span>
              </div>
            )}

            {status?.priority && (
              <p className="text-xs text-text-muted">
                Prioridad: {PRIORITY_LABEL_ES[status.priority]}
              </p>
            )}

            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
              <div
                className={`h-full rounded-full transition-[width] ${styles?.bg ?? "bg-text"}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            <div className="flex items-center justify-center gap-4 font-mono text-sm text-text">
              <span>
                Transcurrido{" "}
                <span className="text-text-muted">
                  {formatStopwatch(spentSeconds)}
                </span>
              </span>
              <span>
                Restante{" "}
                <span className="text-text-muted">
                  {formatStopwatch(remainingSeconds)}
                </span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-text">
          Mi amor, en este momento no estoy trabajando en nada — ¡así que ya
          casi puedo estar contigo! Vuelve a revisar en un rato 🤎
        </p>
      )}
    </div>
  );
}
