"use client"

import { useState, useEffect } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  ChevronDown, 
  MoreHorizontal, 
  CheckCircle2, 
  Plus,
  Target,
  TrendingUp,
  Calendar,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  CheckSquare
} from "lucide-react"
import { TaskItem } from "./task-item"
import { Task } from "./task-dashboard"
import { format } from "date-fns"

interface TaskSectionProps {
  title: string
  tasks: Task[]
  color: 'red' | 'orange' | 'blue' | 'green' | 'purple' | 'gray'
  onToggleComplete: (taskId: string) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
  onAddTask?: (sectionType: string) => void
  defaultOpen?: boolean
  icon?: React.ReactNode
  subtitle?: string
}

export function TaskSection({ 
  title, 
  tasks, 
  color, 
  onToggleComplete, 
  onUpdateTask, 
  onDeleteTask,
  onAddTask,
  defaultOpen = true,
  icon,
  subtitle
}: TaskSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isAnimating, setIsAnimating] = useState(false)

  // Persist collapsed state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`task-section-${title}`)
    if (saved !== null) {
      setIsOpen(JSON.parse(saved))
    }
  }, [title])

  const handleToggle = () => {
    setIsAnimating(true)
    const newState = !isOpen
    setIsOpen(newState)
    localStorage.setItem(`task-section-${title}`, JSON.stringify(newState))
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 300)
  }

  const completedCount = tasks.filter(task => task.completed).length
  const totalCount = tasks.length
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleMarkAllDone = () => {
    const incompleteTasks = tasks.filter(task => !task.completed)
    incompleteTasks.forEach(task => {
      onToggleComplete(task.id)
    })
  }

  const getSectionStyles = (color: string) => {
    const styles = {
      red: {
        header: 'bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200/50 dark:border-red-800/30',
        accent: 'text-red-600 dark:text-red-400',
        progress: 'bg-red-500',
        badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
        glow: 'shadow-red-500/10',
        button: 'hover:bg-red-100 dark:hover:bg-red-950/50'
      },
      orange: {
        header: 'bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200/50 dark:border-orange-800/30',
        accent: 'text-orange-600 dark:text-orange-400',
        progress: 'bg-orange-500',
        badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
        glow: 'shadow-orange-500/10',
        button: 'hover:bg-orange-100 dark:hover:bg-orange-950/50'
      },
      blue: {
        header: 'bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/30',
        accent: 'text-blue-600 dark:text-blue-400',
        progress: 'bg-blue-500',
        badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
        glow: 'shadow-blue-500/10',
        button: 'hover:bg-blue-100 dark:hover:bg-blue-950/50'
      },
      green: {
        header: 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/30',
        accent: 'text-emerald-600 dark:text-emerald-400',
        progress: 'bg-emerald-500',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
        glow: 'shadow-emerald-500/10',
        button: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/50'
      },
      purple: {
        header: 'bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/30',
        accent: 'text-purple-600 dark:text-purple-400',
        progress: 'bg-purple-500',
        badge: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
        glow: 'shadow-purple-500/10',
        button: 'hover:bg-purple-100 dark:hover:bg-purple-950/50'
      },
      gray: {
        header: 'bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20 border-gray-200/50 dark:border-gray-800/30',
        accent: 'text-gray-600 dark:text-gray-400',
        progress: 'bg-gray-500',
        badge: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800',
        glow: 'shadow-gray-500/10',
        button: 'hover:bg-gray-100 dark:hover:bg-gray-950/50'
      }
    } as const
    return styles[color as keyof typeof styles] || styles.gray
  }

  const getSectionIcon = (title: string) => {
    if (title.includes('Overdue')) return <Flame className="h-4 w-4" />
    if (title.includes('Today')) return <Target className="h-4 w-4" />
    if (title.includes('Tomorrow')) return <ArrowRight className="h-4 w-4" />
    if (title.includes('Week')) return <Calendar className="h-4 w-4" />
    if (title.includes('Month')) return <TrendingUp className="h-4 w-4" />
    if (title.includes('Later')) return <Clock className="h-4 w-4" />
    return <Sparkles className="h-4 w-4" />
  }

  const getMotivationalMessage = () => {
    if (completionPercentage === 100 && totalCount > 0) {
      return "🎉 All done! Amazing work!"
    }
    if (completionPercentage >= 75) {
      return "💪 Almost there! Keep going!"
    }
    if (completionPercentage >= 50) {
      return "⚡ Great progress! You're halfway done!"
    }
    if (completionPercentage > 0) {
      return "🚀 Good start! Keep the momentum!"
    }
    return null
  }

  const styles = getSectionStyles(color)
  const sectionIcon = icon || getSectionIcon(title)
  const motivationalMessage = getMotivationalMessage()

  if (tasks.length === 0) {
    return null
  }

  return (
    <TooltipProvider>
      <div className={`rounded-lg border shadow-sm ${styles.glow} transition-all duration-300 hover:shadow-md`}>
        <Collapsible open={isOpen} onOpenChange={handleToggle}>
          <CollapsibleTrigger asChild>
            <div className={`${styles.header} rounded-t-lg border-b cursor-pointer transition-all duration-300 group`}>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Section Icon */}
                    <div className={`${styles.accent} transition-transform duration-200 ${isOpen ? 'scale-110' : ''}`}>
                      {sectionIcon}
                    </div>
                    
                    {/* Title and Count */}
                    <div className="flex items-center gap-3">
                      <h3 className={`font-semibold text-lg ${styles.accent} transition-colors duration-200`}>
                        {title}
                      </h3>
                      
                      <Badge variant="outline" className={`${styles.badge} font-medium transition-all duration-200 group-hover:scale-105`}>
                        {completedCount}/{totalCount}
                      </Badge>
                      
                      {subtitle && (
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                          {subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Progress Indicator */}
                    {totalCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 min-w-0">
                            {completionPercentage === 100 ? (
                              <CheckCircle2 className={`h-5 w-5 ${styles.accent} animate-bounce`} />
                            ) : (
                              <div className="w-16 hidden sm:block">
                                <Progress 
                                  value={completionPercentage} 
                                  className={`h-2 transition-all duration-500`}
                                  style={{
                                    '--progress-background': `hsl(var(--${color}-500))`,
                                  } as React.CSSProperties}
                                />
                              </div>
                            )}
                            <span className={`text-sm font-medium ${styles.accent} min-w-fit`}>
                              {Math.round(completionPercentage)}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{motivationalMessage || `${completedCount} of ${totalCount} tasks completed`}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}

                    {/* Section Actions */}
                    <div className="flex items-center gap-1">
                      {/* Add Task Button */}
                      {onAddTask && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ${styles.button}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                onAddTask(title.toLowerCase())
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add task to {title}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* More Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ${styles.button}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAllDone()
                            }}
                            disabled={completedCount === totalCount}
                            className="cursor-pointer"
                          >
                            <CheckSquare className="h-4 w-4 mr-2" />
                            Mark all done
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Collapse Indicator */}
                      <ChevronDown 
                        className={`h-4 w-4 ${styles.accent} transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        } ${isAnimating ? 'animate-pulse' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Motivational Message */}
                {motivationalMessage && isOpen && (
                  <div className="mt-3 pt-3 border-t border-current/10">
                    <p className={`text-sm font-medium ${styles.accent} animate-in fade-in-0 slide-in-from-top-1 duration-300`}>
                      {motivationalMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="transition-all duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2">
            <div className="p-2 space-y-2 bg-card/50">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="animate-in fade-in-0 slide-in-from-left-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TaskItem
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                  />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </TooltipProvider>
  )
} 