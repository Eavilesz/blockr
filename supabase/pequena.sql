-- Powers the public "/pequena" page: lets anyone with the link see whether you're
-- currently working, without exposing your full task list, backlog, or goals.
-- Run this once in the Supabase SQL editor, after schema.sql.

create or replace function public.get_pequena_status()
returns table (
  is_running boolean,
  task_title text,
  category text,
  priority text,
  started_at bigint,
  planned_seconds integer,
  time_spent_seconds integer
)
language sql
security definer
set search_path = public
stable
as $$
  with s as (
    -- Single-user app: the most recently updated row is "you". If you ever add more
    -- users, filter this to `where user_id = '<your-auth-uid>'::uuid` instead.
    select state
    from public.blockr_state
    order by updated_at desc
    limit 1
  ),
  running_task as (
    select t
    from s, jsonb_array_elements(s.state -> 'tasks') as t
    -- `->>'taskId'` (not `->'running'`) so this is SQL NULL — and the WHERE excludes
    -- it — when `running` is JSON null, not just absent. `->'running' IS NOT NULL`
    -- is always true even for JSON null, since that's still a present jsonb value.
    where s.state -> 'running' ->> 'taskId' is not null
      and t ->> 'id' = s.state -> 'running' ->> 'taskId'
  )
  select
    (select state -> 'running' ->> 'taskId' is not null from s),
    (select t ->> 'title' from running_task),
    (select t ->> 'category' from running_task),
    (select t ->> 'priority' from running_task),
    (select (s.state -> 'running' ->> 'startedAt')::bigint from s),
    (select (t ->> 'plannedSeconds')::int from running_task),
    (select (t ->> 'timeSpentSeconds')::int from running_task);
$$;

-- security definer means this runs with the function owner's privileges (bypassing
-- RLS on blockr_state), so we only grant EXECUTE on this narrow function — anon still
-- has zero direct access to the blockr_state table itself.
grant execute on function public.get_pequena_status() to anon;
