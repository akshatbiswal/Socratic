"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Flag, 
  Hash, 
  Folder, 
  X,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  Target,
  Star,
  Send,
  Wand2,
  ChevronRight,
  MoreHorizontal
} from "lucide-react"
import { format, addDays, startOfDay, isTomorrow, isToday, parseISO } from "date-fns"
import { Task } from "./task-dashboard"

interface TaskCreationBarProps {
  onCreate: (task: Partial<Task>) => void
}

type CreationState = 'resting' | 'active' | 'extended'

interface ParsedElements {
  title: string
  dueDate?: Date
  priority?: Task['priority']
  tags: string[]
  project?: string
  description?: string
}

export function TaskCreationBar({ onCreate }: TaskCreationBarProps) {
  const [state, setState] = useState<CreationState>('resting')
  const [input, setInput] = useState("")
  const [parsedElements, setParsedElements] = useState<ParsedElements>({
    title: "",
    tags: [],
  })
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const restingInputRef = useRef<HTMLInputElement>(null)
  
  // Focus management
  useEffect(() => {
    if (state === 'active' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [state])

  // Natural language parsing
  useEffect(() => {
    if (!input.trim()) {
      setParsedElements({ title: "", tags: [] })
      setShowPreview(false)
      return
    }

    const parsed = parseNaturalLanguage(input)
    setParsedElements(parsed)
    setShowPreview(!!parsed.dueDate || parsed.tags.length > 0 || !!parsed.priority)
  }, [input])

  const parseNaturalLanguage = (text: string): ParsedElements => {
    let cleanText = text
    const tags: string[] = []
    let dueDate: Date | undefined
    let priority: Task['priority'] | undefined
    let project: string | undefined

    // Parse hashtags
    const hashtagRegex = /#(\w+)/g
    let match
    while ((match = hashtagRegex.exec(text)) !== null) {
      tags.push(match[1])
      cleanText = cleanText.replace(match[0], '').trim()
    }

    // Parse priority keywords
    const priorityPatterns = [
      { pattern: /\b(urgent|critical|asap|emergency)\b/i, priority: 'critical' as const },
      { pattern: /\b(high|important|priority)\b/i, priority: 'high' as const },
      { pattern: /\b(medium|normal|regular)\b/i, priority: 'medium' as const },
      { pattern: /\b(low|minor|sometime)\b/i, priority: 'low' as const }
    ]

    for (const { pattern, priority: p } of priorityPatterns) {
      if (pattern.test(cleanText)) {
        priority = p
        cleanText = cleanText.replace(pattern, '').trim()
        break
      }
    }

    // Parse date patterns
    const datePatterns = [
      { pattern: /\b(today|now)\b/i, date: () => new Date() },
      { pattern: /\b(tomorrow|tmr)\b/i, date: () => addDays(new Date(), 1) },
      { pattern: /\b(next week|1 week)\b/i, date: () => addDays(new Date(), 7) },
      { pattern: /\b(monday|mon)\b/i, date: () => getNextDayOfWeek(1) },
      { pattern: /\b(tuesday|tue)\b/i, date: () => getNextDayOfWeek(2) },
      { pattern: /\b(wednesday|wed)\b/i, date: () => getNextDayOfWeek(3) },
      { pattern: /\b(thursday|thu)\b/i, date: () => getNextDayOfWeek(4) },
      { pattern: /\b(friday|fri)\b/i, date: () => getNextDayOfWeek(5) },
      { pattern: /\b(saturday|sat)\b/i, date: () => getNextDayOfWeek(6) },
      { pattern: /\b(sunday|sun)\b/i, date: () => getNextDayOfWeek(0) }
    ]

    for (const { pattern, date } of datePatterns) {
      if (pattern.test(cleanText)) {
        dueDate = date()
        cleanText = cleanText.replace(pattern, '').trim()
        break
      }
    }

    // Parse project mentions
    const projectPattern = /@(\w+)/g
    const projectMatch = projectPattern.exec(text)
    if (projectMatch) {
      project = projectMatch[1]
      cleanText = cleanText.replace(projectMatch[0], '').trim()
    }

    // Clean up title
    const title = cleanText.replace(/\s+/g, ' ').trim()

    return { title, dueDate, priority, tags, project }
  }

  const getNextDayOfWeek = (targetDay: number): Date => {
    const today = new Date()
    const currentDay = today.getDay()
    let daysUntil = targetDay - currentDay
    
    if (daysUntil <= 0) {
      daysUntil += 7
    }
    
    return addDays(today, daysUntil)
  }

  const handleSubmit = async () => {
    if (!parsedElements.title.trim()) return

    setIsSubmitting(true)

    // Simulate brief loading for feedback
    await new Promise(resolve => setTimeout(resolve, 300))

    const task: Partial<Task> = {
      title: parsedElements.title,
      description: parsedElements.description,
      priority: parsedElements.priority || 'medium',
      dueDate: parsedElements.dueDate,
      tags: parsedElements.tags.length > 0 ? parsedElements.tags : undefined,
      projectId: getProjectId(parsedElements.project),
    }

    onCreate(task)

    // Reset state
    setInput("")
    setParsedElements({ title: "", tags: [] })
    setShowPreview(false)
    setState('resting')
    setIsSubmitting(false)
  }

  const getProjectId = (projectName?: string): string | undefined => {
    const projectMap = {
      personal: '1',
      work: '2',
      learning: '3'
    }
    return projectName ? projectMap[projectName.toLowerCase() as keyof typeof projectMap] : undefined
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setState('resting')
      setInput("")
    }
  }

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return format(date, "MMM d")
  }

  const getPriorityIcon = (priority: Task['priority']) => {
    const icons = {
      critical: <Zap className="h-3 w-3 text-red-500" />,
      high: <Target className="h-3 w-3 text-orange-500" />,
      medium: <Flag className="h-3 w-3 text-yellow-500" />,
      low: <Star className="h-3 w-3 text-gray-500" />
    }
    return icons[priority]
  }

  const quickActions = [
    { label: "Today", action: () => setInput(prev => prev + " today") },
    { label: "Tomorrow", action: () => setInput(prev => prev + " tomorrow") },
    { label: "High Priority", action: () => setInput(prev => prev + " high priority") },
    { label: "#work", action: () => setInput(prev => prev + " #work") }
  ]

  if (state === 'resting') {
    return (
      <TooltipProvider>
        <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  ref={restingInputRef}
                  placeholder="What needs to be done? (Try: 'Call John tomorrow #urgent' or 'Review docs Friday')"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setState('active')}
                  className="pr-12 text-sm h-11 border-dashed border-muted-foreground/30 focus:border-solid focus:border-primary bg-muted/30 hover:bg-muted/50 transition-all duration-200"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Plus className="h-4 w-4 text-muted-foreground/50" />
                </div>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-11 px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setState('extended')}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More options</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  if (state === 'extended') {
    return (
      <TooltipProvider>
        <Card className="m-4 border-primary/20 shadow-lg">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Create Task
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState('resting')}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column - Basic info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Task Title</label>
                  <Input
                    ref={inputRef}
                    placeholder="What needs to be done?"
                    value={parsedElements.title || input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="text-sm h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Add more details..."
                    value={parsedElements.description || ""}
                    onChange={(e) => setParsedElements(prev => ({ ...prev, description: e.target.value }))}
                    className="text-sm min-h-[80px]"
                  />
                </div>
              </div>

              {/* Right column - Metadata */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Priority</label>
                    <Select
                      value={parsedElements.priority || "medium"}
                      onValueChange={(value) => setParsedElements(prev => ({ ...prev, priority: value as Task['priority'] }))}
                    >
                      <SelectTrigger className="text-sm h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">
                          <div className="flex items-center gap-2">
                            <Zap className="h-3 w-3 text-red-500" />
                            Critical
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-orange-500" />
                            High
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Flag className="h-3 w-3 text-yellow-500" />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-gray-500" />
                            Low
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Due Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal h-11">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {parsedElements.dueDate ? formatDueDate(parsedElements.dueDate) : "Set date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={parsedElements.dueDate}
                          onSelect={(date) => setParsedElements(prev => ({ ...prev, dueDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {parsedElements.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <Hash className="h-3 w-3" />
                        {tag}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setParsedElements(prev => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== index)
                          }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                    <Input
                      placeholder="Add tags..."
                      className="h-8 w-24 text-xs"
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const value = e.currentTarget.value.trim()
                          if (value && !parsedElements.tags.includes(value)) {
                            setParsedElements(prev => ({ ...prev, tags: [...prev.tags, value] }))
                            e.currentTarget.value = ""
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Try natural language: &quot;Call John tomorrow #urgent&quot;</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setState('resting')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!parsedElements.title.trim() || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Create Task
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </TooltipProvider>
    )
  }

  // Active state
  return (
    <TooltipProvider>
      <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder="What needs to be done? (Try: 'Call John tomorrow #urgent')"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-24 text-sm h-12 border-primary/50 focus:border-primary bg-card shadow-sm"
              />
              
              {showPreview && (
                <div className="absolute right-16 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                </div>
              )}
              
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setState('extended')}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>More options</p>
                  </TooltipContent>
                </Tooltip>
                
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!parsedElements.title.trim() || isSubmitting}
                  className="h-8 gap-1"
                >
                  {isSubmitting ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <ArrowRight className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">Quick:</span>
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={action.action}
              >
                {action.label}
              </Button>
            ))}
          </div>

          {/* Live preview */}
          {showPreview && (
            <Card className="p-3 bg-muted/30 border-dashed border-primary/30 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Preview:</span>
                <span className="font-medium">{parsedElements.title}</span>
                
                {parsedElements.priority && (
                  <Badge variant="outline" className="h-5 text-xs gap-1">
                    {getPriorityIcon(parsedElements.priority)}
                    {parsedElements.priority}
                  </Badge>
                )}
                
                {parsedElements.dueDate && (
                  <Badge variant="outline" className="h-5 text-xs gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {formatDueDate(parsedElements.dueDate)}
                  </Badge>
                )}
                
                {parsedElements.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="h-5 text-xs gap-1">
                    <Hash className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
} 