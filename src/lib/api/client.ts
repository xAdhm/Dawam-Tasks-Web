import type { Section, Task } from './types'

const API_BASE = 'http://localhost:8080'

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

  getTasks: (sectionId: string, token: string) =>
    apiFetch<Task[]>(`/sections/${sectionId}/tasks`, token),

  toggleTask: (sectionId: string, taskId: string, token: string) =>
    apiFetch<Task>(`/sections/${sectionId}/tasks/${taskId}/toggle`, token, { method: 'PUT' }),
}