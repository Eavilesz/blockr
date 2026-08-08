import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useBlockrState } from './hooks/useBlockrState'
import { useTheme } from './hooks/useTheme'
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
import type { Category } from './types'

function App() {
  const { state, now, addTask, deleteTask, startTask, pauseRunning, setGoal } = useBlockrState()
  const { theme, toggleTheme } = useTheme()
  const [tab, setTab] = useState<TabValue>('tasks')
  const [filter, setFilter] = useState<CategoryFilterValue>('all')
  const [showAddTask, setShowAddTask] = useState(false)

  function handleAdd(title: string, category: Category, tags: string[], plannedSeconds: number) {
    addTask(title, category, tags, plannedSeconds)
    setShowAddTask(false)
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-130 flex-col gap-5 px-4 pb-24 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text">blockr</h1>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </header>

      <TodaySummary state={state} now={now} />

      <Tabs value={tab} onChange={setTab} />

      {tab === 'tasks' ? (
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
      ) : (
        <WeeklyGoals state={state} now={now} onSetGoal={setGoal} />
      )}

      {tab === 'tasks' && (
        <button
          type="button"
          onClick={() => setShowAddTask(true)}
          aria-label="Add task"
          className="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-text text-bg shadow-lg transition-transform hover:scale-105"
        >
          <Plus size={22} />
        </button>
      )}

      <Modal open={showAddTask} onClose={() => setShowAddTask(false)} title="Add task">
        <TaskForm onAdd={handleAdd} />
      </Modal>
    </div>
  )
}

export default App
