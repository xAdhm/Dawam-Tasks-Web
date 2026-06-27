import type { Section, Task } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

async function apiFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

export const api = {
  getSections: (token: string) => apiFetch<Section[]>('/sections', token),

  createSection: (name: string, token: string) =>
    apiFetch<Section>('/sections', token, {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  renameSection: (sectionId: string, name: string, token: string) =>
    apiFetch<Section>(`/sections/${sectionId}`, token, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    }),

  deleteSection: (sectionId: string, token: string) =>
    apiFetch<void>(`/sections/${sectionId}`, token, {
      method: 'DELETE',
    }),

  reorderSections: (orderedIds: string[], token: string) =>
    apiFetch<Section[]>('/sections/reorder', token, {
      method: 'PUT',
      body: JSON.stringify(orderedIds),
    }),

  getTasks: (sectionId: string, token: string) =>
    apiFetch<Task[]>(`/sections/${sectionId}/tasks`, token),

  toggleTask: (sectionId: string, taskId: string, token: string) =>
    apiFetch<Task>(`/sections/${sectionId}/tasks/${taskId}/toggle`, token, { method: 'PUT' }),

  createTask: (
    sectionId: string,
    data: {
      title: string
      type: 'ONE_TIME' | 'RECURRING'
      dueDate?: string | null
      frequency?: 'DAILY' | 'SPECIFIC_DAYS' | null
      daysOfWeek?: string[] | null
    },
    token: string
  ) =>
    apiFetch<Task>(`/sections/${sectionId}/tasks`, token, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (
    sectionId: string,
    taskId: string,
    data: {
      title: string
      type: 'ONE_TIME' | 'RECURRING'
      dueDate?: string | null
      frequency?: 'DAILY' | 'SPECIFIC_DAYS' | null
      daysOfWeek?: string[] | null
    },
    token: string
  ) =>
    apiFetch<Task>(`/sections/${sectionId}/tasks/${taskId}`, token, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTask: (sectionId: string, taskId: string, token: string) =>
    apiFetch<void>(`/sections/${sectionId}/tasks/${taskId}`, token, {
      method: 'DELETE',
    }),
}