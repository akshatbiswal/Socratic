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
    { id: '1', name: 'Personal', color: 'blue' },
    { id: '2', name: 'Work', color: 'green' },
    { id: '3', name: 'Learning', color: 'purple' },
  ]

  const commonTags = ['urgent', 'meeting', 'review', 'research', 'planning']

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4 space-y-4">
        {/* Top row: Sort and primary filter controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Task count */}
            <div className="text-sm text-muted-foreground">
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </div>

            {/* Sort selector */}
            <Select 
              value={`${sort.field}-${sort.direction}`} 
              onValueChange={(value) => {
                const [field, direction] = value.split('-') as [TaskSort['field'], TaskSort['direction']]
                onSortChange({ field, direction })
              }}
            >
              <SelectTrigger className="w-48 h-8">
                <div className="flex items-center gap-2">
                  {sort.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate-asc">Due Date (Nearest First)</SelectItem>
                <SelectItem value="dueDate-desc">Due Date (Farthest First)</SelectItem>
                <SelectItem value="priority-asc">Priority (High to Low)</SelectItem>
                <SelectItem value="priority-desc">Priority (Low to High)</SelectItem>
                <SelectItem value="createdAt-desc">Recently Added</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Name (A-Z)</SelectItem>
                <SelectItem value="title-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter controls */}
          <div className="flex items-center gap-2">
            {/* Quick filter: Show only pending */}
            <Button
              variant={filter.status?.includes('pending') ? "default" : "outline"}
              size="sm"
              className="h-8"
              onClick={() => {
                const newStatus = filter.status?.includes('pending') 
                  ? filter.status.filter(s => s !== 'pending')
                  : [...(filter.status || []), 'pending']
                updateFilter('status', newStatus.length > 0 ? newStatus : undefined)
              }}
            >
              Pending
            </Button>

            {/* Advanced filters */}
            <Popover open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant={hasActiveFilters ? "default" : "outline"} 
                  size="sm" 
                  className="h-8"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                      {Object.keys(filter).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Filters</h3>
                    {hasActiveFilters && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs"
                        onClick={clearAllFilters}
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Status filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div className="space-y-2">
                      {(['pending', 'in-progress', 'completed'] as const).map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            checked={filter.status?.includes(status) || false}
                            onCheckedChange={(checked) => {
                              const currentStatus = filter.status || []
                              const newStatus = checked
                                ? [...currentStatus, status]
                                : currentStatus.filter(s => s !== status)
                              updateFilter('status', newStatus.length > 0 ? newStatus : undefined)
                            }}
                          />
                          <label className="text-sm capitalize">{status.replace('-', ' ')}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <div className="space-y-2">
                      {(['critical', 'high', 'medium', 'low'] as const).map((priority) => (
                        <div key={priority} className="flex items-center space-x-2">
                          <Checkbox
                            checked={filter.priority?.includes(priority) || false}
                            onCheckedChange={(checked) => {
                              const currentPriority = filter.priority || []
                              const newPriority = checked
                                ? [...currentPriority, priority]
                                : currentPriority.filter(p => p !== priority)
                              updateFilter('priority', newPriority.length > 0 ? newPriority : undefined)
                            }}
                          />
                          <div className="flex items-center gap-2">
                            <Flag className={`h-3 w-3 ${
                              priority === 'critical' ? 'text-red-500' :
                              priority === 'high' ? 'text-orange-500' :
                              priority === 'medium' ? 'text-yellow-500' :
                              'text-gray-500'
                            }`} />
                            <label className="text-sm capitalize">{priority}</label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Project filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project</label>
                    <Select 
                      value={filter.projectId || 'all'} 
                      onValueChange={(value) => updateFilter('projectId', value === 'all' ? undefined : value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="All projects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All projects</SelectItem>
                        {mockProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${project.color}-500`} />
                              {project.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {commonTags.map((tag) => (
                        <Button
                          key={tag}
                          variant={filter.tags?.includes(tag) ? "default" : "outline"}
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => {
                            const currentTags = filter.tags || []
                            const newTags = currentTags.includes(tag)
                              ? currentTags.filter(t => t !== tag)
                              : [...currentTags, tag]
                            updateFilter('tags', newTags.length > 0 ? newTags : undefined)
                          }}
                        >
                          <Hash className="h-2 w-2 mr-1" />
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Due date filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-8 text-xs">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {filter.dueDate?.start ? format(filter.dueDate.start, 'MMM d') : 'Start'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filter.dueDate?.start}
                            onSelect={(date) => updateFilter('dueDate', { ...filter.dueDate, start: date })}
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="h-8 text-xs">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {filter.dueDate?.end ? format(filter.dueDate.end, 'MMM d') : 'End'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
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
                        className="h-6 text-xs w-full"
                        onClick={() => updateFilter('dueDate', undefined)}
                      >
                        Clear date range
                      </Button>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active filters badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            
            {filter.status && filter.status.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                Status: {filter.status.join(', ')}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeFilter('status')}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}

            {filter.priority && filter.priority.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                Priority: {filter.priority.join(', ')}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeFilter('priority')}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}

            {filter.projectId && (
              <Badge variant="secondary" className="text-xs">
                Project: {mockProjects.find(p => p.id === filter.projectId)?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeFilter('projectId')}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}

            {filter.tags && filter.tags.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                Tags: {filter.tags.join(', ')}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeFilter('tags')}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}

            {filter.dueDate && (
              <Badge variant="secondary" className="text-xs">
                Due: {filter.dueDate.start ? format(filter.dueDate.start, 'MMM d') : '∞'} - {filter.dueDate.end ? format(filter.dueDate.end, 'MMM d') : '∞'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeFilter('dueDate')}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={clearAllFilters}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 