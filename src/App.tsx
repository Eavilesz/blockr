import { useState } from 'react'
import { LogOut, Lightbulb, Plus } from 'lucide-react'
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
import { QuickCaptureModal } from './components/QuickCaptureModal'
import { SupabaseSetupNotice } from './components/SupabaseSetupNotice'
import { LoginScreen } from './components/LoginScreen'
import type { BacklogItem, Category, Priority, Task } from './types'

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
      mode: 'plan'
      backlogId: string
      initialTitle: string
      initialCategory: Category
      initialPriority: Priority
    }
  | {
      open: true
      mode: 'edit'
      taskId: string
      initialTitle: string
      initialCategory: Category
      initialPriority: Priority
      initialTags: string[]
      initialPlannedMinutes: number
    }

function TaskTracker({ userId, onSignOut }: { userId: string; onSignOut: () => void }) {
  const {
    state,
    now,
    loading,
    addTask,
    updateTask,
    extendTask,
    deleteTask,
    startTask,
    pauseRunning,
    setGoal,
    addTagOption,
    addBacklogItem,
    deleteBacklogItem,
    promoteBacklogItem,
  } = useBlockrState(userId)
  const { theme, toggleTheme } = useTheme()
  useTabTitle(state, now)
  const [tab, setTab] = useState<TabValue>('tasks')
  const [filter, setFilter] = useState<CategoryFilterValue>('all')
  const [taskModal, setTaskModal] = useState<TaskModalState>({ open: false })
  const [showQuickCapture, setShowQuickCapture] = useState(false)

  if (loading) {
    return <FullScreenMessage text="Loading your tasks…" />
  }

  function handleSubmitTask(
    title: string,
    category: Category,
    tags: string[],
    priority: Priority,
    plannedSeconds: number,
  ) {
    if (taskModal.open && taskModal.mode === 'edit') {
      updateTask(taskModal.taskId, title, category, tags, priority, plannedSeconds)
    } else if (taskModal.open && taskModal.mode === 'plan') {
      promoteBacklogItem(taskModal.backlogId, title, category, tags, priority, plannedSeconds)
    } else {
      addTask(title, category, tags, priority, plannedSeconds)
    }
    setTaskModal({ open: false })
  }

  function handlePlan(item: BacklogItem) {
    setTaskModal({
      open: true,
      mode: 'plan',
      backlogId: item.id,
      initialTitle: item.title,
      initialCategory: item.category,
      initialPriority: item.priority,
    })
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
      initialPlannedMinutes: Math.round(task.plannedSeconds / 60),
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
            onClick={() => setShowQuickCapture(true)}
            aria-label="Save a quick idea for later"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:text-text"
          >
            <Lightbulb size={16} />
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
            onDelete={deleteTask}
          />
        </>
      )}

      {tab === 'backlog' && (
        <BacklogList items={state.backlog} onPlan={handlePlan} onDelete={deleteBacklogItem} />
      )}

      {tab === 'goals' && <WeeklyGoals state={state} now={now} onSetGoal={setGoal} />}

      {tab === 'tasks' && (
        <button
          type="button"
          onClick={() => setTaskModal({ open: true, mode: 'create' })}
          aria-label="Add task"
          className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-text text-bg shadow-lg transition-transform hover:scale-105"
        >
          <Plus size={22} />
        </button>
      )}

      <Modal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false })}
        title={
          taskModal.open && taskModal.mode === 'edit'
            ? 'Edit task'
            : taskModal.open && taskModal.mode === 'plan'
              ? 'Plan task'
              : 'Add task'
        }
      >
        <TaskForm
          onAdd={handleSubmitTask}
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
          submitLabel={taskModal.open && taskModal.mode === 'edit' ? 'Save changes' : 'Add task'}
          availableTags={state.tags}
          onAddTagOption={addTagOption}
        />
      </Modal>

      <QuickCaptureModal
        open={showQuickCapture}
        onClose={() => setShowQuickCapture(false)}
        onAdd={addBacklogItem}
      />
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
