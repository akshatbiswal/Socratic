"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  Flag, 
  Calendar, 
  Hash, 
  Folder, 
  MoreHorizontal, 
  Edit3, 
  Trash2,
  Circle,
  CheckCircle2,
  Clock,
  ChevronRight,
  GripVertical,
  Play,
  Star,
  User
} from "lucide-react"
import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from "date-fns"
import { Task } from "./task-dashboard"

interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: string) => void
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
  isSelected?: boolean
  isDragging?: boolean
}

export function TaskItem({ 
  task, 
  onToggleComplete, 
  onUpdate, 
  onDelete, 
  isSelected = false,
  isDragging = false 
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [isHovered, setIsHovered] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)
  
  const editInputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [isEditing])

  const handleToggleComplete = async () => {
    if (task.completed) {
      onToggleComplete(task.id)
      return
    }

    // Enhanced completion animation
    setIsCompleting(true)
    
    // Add celebratory delay for important tasks
    const delay = task.priority === 'critical' ? 800 : 300
    setTimeout(() => {
      onToggleComplete(task.id)
      setIsCompleting(false)
    }, delay)
  }

  const handleSaveEdit = () => {
    const trimmedTitle = editTitle.trim()
    if (trimmedTitle && trimmedTitle !== task.title) {
      onUpdate(task.id, { title: trimmedTitle })
    }
    setIsEditing(false)
    setEditTitle(task.title)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditTitle(task.title)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const getPriorityStyles = (priority: Task['priority']) => {
    const styles = {
      critical: {
        border: 'border-l-red-500 shadow-red-500/10',
        bg: 'bg-red-50/50 dark:bg-red-950/20',
        badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300',
        icon: 'text-red-500',
        glow: 'shadow-lg shadow-red-500/20'
      },
      high: {
        border: 'border-l-orange-500 shadow-orange-500/10',
        bg: 'bg-orange-50/50 dark:bg-orange-950/20',
        badge: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300',
        icon: 'text-orange-500',
        glow: 'shadow-lg shadow-orange-500/20'
      },
      medium: {
        border: 'border-l-yellow-500 shadow-yellow-500/10',
        bg: 'bg-yellow-50/50 dark:bg-yellow-950/20',
        badge: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/50 dark:text-yellow-300',
        icon: 'text-yellow-600',
        glow: 'shadow-md shadow-yellow-500/15'
      },
      low: {
        border: 'border-l-gray-300 shadow-gray-500/5',
        bg: 'bg-gray-50/50 dark:bg-gray-950/20',
        badge: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-950/50 dark:text-gray-400',
        icon: 'text-gray-500',
        glow: 'shadow-sm'
      }
    }
    return styles[priority] || styles.low
  }

  const getStatusDisplay = (status: Task['status'], completed: boolean) => {
    if (completed) {
      return {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        text: 'Completed',
        color: 'text-emerald-600'
      }
    }
    
    const statusMap = {
      'in-progress': {
        icon: <Play className="h-4 w-4 text-blue-500" />,
        text: 'In Progress',
        color: 'text-blue-600'
      },
      'pending': {
        icon: <Circle className="h-4 w-4 text-gray-400" />,
        text: 'Pending',
        color: 'text-gray-600'
      },
      'archived': {
        icon: <Circle className="h-4 w-4 text-gray-300" />,
        text: 'Archived',
        color: 'text-gray-500'
      }
    } as const
    
    return statusMap[status as keyof typeof statusMap] || statusMap.pending
  }

  const formatDueDate = (dueDate: Date) => {
    if (isToday(dueDate)) return { text: 'Today', color: 'text-orange-600 font-medium', urgent: true }
    if (isTomorrow(dueDate)) return { text: 'Tomorrow', color: 'text-blue-600', urgent: false }
    if (isPast(dueDate)) return { 
      text: `Overdue • ${format(dueDate, 'MMM d')}`, 
      color: 'text-red-600 font-medium', 
      urgent: true 
    }
    
    const distance = formatDistanceToNow(dueDate, { addSuffix: true })
    return { text: distance, color: 'text-muted-foreground', urgent: false }
  }

  const mockProjects = [
    { id: '1', name: 'Personal', color: 'bg-blue-500', textColor: 'text-blue-700' },
    { id: '2', name: 'Work', color: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { id: '3', name: 'Learning', color: 'bg-purple-500', textColor: 'text-purple-700' },
  ]

  const project = mockProjects.find(p => p.id === task.projectId)
  const priorityStyles = getPriorityStyles(task.priority)
  const statusDisplay = getStatusDisplay(task.status, task.completed)
  const dueDateDisplay = task.dueDate ? formatDueDate(task.dueDate) : null

  return (
    <TooltipProvider>
      <Card 
        className={`group relative transition-all duration-300 cursor-pointer border-l-4 overflow-hidden
          ${priorityStyles.border} ${priorityStyles.bg}
          ${isHovered ? `${priorityStyles.glow} border-primary/20 scale-[1.02] z-10` : 'shadow-sm hover:shadow-md'}
          ${task.completed ? 'opacity-70' : ''}
          ${isCompleting ? 'animate-pulse' : ''}
          ${isDragging ? 'rotate-2 scale-105 shadow-2xl z-50' : ''}
          ${isSelected ? 'ring-2 ring-primary/50' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setShowActions(false)
        }}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <div className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isHovered ? 'opacity-100' : ''}`}>
              <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing" />
            </div>

            {/* Enhanced Checkbox */}
            <div className="relative mt-0.5">
              <Checkbox
                checked={task.completed}
                onCheckedChange={handleToggleComplete}
                className={`transition-all duration-300 h-5 w-5 ${
                  isCompleting ? 'scale-110 animate-pulse' : ''
                } ${task.priority === 'critical' ? 'border-red-500 data-[state=checked]:bg-red-500' : ''}`}
              />
              {isCompleting && !task.completed && (
                <div className="absolute inset-0 animate-ping">
                  <div className="h-5 w-5 rounded border-2 border-emerald-500 opacity-75"></div>
                </div>
              )}
            </div>

            {/* Task Content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title and Priority */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      ref={editInputRef}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSaveEdit}
                      className="w-full bg-transparent border-none outline-none text-sm font-medium focus:ring-2 focus:ring-primary/20 rounded px-1 -mx-1"
                    />
                  ) : (
                    <h3 
                      className={`text-sm font-medium cursor-text transition-all duration-200 leading-relaxed ${
                        task.completed 
                          ? 'line-through text-muted-foreground' 
                          : 'text-foreground hover:text-primary'
                      }`}
                      onClick={() => setIsEditing(true)}
                    >
                      {task.title}
                    </h3>
                  )}
                </div>
                
                {/* Priority Badge */}
                <Badge 
                  variant="outline" 
                  className={`h-6 px-2 text-xs font-medium transition-all duration-200 ${priorityStyles.badge}
                    ${isHovered ? 'scale-105' : ''}
                  `}
                >
                  <Flag className={`h-3 w-3 mr-1 ${priorityStyles.icon}`} />
                  {task.priority}
                </Badge>
              </div>

              {/* Metadata Row */}
              <div className="flex items-center gap-4 text-xs">
                {/* Status */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1.5 ${statusDisplay.color}`}>
                      {statusDisplay.icon}
                      <span className="font-medium">{statusDisplay.text}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Task status: {statusDisplay.text}</p>
                  </TooltipContent>
                </Tooltip>

                {/* Due Date */}
                {dueDateDisplay && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className={`flex items-center gap-1.5 ${dueDateDisplay.color}
                        ${dueDateDisplay.urgent ? 'animate-pulse' : ''}
                      `}>
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">{dueDateDisplay.text}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Due: {format(task.dueDate!, 'EEEE, MMMM d, yyyy')}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Project */}
                {project && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${project.color}`} />
                        <span className={`font-medium ${project.textColor}`}>{project.name}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Project: {project.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {task.tags.slice(0, 3).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="h-5 px-2 text-xs font-medium bg-muted/60 hover:bg-muted transition-colors duration-200"
                    >
                      <Hash className="h-2.5 w-2.5 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 3 && (
                    <Badge variant="outline" className="h-5 px-2 text-xs text-muted-foreground">
                      +{task.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className={`flex items-center gap-1 transition-all duration-200 ${
              isHovered || showActions ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            }`}>
              {/* Expand Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-primary/10"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${
                      isExpanded ? 'rotate-90' : ''
                    }`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isExpanded ? 'Collapse details' : 'View details'}</p>
                </TooltipContent>
              </Tooltip>

              {/* More Actions */}
              <Popover open={showActions} onOpenChange={setShowActions}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0 hover:bg-primary/10"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="end">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-3 w-3 mr-2" />
                      Edit task
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onUpdate(task.id, { 
                        status: task.status === 'in-progress' ? 'pending' : 'in-progress' 
                      })}
                    >
                      <Play className="h-3 w-3 mr-2" />
                      {task.status === 'in-progress' ? 'Pause' : 'Start work'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={() => onDelete(task.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-3 text-sm text-muted-foreground">
                {task.description && (
                  <div>
                    <p className="font-medium text-foreground mb-1">Description</p>
                    <p className="leading-relaxed">{task.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-foreground mb-1">Created</p>
                    <p>{format(task.createdAt, 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Last updated</p>
                    <p>{formatDistanceToNow(task.updatedAt, { addSuffix: true })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Completion Celebration Overlay */}
        {isCompleting && task.priority === 'critical' && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 animate-pulse" />
            <div className="absolute top-2 right-2">
              <Star className="h-6 w-6 text-yellow-500 animate-spin" />
            </div>
          </div>
        )}
      </Card>
    </TooltipProvider>
  )
} 