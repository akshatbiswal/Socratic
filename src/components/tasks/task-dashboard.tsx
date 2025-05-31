"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { TaskViewHeader } from "./task-view-header"
import { TaskListContainer } from "./task-list-container"
import { TaskCreationBar } from "./task-creation-bar"

// Mock data types - these will be replaced with real data types later
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'pending' | 'in-progress' | 'completed' | 'archived'
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  tags?: string[]
  projectId?: string
}

export interface TaskFilter {
  status?: Task['status'][]
  priority?: Task['priority'][]
  tags?: string[]
  projectId?: string
  dueDate?: {
    start?: Date
    end?: Date
  }
}

export interface TaskSort {
  field: 'dueDate' | 'priority' | 'createdAt' | 'title'
  direction: 'asc' | 'desc'
}

export function TaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([
    // Sample tasks to demonstrate functionality
    {
      id: '1',
      title: 'Review quarterly performance metrics',
      description: 'Analyze Q4 data and prepare presentation for board meeting',
      completed: false,
      priority: 'critical',
      status: 'pending',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (overdue)
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tags: ['urgent', 'meeting', 'review'],
      projectId: '2', // Work
    },
    {
      id: '2',
      title: 'Complete task management UI implementation',
      description: 'Finish building the Socratic task management system',
      completed: false,
      priority: 'high',
      status: 'in-progress',
      dueDate: new Date(), // Today
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 60 * 60 * 1000),
      tags: ['development', 'ui', 'urgent'],
      projectId: '2', // Work
    },
    {
      id: '3',
      title: 'Plan weekend hiking trip',
      description: 'Research trails and book accommodation',
      completed: false,
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['personal', 'planning'],
      projectId: '1', // Personal
    },
    {
      id: '4',
      title: 'Read chapter 5 of React patterns book',
      description: 'Continue studying advanced React patterns',
      completed: true,
      priority: 'low',
      status: 'completed',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // This week
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      tags: ['learning', 'react'],
      projectId: '3', // Learning
    },
    {
      id: '5',
      title: 'Schedule dentist appointment',
      description: 'Book regular checkup for next month',
      completed: false,
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tags: ['health'],
      projectId: '1', // Personal
    },
    {
      id: '6',
      title: 'Organize project documentation',
      description: 'Update README files and API documentation',
      completed: false,
      priority: 'low',
      status: 'pending',
      dueDate: undefined, // No due date
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      tags: ['documentation'],
      projectId: '2', // Work
    },
  ])
  const [filter, setFilter] = useState<TaskFilter>({})
  const [sort, setSort] = useState<TaskSort>({ field: 'dueDate', direction: 'asc' })

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskData.title || '',
      description: taskData.description,
      completed: false,
      priority: taskData.priority || 'medium',
      status: 'pending',
      dueDate: taskData.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: taskData.tags || [],
      projectId: taskData.projectId,
    }
    setTasks(prev => [...prev, newTask])
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date() }
        : task
    ))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { 
            ...task, 
            completed: !task.completed,
            status: !task.completed ? 'completed' : 'pending',
            updatedAt: new Date()
          }
        : task
    ))
  }

  return (
    <div className="flex flex-col h-full">
      <Card className="flex-1 flex flex-col border-0 shadow-none bg-transparent">
        {/* Header with filters, sorts, and view toggles */}
        <TaskViewHeader 
          filter={filter}
          sort={sort}
          onFilterChange={setFilter}
          onSortChange={setSort}
          taskCount={tasks.length}
        />
        
        {/* Main scrollable task list area */}
        <div className="flex-1 overflow-hidden">
          <TaskListContainer
            tasks={tasks}
            filter={filter}
            sort={sort}
            onToggleComplete={handleToggleComplete}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>
        
        {/* Bottom task creation bar */}
        <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <TaskCreationBar 
            onCreate={handleCreateTask}
          />
        </div>
      </Card>
    </div>
  )
} 