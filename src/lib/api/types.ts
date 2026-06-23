export type TaskType = 'ONE_TIME' | 'RECURRING'
export type Frequency = 'DAILY' | 'SPECIFIC_DAYS'
export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export interface Section {
  id: string
  name: string
  position: number
}

export interface Task {
  id: string
  sectionId: string
  title: string
  type: TaskType
  dueDate: string | null
  completed: boolean
  frequency: Frequency | null
  daysOfWeek: DayOfWeek[] | null
  doneToday: boolean
  dueTodayFlag: boolean
}