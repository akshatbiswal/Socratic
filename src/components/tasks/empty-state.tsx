"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Clock,
  Coffee,
  Sun,
  Moon,
  Sunset,
  Plus,
  Target,
  Calendar,
  Zap,
  Star,
  Lightbulb,
  Rocket,
  CheckCircle2,
  Filter,
  Search,
  Tag,
  Folder
} from "lucide-react"
import { TaskFilter } from "./task-dashboard"

interface EmptyStateProps {
  hasFilters?: boolean
  filter?: TaskFilter
  onAddTask?: () => void
}

export function EmptyState({ hasFilters = false, filter, onAddTask }: EmptyStateProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const getTimeOfDayMessage = () => {
    const hour = currentTime.getHours()
    
    if (hour >= 5 && hour < 9) {
      return {
        icon: <Coffee className="h-12 w-12 text-amber-500" />,
        greeting: "Good morning, early bird! ☀️",
        message: "Ready to tackle the day? Your task list is clear and waiting for your first accomplishment.",
        color: "from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
        accent: "text-amber-600 dark:text-amber-400"
      }
    } else if (hour >= 9 && hour < 12) {
      return {
        icon: <Sun className="h-12 w-12 text-yellow-500" />,
        greeting: "Good morning! 🌅",
        message: "The day is young and full of possibilities. What would you like to accomplish?",
        color: "from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20",
        accent: "text-yellow-600 dark:text-yellow-400"
      }
    } else if (hour >= 12 && hour < 17) {
      return {
        icon: <Target className="h-12 w-12 text-blue-500" />,
        greeting: "Good afternoon! 🎯",
        message: "Midday momentum! Perfect time to organize your priorities and make progress.",
        color: "from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20",
        accent: "text-blue-600 dark:text-blue-400"
      }
    } else if (hour >= 17 && hour < 21) {
      return {
        icon: <Sunset className="h-12 w-12 text-orange-500" />,
        greeting: "Good evening! 🌅",
        message: "Winding down? Perfect time to plan tomorrow or finish today's goals.",
        color: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
        accent: "text-orange-600 dark:text-orange-400"
      }
    } else {
      return {
        icon: <Moon className="h-12 w-12 text-indigo-500" />,
        greeting: "Good evening, night owl! 🌙",
        message: "Late night planning session? Set up tomorrow's tasks for a productive start.",
        color: "from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20",
        accent: "text-indigo-600 dark:text-indigo-400"
      }
    }
  }

  const getFilteredEmptyMessage = () => {
    if (!hasFilters) return null

    const activeFilters = []
    if (filter?.status && filter.status.length > 0) {
      activeFilters.push(`Status: ${filter.status.join(', ')}`)
    }
    if (filter?.priority && filter.priority.length > 0) {
      activeFilters.push(`Priority: ${filter.priority.join(', ')}`)
    }
    if (filter?.tags && filter.tags.length > 0) {
      activeFilters.push(`Tags: ${filter.tags.join(', ')}`)
    }
    if (filter?.projectId) {
      activeFilters.push(`Project filter active`)
    }
    if (filter?.dueDate?.start || filter?.dueDate?.end) {
      activeFilters.push(`Date range filter active`)
    }

    return {
      title: "No tasks match your filters",
      message: "Try adjusting your filters to see more tasks, or create a new task that matches your current criteria.",
      filters: activeFilters
    }
  }

  const getProductivityTips = () => [
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "Start Small",
      description: "Break large tasks into smaller, manageable pieces"
    },
    {
      icon: <Star className="h-5 w-5 text-purple-500" />,
      title: "Set Priorities",
      description: "Use priority flags to focus on what matters most"
    },
    {
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      title: "Plan Ahead",
      description: "Set due dates to stay organized and on track"
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-orange-500" />,
      title: "Use Tags",
      description: "Organize tasks with tags for easy filtering and context"
    },
    {
      icon: <Rocket className="h-5 w-5 text-green-500" />,
      title: "Daily Review",
      description: "Check your progress and plan tomorrow before you finish"
    },
    {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      title: "Celebrate Wins",
      description: "Acknowledge completed tasks to maintain motivation"
    }
  ]

  const timeMessage = getTimeOfDayMessage()
  const filteredMessage = getFilteredEmptyMessage()
  const tips = getProductivityTips()

  if (hasFilters && filteredMessage) {
    return (
      <div className="text-center py-12 space-y-8">
        <div className="space-y-4">
          <div className="relative">
            <Filter className="h-16 w-16 text-muted-foreground/50 mx-auto" />
            <Search className="h-6 w-6 text-muted-foreground/30 absolute -bottom-1 -right-1" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              {filteredMessage.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              {filteredMessage.message}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {filteredMessage.filters.map((filterDesc, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {filterDesc}
              </Badge>
            ))}
          </div>
        </div>

        {onAddTask && (
          <Button onClick={onAddTask} size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="text-center py-12 space-y-8">
      {/* Time-based greeting */}
      <Card className={`relative overflow-hidden border-0 bg-gradient-to-br ${timeMessage.color} shadow-lg`}>
        <div className="p-8 space-y-4">
          <div className="space-y-2">
            {timeMessage.icon}
            <h1 className={`text-2xl font-bold ${timeMessage.accent}`}>
              {timeMessage.greeting}
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              {timeMessage.message}
            </p>
          </div>

          {onAddTask && (
            <Button 
              onClick={onAddTask} 
              size="lg" 
              className="gap-2 bg-white/90 hover:bg-white text-gray-900 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Create Your First Task
            </Button>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-10">
          <div className="w-24 h-24 rounded-full bg-white/20" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-5">
          <div className="w-32 h-32 rounded-full bg-white/20" />
        </div>
      </Card>

      {/* Productivity tips */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            🚀 Productivity Tips
          </h2>
          <p className="text-muted-foreground">
            Get the most out of your task management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {tips.map((tip, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow duration-200 group cursor-default">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="transition-transform duration-200 group-hover:scale-110">
                    {tip.icon}
                  </div>
                  <h3 className="font-medium text-foreground">
                    {tip.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick start suggestions */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-medium text-foreground">
          🎯 Quick Start Ideas
        </h3>
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
          {[
            "Review inbox",
            "Plan daily goals",
            "Organize workspace",
            "Follow up on messages",
            "Schedule meetings",
            "Update project status"
          ].map((suggestion, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="cursor-pointer hover:bg-accent/50 transition-colors duration-200 text-sm py-1 px-3"
              onClick={() => onAddTask?.()}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
} 