'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { api } from '@/lib/api/client'
import type { Section, Task } from '@/lib/api/types'
import { dueLabel, dueUrgency } from '@/lib/dueDate'
import AddTaskForm from './AddTaskForm'
import TopBar from './TopBar'
import Sidebar from './Sidebar'

interface SectionWithTasks {
  section: Section
  tasks: Task[]
}

interface Props {
  sectionsWithTasks: SectionWithTasks[]
  token: string
  userEmail: string
  displayName: string
  bannerType?: 'welcome' | 'passwordReset' | null
}

const urgencyClasses: Record<string, string> = {
  overdue: 'bg-[var(--blue-soft)] text-[var(--blue)]',
  soon: 'bg-[var(--blue)] text-[var(--bg)]',
  near: 'bg-[var(--border)] text-[var(--text-dim)]',
  far: 'bg-[var(--border)] text-[var(--text-dim)]',
}

const bannerMessages: Record<string, string> = {
  welcome: 'Your email is verified — welcome to Dawam!',
  passwordReset: 'Your password has been reset successfully.',
}

function SortableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder section"
        suppressHydrationWarning
        className="absolute -left-4 top-1.5 hidden h-6 w-5 cursor-grab items-center justify-center text-[var(--text-dim)] sm:flex"
      >
        ⠿
      </button>
      {children}
    </div>
  )
}

function SortableTaskRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 }
  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder task"
        suppressHydrationWarning
        className="flex w-5 min-w-5 cursor-grab items-center justify-center text-[var(--text-dim)] opacity-50 hover:opacity-100"
      >
        ⠿
      </button>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function DroppableSection({
  id,
  isOver,
  showPlaceholder,
  children,
}: {
  id: string
  isOver: boolean
  showPlaceholder: boolean
  children: React.ReactNode
}) {
  const { setNodeRef } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border bg-[var(--surface)] overflow-hidden transition-colors ${
        isOver ? 'border-[var(--violet)]' : 'border-[var(--border)]'
      }`}
    >
      {children}
      {showPlaceholder && (
        <div className="flex items-center gap-3 border-t border-dashed border-[var(--border)] px-4 py-3 opacity-40">
          <span className="flex h-[18px] w-[18px] min-w-[18px] items-center justify-center rounded-full border border-[var(--border)]" />
          <span className="flex-1 text-sm text-[var(--text-dim)]">Drop here</span>
        </div>
      )}
    </div>
  )
}

export default function TodayView({ sectionsWithTasks: initial, token, userEmail, displayName, bannerType }: Props) {
  const [sectionsWithTasks, setSectionsWithTasks] = useState(initial)
  const [addingToSectionId, setAddingToSectionId] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<{ sectionId: string; task: Task } | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [renamingSectionId, setRenamingSectionId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [confirmDeleteSectionId, setConfirmDeleteSectionId] = useState<string | null>(null)
  const [creatingSection, setCreatingSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

  const sectionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const taskSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  function findSectionByTaskId(taskId: string) {
    return sectionsWithTasks.find((s) => s.tasks.some((t) => t.id === taskId))
  }

  function findSectionByIdOrTaskId(id: string) {
    return (
      sectionsWithTasks.find((s) => s.section.id === id) ||
      sectionsWithTasks.find((s) => s.tasks.some((t) => t.id === id))
    )
  }

  async function handleToggle(sectionId: string, taskId: string) {
    setSectionsWithTasks((prev) =>
      prev.map((s) =>
        s.section.id !== sectionId
          ? s
          : { ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, doneToday: !t.doneToday } : t)) }
      )
    )
    try {
      await api.toggleTask(sectionId, taskId, token)
    } catch (err) {
      setSectionsWithTasks((prev) =>
        prev.map((s) =>
          s.section.id !== sectionId
            ? s
            : { ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, doneToday: !t.doneToday } : t)) }
        )
      )
      console.error('Toggle failed', err)
    }
  }

  function handleTaskCreated(sectionId: string, task: Task) {
    setSectionsWithTasks((prev) =>
      prev.map((s) => (s.section.id !== sectionId ? s : { ...s, tasks: [...s.tasks, task] }))
    )
  }

  function handleTaskUpdated(sectionId: string, updated: Task) {
    setSectionsWithTasks((prev) =>
      prev.map((s) =>
        s.section.id !== sectionId
          ? s
          : { ...s, tasks: s.tasks.map((t) => (t.id === updated.id ? updated : t)) }
      )
    )
  }

  async function handleDelete(sectionId: string, taskId: string) {
    setDeletingTaskId(taskId)
    const prevState = sectionsWithTasks
    setSectionsWithTasks((prev) =>
      prev.map((s) =>
        s.section.id !== sectionId ? s : { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) }
      )
    )
    try {
      await api.deleteTask(sectionId, taskId, token)
    } catch (err) {
      setSectionsWithTasks(prevState)
      console.error('Delete failed', err)
    } finally {
      setDeletingTaskId(null)
    }
  }

  async function handleCreateSection() {
    if (!newSectionName.trim()) return
    try {
      const section = await api.createSection(newSectionName.trim(), token)
      setSectionsWithTasks((prev) => [...prev, { section, tasks: [] }])
      setNewSectionName('')
      setCreatingSection(false)
    } catch (err) {
      console.error('Create section failed', err)
    }
  }

  function startRename(sectionId: string, currentName: string) {
    setRenamingSectionId(sectionId)
    setRenameValue(currentName)
  }

  async function handleRenameSection(sectionId: string) {
    if (!renameValue.trim()) return
    const prevState = sectionsWithTasks
    setSectionsWithTasks((prev) =>
      prev.map((s) => (s.section.id !== sectionId ? s : { ...s, section: { ...s.section, name: renameValue.trim() } }))
    )
    setRenamingSectionId(null)
    try {
      await api.renameSection(sectionId, renameValue.trim(), token)
    } catch (err) {
      setSectionsWithTasks(prevState)
      console.error('Rename failed', err)
    }
  }

  async function handleDeleteSection(sectionId: string) {
    const prevState = sectionsWithTasks
    setSectionsWithTasks((prev) => prev.filter((s) => s.section.id !== sectionId))
    setConfirmDeleteSectionId(null)
    try {
      await api.deleteSection(sectionId, token)
    } catch (err) {
      setSectionsWithTasks(prevState)
      console.error('Delete section failed', err)
    }
  }

  async function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sectionsWithTasks.findIndex((s) => s.section.id === active.id)
    const newIndex = sectionsWithTasks.findIndex((s) => s.section.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(sectionsWithTasks, oldIndex, newIndex)
    const prevState = sectionsWithTasks
    setSectionsWithTasks(reordered)
    try {
      await api.reorderSections(reordered.map((s) => s.section.id), token)
    } catch (err) {
      setSectionsWithTasks(prevState)
      console.error('Reorder failed', err)
    }
  }

  function handleTaskDragOver(event: DragOverEvent) {
    const { over } = event
    if (!over) {
      setDragOverSectionId(null)
      return
    }
    const overId = over.id as string
    const overSection = findSectionByIdOrTaskId(overId)
    if (overSection) {
      setDragOverSectionId(overSection.section.id)
    }
  }

  async function handleTaskDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveTaskId(null)
    setDragOverSectionId(null)
    if (!over || active.id === over.id) return

    const taskId = active.id as string
    const overId = over.id as string

    const sourceSection = findSectionByTaskId(taskId)
    if (!sourceSection) return

    const targetSection = findSectionByIdOrTaskId(overId)
    if (!targetSection) return

    const isCrossSection = sourceSection.section.id !== targetSection.section.id

    if (isCrossSection) {
      const task = sourceSection.tasks.find((t) => t.id === taskId)!
      const prevState = sectionsWithTasks

      setSectionsWithTasks((prev) =>
        prev.map((s) => {
          if (s.section.id === sourceSection.section.id) {
            return { ...s, tasks: s.tasks.filter((t) => t.id !== taskId) }
          }
          if (s.section.id === targetSection.section.id) {
            return { ...s, tasks: [...s.tasks, { ...task, sectionId: targetSection.section.id }] }
          }
          return s
        })
      )

      try {
        await api.moveTask(sourceSection.section.id, taskId, targetSection.section.id, token)
      } catch (err) {
        setSectionsWithTasks(prevState)
        console.error('Move task failed', err)
      }
    } else {
      const oldIndex = sourceSection.tasks.findIndex((t) => t.id === taskId)
      const newIndex = sourceSection.tasks.findIndex((t) => t.id === overId)
      if (oldIndex === -1 || newIndex === -1) return

      const reorderedTasks = arrayMove(sourceSection.tasks, oldIndex, newIndex)
      const prevState = sectionsWithTasks

      setSectionsWithTasks((prev) =>
        prev.map((s) =>
          s.section.id !== sourceSection.section.id ? s : { ...s, tasks: reorderedTasks }
        )
      )

      try {
        await api.reorderTasks(sourceSection.section.id, reorderedTasks.map((t) => t.id), token)
      } catch (err) {
        setSectionsWithTasks(prevState)
        console.error('Task reorder failed', err)
      }
    }
  }

  const todayName = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  const activeTask = activeTaskId
    ? sectionsWithTasks.flatMap((s) => s.tasks).find((t) => t.id === activeTaskId)
    : null

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <TopBar onMenuClick={() => setSidebarOpen(true)} hidden={sidebarOpen} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} displayName={displayName} />

      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 md:max-w-4xl">
        {bannerType && !bannerDismissed && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-[var(--violet)] bg-[var(--violet)]/10 px-4 py-2.5 text-sm">
            <span>{bannerMessages[bannerType]}</span>
            <button onClick={() => setBannerDismissed(true)} aria-label="Dismiss" className="text-[var(--text-dim)] opacity-70 hover:opacity-100">✕</button>
          </div>
        )}

        <header className="mb-6 flex items-baseline justify-between sm:mb-8">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Hey, {displayName}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-dim)] sm:text-sm">{todayName}</span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm"
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              {theme === 'dark' ? '☼' : '☾'}
            </button>
          </div>
        </header>

        <DndContext sensors={sectionSensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={sectionsWithTasks.map((s) => s.section.id)} strategy={rectSortingStrategy}>
            <DndContext
              sensors={taskSensors}
              collisionDetection={closestCenter}
              onDragStart={(event) => setActiveTaskId(event.active.id as string)}
              onDragOver={handleTaskDragOver}
              onDragEnd={handleTaskDragEnd}
              onDragCancel={() => { setActiveTaskId(null); setDragOverSectionId(null) }}
            >
              <div className="space-y-10 sm:grid sm:grid-cols-2 sm:gap-10 sm:space-y-0">
                {sectionsWithTasks.map(({ section, tasks }) => {
                  const isOver = dragOverSectionId === section.id
                  const sourceSectionId = activeTaskId ? findSectionByTaskId(activeTaskId)?.section.id : null
                  const showPlaceholder = isOver && sourceSectionId !== section.id

                  return (
                    <SortableSection key={section.id} id={section.id}>
                      <section className="pl-2 sm:pl-2">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          {renamingSectionId === section.id ? (
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={() => handleRenameSection(section.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSection(section.id)
                                if (e.key === 'Escape') setRenamingSectionId(null)
                              }}
                              className="flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => startRename(section.id, section.name)}
                              className="text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]"
                            >
                              {section.name}
                            </button>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAddingToSectionId(section.id)}
                              className="rounded-md bg-[var(--violet)]/10 px-2 py-1 text-xs font-semibold text-[var(--violet)]"
                            >
                              + Add
                            </button>
                            <button
                              onClick={() => setConfirmDeleteSectionId(section.id)}
                              aria-label="Delete section"
                              className="text-xs text-[var(--text-dim)] opacity-60 hover:opacity-100"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {confirmDeleteSectionId === section.id && (
                          <div className="mb-2 rounded-lg border border-[var(--blue)] bg-[var(--blue-soft)] p-2.5 text-xs">
                            <p className="mb-2 text-[var(--text)]">Delete "{section.name}" and all its tasks?</p>
                            <div className="flex gap-2">
                              <button onClick={() => handleDeleteSection(section.id)} className="rounded-md bg-[var(--blue)] px-2.5 py-1 font-semibold text-[var(--bg)]">Delete</button>
                              <button onClick={() => setConfirmDeleteSectionId(null)} className="rounded-md border border-[var(--border)] px-2.5 py-1 text-[var(--text-dim)]">Cancel</button>
                            </div>
                          </div>
                        )}

                        <DroppableSection id={section.id} isOver={isOver} showPlaceholder={showPlaceholder}>
                          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                            {tasks.length === 0 && !showPlaceholder && (
                              <p className="px-4 py-4 text-sm text-[var(--text-dim)]">No tasks yet</p>
                            )}
                            {tasks.map((task) => (
                              <SortableTaskRow key={task.id} id={task.id}>
                                <div className="flex w-full items-center gap-3 border-b border-[var(--border)] px-2 py-3 last:border-b-0">
                                  <button
                                    onClick={() => handleToggle(section.id, task.id)}
                                    className={`flex h-[18px] w-[18px] min-w-[18px] items-center justify-center rounded-full border ${
                                      task.doneToday ? 'bg-[var(--violet)] border-[var(--violet)]' : 'border-[var(--border)]'
                                    }`}
                                  >
                                    {task.doneToday && <span className="text-[10px] font-bold text-[var(--bg)]">✓</span>}
                                  </button>
                                  <button
                                    onClick={() => handleToggle(section.id, task.id)}
                                    className={`flex-1 text-left text-sm ${task.doneToday ? 'text-[var(--text-dim)] line-through' : ''}`}
                                  >
                                    {task.title}
                                  </button>
                                  {task.dueDate && (
                                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${urgencyClasses[dueUrgency(task.dueDate)]}`}>
                                      {dueLabel(task.dueDate)}
                                    </span>
                                  )}
                                  <button onClick={() => setEditingTask({ sectionId: section.id, task })} aria-label="Edit task" className="text-[var(--text-dim)] opacity-60 transition-opacity hover:opacity-100">✎</button>
                                  <button onClick={() => handleDelete(section.id, task.id)} disabled={deletingTaskId === task.id} aria-label="Delete task" className="text-[var(--text-dim)] opacity-60 transition-opacity hover:opacity-100">✕</button>
                                </div>
                              </SortableTaskRow>
                            ))}
                          </SortableContext>
                        </DroppableSection>
                      </section>
                    </SortableSection>
                  )
                })}
              </div>

              <DragOverlay>
                {activeTask && (
                  <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-lg text-sm opacity-90">
                    <span className="flex h-[18px] w-[18px] min-w-[18px] items-center justify-center rounded-full border border-[var(--border)]" />
                    <span className="flex-1">{activeTask.title}</span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </SortableContext>
        </DndContext>

        <div className="mt-6">
          {creatingSection ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSection()
                  if (e.key === 'Escape') setCreatingSection(false)
                }}
                placeholder="Section name"
                className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none"
              />
              <button onClick={handleCreateSection} className="rounded-lg bg-[var(--violet)] px-3 py-2 text-sm font-medium text-[var(--bg)]">Add</button>
            </div>
          ) : (
            <button onClick={() => setCreatingSection(true)} className="flex h-full min-h-[52px] w-full items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-sm text-[var(--text-dim)]">
              + New section
            </button>
          )}
        </div>
      </div>

      {addingToSectionId && (
        <AddTaskForm sectionId={addingToSectionId} token={token} onCreated={(task) => handleTaskCreated(addingToSectionId, task)} onClose={() => setAddingToSectionId(null)} />
      )}
      {editingTask && (
        <AddTaskForm sectionId={editingTask.sectionId} token={token} task={editingTask.task} onUpdated={(task) => handleTaskUpdated(editingTask.sectionId, task)} onClose={() => setEditingTask(null)} />
      )}
    </div>
  )
}