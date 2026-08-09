/** Shown instead of the app when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing,
 *  so a fresh checkout fails loudly with instructions instead of silently losing data. */
export function SupabaseSetupNotice() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-130 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-lg font-semibold text-text">Supabase isn't configured yet</h1>
      <p className="text-sm text-text-muted">
        blockr stores your tasks in Supabase so they sync across devices. To finish setup:
      </p>
      <ol className="flex flex-col gap-2 text-left text-sm text-text-muted">
        <li>1. Create a free project at supabase.com.</li>
        <li>
          2. Run <code className="rounded bg-surface px-1 py-0.5 text-text">supabase/schema.sql</code> in
          its SQL editor.
        </li>
        <li>
          3. Copy <code className="rounded bg-surface px-1 py-0.5 text-text">.env.example</code> to{' '}
          <code className="rounded bg-surface px-1 py-0.5 text-text">.env</code> and fill in your
          project URL and anon key.
        </li>
        <li>4. Restart the dev server.</li>
      </ol>
    </div>
  )
}
