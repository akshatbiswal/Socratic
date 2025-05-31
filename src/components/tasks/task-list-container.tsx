"use client"

import { useMemo } from "react"
import { TaskSection } from "./task-section"
import { EmptyState } from "./empty-state"
import { Task, TaskFilter, TaskSort } from "./task-dashboard"
import { isToday, isTomorrow, isPast, isThisWeek, isThisMonth, startOfDay, endOfDay } from "date-fns"

interface TaskListContainerProps {
  tasks: Task[]
  filter: TaskFilter
  sort: TaskSort
  onToggleComplete: (taskId: string) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
}

export function TaskListContainer({
  tasks,
  filter,
  sort,
  onToggleComplete,
  onUpdateTask,
  onDeleteTask,
}: TaskListContainerProps) {
  const { filteredAndSortedTasks, hasActiveFilters } = useMemo(() => {
    let filtered = [...tasks]

    // Apply status filter
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(task => filter.status!.includes(task.status))
    }

    // Apply priority filter
    if (filter.priority && filter.priority.length > 0) {
      filtered = filtered.filter(task => filter.priority!.includes(task.priority))
    }

    // Apply tag filter
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(task => 
        task.tags?.some(tag => filter.tags!.includes(tag))
      )
    }

    // Apply project filter
    if (filter.projectId) {
      filtered = filtered.filter(task => task.projectId === filter.projectId)
    }

    // Apply date range filter
    if (filter.dueDate?.start || filter.dueDate?.end) {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false
        const taskDate = startOfDay(task.dueDate)
        
        if (filter.dueDate!.start && taskDate < startOfDay(filter.dueDate!.start)) {
          return false
        }
        if (filter.dueDate!.end && taskDate > endOfDay(filter.dueDate!.end)) {
          return false
        }
        return true
      })
    }

    // Sort tasks
    filtered.sort((a, b) => {
      const direction = sort.direction === 'asc' ? 1 : -1

      switch (sort.field) {
        case 'dueDate':
          // Handle null due dates (put at end for asc, beginning for desc)
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return direction > 0 ? 1 : -1
          if (!b.dueDate) return direction > 0 ? -1 : 1
          return (a.dueDate.getTime() - b.dueDate.getTime()) * direction

        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return (priorityOrder[a.priority] - priorityOrder[b.priority]) * direction

        case 'createdAt':
          return (a.createdAt.getTime() - b.createdAt.getTime()) * direction

        case 'title':
          return a.title.localeCompare(b.title) * direction

        default:
          return 0
      }
    })

    const hasActiveFilters = !!(
      (filter.status && filter.status.length > 0) ||
      (filter.priority && filter.priority.length > 0) ||
      (filter.tags && filter.tags.length > 0) ||
      filter.projectId ||
      filter.dueDate?.start ||
      filter.dueDate?.end
    )

    return { filteredAndSortedTasks: filtered, hasActiveFilters }
  }, [tasks, filter, sort])

  // Group tasks by temporal sections
  const taskSections = useMemo(() => {
    const now = new Date()
    
    const sections = [
      {
        id: 'overdue',
        title: 'Overdue',
        color: 'red' as const,
        subtitle: 'Needs immediate attention',
        tasks: filteredAndSortedTasks.filter(task => 
          task.dueDate && isPast(task.dueDate) && !isToday(task.dueDate) && !task.completed
        )
      },
      {
        id: 'today',
        title: 'Today',
        color: 'orange' as const,
        subtitle: 'Due today',
        tasks: filteredAndSortedTasks.filter(task => 
          task.dueDate && isToday(task.dueDate)
        )
      },
      {
        id: 'tomorrow',
        title: 'Tomorrow',
        color: 'blue' as const,
        subtitle: 'Due tomorrow',
        tasks: filteredAndSortedTasks.filter(task => 
          task.dueDate && isTomorrow(task.dueDate)
        )
      },
      {
        id: 'this-week',
        title: 'This Week',
        color: 'green' as const,
        subtitle: 'Due within 7 days',
        tasks: filteredAndSortedTasks.filter(task => 
          task.dueDate && 
          !isToday(task.dueDate) && 
          !isTomorrow(task.dueDate) && 
          !isPast(task.dueDate) &&
          isThisWeek(task.dueDate, { weekStartsOn: 1 })
        )
      },
      {
        id: 'this-month',
        title: 'This Month',
        color: 'purple' as const,
        subtitle: 'Due within 30 days',
        tasks: filteredAndSortedTasks.filter(task => 
          task.dueDate && 
          !isToday(task.dueDate) && 
          !isTomorrow(task.dueDate) && 
          !isPast(task.dueDate) &&
          !isThisWeek(task.dueDate, { weekStartsOn: 1 }) &&
          isThisMonth(task.dueDate)
        )
      },
      {
        id: 'later',
        title: 'Later',
        color: 'gray' as const,
        subtitle: 'Future tasks',
        tasks: filteredAndSortedTasks.filter(task => 
          task.dueDate && 
          !isToday(task.dueDate) && 
          !isTomorrow(task.dueDate) && 
          !isPast(task.dueDate) &&
          !isThisWeek(task.dueDate, { weekStartsOn: 1 }) &&
          !isThisMonth(task.dueDate)
        )
      },
      {
        id: 'no-due-date',
        title: 'No Due Date',
        color: 'gray' as const,
        subtitle: 'Tasks without deadlines',
        tasks: filteredAndSortedTasks.filter(task => !task.dueDate)
      }
    ]

    // Only return sections that have tasks or if no filters are active
    return sections.filter(section => section.tasks.length > 0)
  }, [filteredAndSortedTasks])

  // If no tasks after filtering, show empty state
  if (filteredAndSortedTasks.length === 0) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          <EmptyState 
            hasFilters={hasActiveFilters}
            filter={filter}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {taskSections.map((section) => (
          <TaskSection
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            tasks={section.tasks}
            color={section.color}
            onToggleComplete={onToggleComplete}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            defaultOpen={section.id === 'overdue' || section.id === 'today' || section.tasks.length < 10}
          />
        ))}
      </div>
    </div>
  )
} 