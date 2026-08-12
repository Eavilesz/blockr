import { useState } from 'react'
import { LogOut, Plus } from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { useBlockrState } from './hooks/useBlockrState'
import { useTheme } from './hooks/useTheme'
import { useTabTitle } from './hooks/useTabTitle'
import { isSupabaseConfigured } from './lib/supabaseClient'
import { ThemeToggle } from './components/ThemeToggle'
import { TodaySummary } from './components/TodaySummary'
import { Tabs } from './components/Tabs'
import type { TabValue } from './components/Tabs'
import { CategoryFilter } from './components/CategoryFilter'
import type { CategoryFilterValue } from './components/CategoryFilter'
import { Modal } from './components/Modal'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'
import { WeeklyGoals } from './components/WeeklyGoals'
import { BacklogList } from './components/BacklogList'
import { SupabaseSetupNotice } from './components/SupabaseSetupNotice'
import { LoginScreen } from './components/LoginScreen'
import type { BacklogItem, Category, ChecklistItem, Priority, Task } from './types'

function FullScreenMessage({ text }: { text: string }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <p className="text-sm text-text-muted">{text}</p>
    </div>
  )
}

type TaskModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | {
      open: true
      mode: 'edit'
      taskId: string
      initialTitle: string
      initialCategory: Category
      initialPriority: Priority
      initialTags: string[]
      initialPlannedMinutes: number | null
      initialChecklist: ChecklistItem[]
    }

function TaskTracker({ userId, onSignOut }: { userId: string; onSignOut: () => void }) {
  const {
    state,
    now,
    loading,
    addTask,
    updateTask,
    toggleChecklistItem,
    extendTask,
    finishTask,
    deleteTask,
    startTask,
    pauseRunning,
    setGoal,
    addTagOption,
    addBacklogItem,
    deleteBacklogItem,
    moveBacklogItemToToday,
  } = useBlockrState(userId)
  const { theme, toggleTheme } = useTheme()
  useTabTitle(state, now)
  const [tab, setTab] = useState<TabValue>('tasks')
  const [filter, setFilter] = useState<CategoryFilterValue>('all')
  const [taskModal, setTaskModal] = useState<TaskModalState>({ open: false })

  if (loading) {
    return <FullScreenMessage text="Loading your tasks…" />
  }

  function handleSubmitTask(
    title: string,
    category: Category,
    tags: string[],
    priority: Priority,
    plannedSeconds: number | null,
    checklist: ChecklistItem[],
  ) {
    if (taskModal.open && taskModal.mode === 'edit') {
      updateTask(taskModal.taskId, title, category, tags, priority, plannedSeconds, checklist)
    }
    setTaskModal({ open: false })
  }

  function handleAddToday(
    title: string,
    category: Category,
    tags: string[],
    priority: Priority,
    plannedSeconds: number | null,
    checklist: ChecklistItem[],
  ) {
    addTask(title, category, tags, priority, plannedSeconds, checklist)
    setTaskModal({ open: false })
  }

  function handleAddToBacklog(
    title: string,
    category: Category,
    priority: Priority,
    checklist: ChecklistItem[],
  ) {
    addBacklogItem(title, category, priority, checklist)
    setTaskModal({ open: false })
  }

  function handleMoveToToday(item: BacklogItem) {
    moveBacklogItemToToday(item.id)
  }

  function handleEdit(task: Task) {
    setTaskModal({
      open: true,
      mode: 'edit',
      taskId: task.id,
      initialTitle: task.title,
      initialCategory: task.category,
      initialPriority: task.priority,
      initialTags: task.tags,
      initialPlannedMinutes:
        task.plannedSeconds === null ? null : Math.round(task.plannedSeconds / 60),
      initialChecklist: task.checklist,
    })
  }

  function handleExtend(taskId: string) {
    extendTask(taskId, 15 * 60)
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-130 flex-col gap-5 px-4 pb-24 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text">blockr</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTaskModal({ open: true, mode: 'create' })}
            aria-label="Add task"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:text-text"
          >
            <Plus size={16} />
          </button>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:text-text"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <Tabs value={tab} onChange={setTab} />

      {tab === 'tasks' && (
        <>
          <TodaySummary state={state} now={now} />
          <CategoryFilter value={filter} onChange={setFilter} />
          <TaskList
            tasks={state.tasks}
            filter={filter}
            running={state.running}
            now={now}
            onStart={startTask}
            onPause={pauseRunning}
            onEdit={handleEdit}
            onExtend={handleExtend}
            onFinish={finishTask}
            onDelete={deleteTask}
            onToggleChecklistItem={toggleChecklistItem}
          />
        </>
      )}

      {tab === 'backlog' && (
        <BacklogList
          items={state.backlog}
          onMoveToToday={handleMoveToToday}
          onDelete={deleteBacklogItem}
        />
      )}

      {tab === 'goals' && <WeeklyGoals state={state} now={now} onSetGoal={setGoal} />}

      <Modal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false })}
        title={taskModal.open && taskModal.mode === 'edit' ? 'Edit task' : 'Add task'}
      >
        <TaskForm
          mode={taskModal.open ? taskModal.mode : 'create'}
          onAddToday={handleAddToday}
          onAddBacklog={handleAddToBacklog}
          onSubmit={handleSubmitTask}
          initialTitle={
            taskModal.open && taskModal.mode !== 'create' ? taskModal.initialTitle : undefined
          }
          initialCategory={
            taskModal.open && taskModal.mode !== 'create' ? taskModal.initialCategory : undefined
          }
          initialPriority={
            taskModal.open && taskModal.mode !== 'create' ? taskModal.initialPriority : undefined
          }
          initialTags={taskModal.open && taskModal.mode === 'edit' ? taskModal.initialTags : undefined}
          initialPlannedMinutes={
            taskModal.open && taskModal.mode === 'edit' ? taskModal.initialPlannedMinutes : undefined
          }
          initialChecklist={
            taskModal.open && taskModal.mode === 'edit' ? taskModal.initialChecklist : undefined
          }
          submitLabel={
            taskModal.open && taskModal.mode === 'edit' ? 'Save changes' : 'Add to today'
          }
          availableTags={state.tags}
          onAddTagOption={addTagOption}
        />
      </Modal>
    </div>
  )
}

function App() {
  const { user, loading, signInWithEmail, signOut } = useAuth()

  if (!isSupabaseConfigured) {
    return <SupabaseSetupNotice />
  }

  if (loading) {
    return <FullScreenMessage text="Checking your session…" />
  }

  if (!user) {
    return <LoginScreen onSubmit={signInWithEmail} />
  }

  return <TaskTracker userId={user.id} onSignOut={signOut} />
}

export default App
