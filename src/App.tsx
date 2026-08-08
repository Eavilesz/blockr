import { useState } from 'react'
import { Lightbulb, Plus } from 'lucide-react'
import { useBlockrState } from './hooks/useBlockrState'
import { useTheme } from './hooks/useTheme'
import { useTabTitle } from './hooks/useTabTitle'
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
import type { BacklogItem, Category, Priority } from './types'

type TaskModalState =
  | { open: false }
  | { open: true; backlogId?: string; initialTitle?: string; initialPriority?: Priority }

function App() {
  const {
    state,
    now,
    addTask,
    deleteTask,
    startTask,
    pauseRunning,
    setGoal,
    addTagOption,
    addBacklogItem,
    deleteBacklogItem,
    promoteBacklogItem,
  } = useBlockrState()
  const { theme, toggleTheme } = useTheme()
  useTabTitle(state, now)
  const [tab, setTab] = useState<TabValue>('tasks')
  const [filter, setFilter] = useState<CategoryFilterValue>('all')
  const [taskModal, setTaskModal] = useState<TaskModalState>({ open: false })
  const [showQuickCapture, setShowQuickCapture] = useState(false)

  function handleAddTask(
    title: string,
    category: Category,
    tags: string[],
    priority: Priority,
    plannedSeconds: number,
  ) {
    if (taskModal.open && taskModal.backlogId) {
      promoteBacklogItem(taskModal.backlogId, title, category, tags, priority, plannedSeconds)
    } else {
      addTask(title, category, tags, priority, plannedSeconds)
    }
    setTaskModal({ open: false })
  }

  function handlePlan(item: BacklogItem) {
    setTaskModal({
      open: true,
      backlogId: item.id,
      initialTitle: item.title,
      initialPriority: item.priority,
    })
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
        </div>
      </header>

      <TodaySummary state={state} now={now} />

      <Tabs value={tab} onChange={setTab} />

      {tab === 'tasks' && (
        <>
          <CategoryFilter value={filter} onChange={setFilter} />
          <TaskList
            tasks={state.tasks}
            filter={filter}
            running={state.running}
            now={now}
            onStart={startTask}
            onPause={pauseRunning}
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
          onClick={() => setTaskModal({ open: true })}
          aria-label="Add task"
          className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-text text-bg shadow-lg transition-transform hover:scale-105"
        >
          <Plus size={22} />
        </button>
      )}

      <Modal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false })}
        title={taskModal.open && taskModal.backlogId ? 'Plan task' : 'Add task'}
      >
        <TaskForm
          onAdd={handleAddTask}
          initialTitle={taskModal.open ? taskModal.initialTitle : undefined}
          initialPriority={taskModal.open ? taskModal.initialPriority : undefined}
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

export default App
