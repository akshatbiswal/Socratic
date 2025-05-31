"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Flag, 
  Calendar as CalendarIcon, 
  Hash, 
  Folder, 
  X,
  MoreHorizontal
} from "lucide-react"
import { format } from "date-fns"
import { Task, TaskFilter, TaskSort } from "./task-dashboard"

interface TaskViewHeaderProps {
  filter: TaskFilter
  sort: TaskSort
  onFilterChange: (filter: TaskFilter) => void
  onSortChange: (sort: TaskSort) => void
  taskCount: number
}

export function TaskViewHeader({ 
  filter, 
  sort, 
  onFilterChange, 
  onSortChange, 
  taskCount 
}: TaskViewHeaderProps) {
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)

  const hasActiveFilters = Object.values(filter).some(value => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0
    return value !== undefined && value !== null
  })

  const clearAllFilters = () => {
    onFilterChange({})
  }

  const removeFilter = (filterType: keyof TaskFilter) => {
    const newFilter = { ...filter }
    delete newFilter[filterType]
    onFilterChange(newFilter)
  }

  const updateFilter = (key: keyof TaskFilter, value: any) => {
    onFilterChange({ ...filter, [key]: value })
  }

  const mockProjects = [
    { 
      id: '1', 
      name: 'Personal', 
      color: 'blue',
      subProjects: [
        { id: 'daily-tasks', name: 'Daily Tasks', emoji: '✅' },
        { id: 'health-wellness', name: 'Health & Wellness', emoji: '🍏' },
        { id: 'learning-goals', name: 'Learning Goals', emoji: '🎯' },
      ]
    },
    { 
      id: '2', 
      name: 'Work', 
      color: 'green',
      subProjects: [
        { id: 'projects', name: 'Projects', emoji: '📊' },
        { id: 'meetings', name: 'Meetings', emoji: '🤝' },
        { id: 'documentation', name: 'Documentation', emoji: '📚' },
      ]
    },
    { 
      id: '3', 
      name: 'Creative', 
      color: 'purple',
      subProjects: [
        { id: 'design-ideas', name: 'Design Ideas', emoji: '✨' },
        { id: 'writing', name: 'Writing', emoji: '✍️' },
        { id: 'music', name: 'Music', emoji: '🎵' },
      ]
    },
  ]

  // Get current project's sub-projects
  const currentProject = mockProjects.find(p => p.id === filter.projectId)
  const currentSubProjects = currentProject?.subProjects || []

  const commonTags = ['urgent', 'meeting', 'review', 'research', 'planning']

  return (
    <div className="border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="px-6 py-5 space-y-5">
        {/* Top row: Sort and primary filter controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Task count */}
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {taskCount}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {taskCount === 1 ? 'task' : 'tasks'}
              </div>
            </div>

            {/* Visual separator */}
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

            {/* Sort selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by</label>
              <Select 
                value={`${sort.field}-${sort.direction}`} 
                onValueChange={(value) => {
                  const [field, direction] = value.split('-') as [TaskSort['field'], TaskSort['direction']]
                  onSortChange({ field, direction })
                }}
              >
                <SelectTrigger className="w-52 h-9 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                  <div className="flex items-center gap-2">
                    {sort.direction === 'asc' ? 
                      <SortAsc className="h-3 w-3 text-gray-500" /> : 
                      <SortDesc className="h-3 w-3 text-gray-500" />
                    }
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-gray-200 dark:border-gray-700">
                  <SelectItem value="dueDate-asc">Due Date (Nearest First)</SelectItem>
                  <SelectItem value="dueDate-desc">Due Date (Farthest First)</SelectItem>
                  <SelectItem value="priority-desc">Priority (High to Low)</SelectItem>
                  <SelectItem value="priority-asc">Priority (Low to High)</SelectItem>
                  <SelectItem value="createdAt-desc">Recently Added</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Name (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter controls */}
          <div className="flex items-center gap-3">
            {/* Quick filter: Show only pending */}
            <Button
              variant={filter.status?.includes('pending') ? "default" : "outline"}
              size="sm"
              className={`h-9 px-4 font-medium transition-all duration-200 ${
                filter.status?.includes('pending') 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              onClick={() => {
                const newStatus = filter.status?.includes('pending') 
                  ? filter.status.filter(s => s !== 'pending')
                  : [...(filter.status || []), 'pending']
                updateFilter('status', newStatus.length > 0 ? newStatus : undefined)
              }}
            >
              <span className="text-xs mr-1">⏳</span>
              Pending
            </Button>

            {/* Advanced filters */}
            <Popover open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant={hasActiveFilters ? "default" : "outline"}
                  size="sm" 
                  className={`h-9 px-4 font-medium transition-all duration-200 ${
                    hasActiveFilters 
                      ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-md' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Filter className="h-3 w-3 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 h-5 px-2 text-xs bg-white/20 text-white border-0"
                    >
                      {Object.keys(filter).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 max-h-[80vh] overflow-hidden border-0 shadow-xl" align="end">
                <div className="bg-white dark:bg-gray-900 rounded-lg">
                  {/* Header */}
                  <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
                      </div>
                      {hasActiveFilters && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={clearAllFilters}
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="overflow-y-auto max-h-[calc(80vh-80px)] px-6 py-4 space-y-6">
                    
                    {/* Status Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Status
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['pending', 'in-progress', 'completed'] as const).map((status) => {
                          const isSelected = filter.status?.includes(status)
                          const statusConfig = {
                            pending: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', selectedBg: 'bg-amber-100 dark:bg-amber-800', icon: '⏳' },
                            'in-progress': { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', selectedBg: 'bg-blue-100 dark:bg-blue-800', icon: '🔄' },
                            completed: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300', selectedBg: 'bg-green-100 dark:bg-green-800', icon: '✅' }
                          }[status]
                          
                          return (
                            <button
                              key={status}
                              className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200
                                ${isSelected 
                                  ? `${statusConfig.selectedBg} ${statusConfig.border} ${statusConfig.text} shadow-sm` 
                                  : `${statusConfig.bg} ${statusConfig.border} ${statusConfig.text} hover:shadow-sm`
                                }
                              `}
                              onClick={() => {
                                const currentStatus = filter.status || []
                                const newStatus = currentStatus.includes(status)
                                  ? currentStatus.filter(s => s !== status)
                                  : [...currentStatus, status]
                                updateFilter('status', newStatus.length > 0 ? newStatus : undefined)
                              }}
                            >
                              <span className="text-xs">{statusConfig.icon}</span>
                              <span className="capitalize">{status.replace('-', ' ')}</span>
                              {isSelected && <X className="h-3 w-3 ml-1" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Priority Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Flag className="w-2 h-2 text-red-500" />
                        Priority
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['critical', 'high', 'medium', 'low'] as const).map((priority) => {
                          const isSelected = filter.priority?.includes(priority)
                          const priorityConfig = {
                            critical: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', selectedBg: 'bg-red-100 dark:bg-red-800', flag: 'text-red-500' },
                            high: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', selectedBg: 'bg-orange-100 dark:bg-orange-800', flag: 'text-orange-500' },
                            medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300', selectedBg: 'bg-yellow-100 dark:bg-yellow-800', flag: 'text-yellow-600' },
                            low: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', text: 'text-gray-700 dark:text-gray-300', selectedBg: 'bg-gray-100 dark:bg-gray-700', flag: 'text-gray-500' }
                          }[priority]
                          
                          return (
                            <button
                              key={priority}
                              className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200
                                ${isSelected 
                                  ? `${priorityConfig.selectedBg} ${priorityConfig.border} ${priorityConfig.text} shadow-sm` 
                                  : `${priorityConfig.bg} ${priorityConfig.border} ${priorityConfig.text} hover:shadow-sm`
                                }
                              `}
                              onClick={() => {
                                const currentPriority = filter.priority || []
                                const newPriority = currentPriority.includes(priority)
                                  ? currentPriority.filter(p => p !== priority)
                                  : [...currentPriority, priority]
                                updateFilter('priority', newPriority.length > 0 ? newPriority : undefined)
                              }}
                            >
                              <Flag className={`h-3 w-3 ${priorityConfig.flag}`} />
                              <span className="capitalize">{priority}</span>
                              {isSelected && <X className="h-3 w-3 ml-1" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Project & Sub-project */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Folder className="w-2 h-2 text-purple-500" />
                        Project
                      </label>
                      <div className="space-y-3">
                        <Select 
                          value={filter.projectId || 'all'} 
                          onValueChange={(value) => {
                            const newProjectId = value === 'all' ? undefined : value
                            const newFilter = { 
                              ...filter, 
                              projectId: newProjectId,
                              subProjectId: (value === 'all' || value !== filter.projectId) ? undefined : filter.subProjectId
                            }
                            onFilterChange(newFilter)
                          }}
                        >
                          <SelectTrigger className="h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                            <SelectValue placeholder="Select project..." />
                          </SelectTrigger>
                          <SelectContent className="border-gray-200 dark:border-gray-700">
                            <SelectItem value="all" className="text-gray-600 dark:text-gray-400">All projects</SelectItem>
                            {mockProjects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full bg-${project.color}-500`} />
                                  <span className="font-medium">{project.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Sub-project appears when project is selected */}
                        {filter.projectId && currentSubProjects.length > 0 && (
                          <div className="ml-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sub-project</span>
                            </div>
                            <Select 
                              value={filter.subProjectId || 'all'} 
                              onValueChange={(value) => {
                                const newFilter = { 
                                  ...filter, 
                                  subProjectId: value === 'all' ? undefined : value
                                }
                                onFilterChange(newFilter)
                              }}
                            >
                              <SelectTrigger className="h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                                <SelectValue placeholder="Select sub-project..." />
                              </SelectTrigger>
                              <SelectContent className="border-gray-200 dark:border-gray-700">
                                <SelectItem value="all" className="text-gray-600 dark:text-gray-400">All sub-projects</SelectItem>
                                {currentSubProjects.map((subProject) => (
                                  <SelectItem key={subProject.id} value={subProject.id}>
                                    <div className="flex items-center gap-3">
                                      <span className="text-base">{subProject.emoji}</span>
                                      <span className="font-medium">{subProject.name}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Hash className="w-2 h-2 text-indigo-500" />
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {commonTags.map((tag) => {
                          const isSelected = filter.tags?.includes(tag)
                          return (
                            <button
                              key={tag}
                              className={`
                                flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${isSelected 
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm'
                                }
                              `}
                              onClick={() => {
                                const currentTags = filter.tags || []
                                const newTags = currentTags.includes(tag)
                                  ? currentTags.filter(t => t !== tag)
                                  : [...currentTags, tag]
                                updateFilter('tags', newTags.length > 0 ? newTags : undefined)
                              }}
                            >
                              <Hash className="h-3 w-3" />
                              <span>{tag}</span>
                              {isSelected && <X className="h-3 w-3" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <CalendarIcon className="w-2 h-2 text-emerald-500" />
                        Due Date
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="h-10 justify-start border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                            >
                              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm">
                                {filter.dueDate?.start ? format(filter.dueDate.start, 'MMM d') : 'Start date'}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-gray-200 dark:border-gray-700" align="start">
                            <Calendar
                              mode="single"
                              selected={filter.dueDate?.start}
                              onSelect={(date) => updateFilter('dueDate', { ...filter.dueDate, start: date })}
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="h-10 justify-start border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                            >
                              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm">
                                {filter.dueDate?.end ? format(filter.dueDate.end, 'MMM d') : 'End date'}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-gray-200 dark:border-gray-700" align="start">
                            <Calendar
                              mode="single"
                              selected={filter.dueDate?.end}
                              onSelect={(date) => updateFilter('dueDate', { ...filter.dueDate, end: date })}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      {filter.dueDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => updateFilter('dueDate', undefined)}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear dates
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active filters badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active filters:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {filter.status && filter.status.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <span className="text-xs">⏳</span>
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    Status: {filter.status.join(', ')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto w-auto p-0 ml-1 hover:bg-amber-100 dark:hover:bg-amber-800 rounded"
                    onClick={() => removeFilter('status')}
                  >
                    <X className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  </Button>
                </div>
              )}

              {filter.priority && filter.priority.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <Flag className="h-3 w-3 text-red-500" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">
                    Priority: {filter.priority.join(', ')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto w-auto p-0 ml-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
                    onClick={() => removeFilter('priority')}
                  >
                    <X className="h-3 w-3 text-red-600 dark:text-red-400" />
                  </Button>
                </div>
              )}

              {filter.projectId && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <Folder className="h-3 w-3 text-purple-500" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    Project: {mockProjects.find(p => p.id === filter.projectId)?.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto w-auto p-0 ml-1 hover:bg-purple-100 dark:hover:bg-purple-800 rounded"
                    onClick={() => removeFilter('projectId')}
                  >
                    <X className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </Button>
                </div>
              )}

              {filter.subProjectId && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <span className="text-xs">{currentSubProjects.find(sp => sp.id === filter.subProjectId)?.emoji}</span>
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                    Sub-project: {currentSubProjects.find(sp => sp.id === filter.subProjectId)?.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto w-auto p-0 ml-1 hover:bg-purple-100 dark:hover:bg-purple-800 rounded"
                    onClick={() => removeFilter('subProjectId')}
                  >
                    <X className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                  </Button>
                </div>
              )}

              {filter.tags && filter.tags.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                  <Hash className="h-3 w-3 text-indigo-500" />
                  <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    Tags: {filter.tags.join(', ')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto w-auto p-0 ml-1 hover:bg-indigo-100 dark:hover:bg-indigo-800 rounded"
                    onClick={() => removeFilter('tags')}
                  >
                    <X className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                  </Button>
                </div>
              )}

              {filter.dueDate && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <CalendarIcon className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    Due: {filter.dueDate.start ? format(filter.dueDate.start, 'MMM d') : '∞'} - {filter.dueDate.end ? format(filter.dueDate.end, 'MMM d') : '∞'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto w-auto p-0 ml-1 hover:bg-emerald-100 dark:hover:bg-emerald-800 rounded"
                    onClick={() => removeFilter('dueDate')}
                  >
                    <X className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  </Button>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              onClick={clearAllFilters}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 