export type TabValue = 'tasks' | 'backlog' | 'goals'

export function Tabs({ value, onChange }: { value: TabValue; onChange: (v: TabValue) => void }) {
  const tabs: { value: TabValue; label: string }[] = [
    { value: 'tasks', label: 'Today' },
    { value: 'backlog', label: 'Backlog' },
    { value: 'goals', label: 'Weekly goals' },
  ]

  return (
    <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
            value === tab.value ? 'bg-bg text-text' : 'text-text-muted hover:text-text'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
