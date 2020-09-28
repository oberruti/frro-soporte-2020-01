export type EventsType = EventType[]

export interface EventType {
    title: string
    start: Date
    end: Date
    allDay: boolean
    resource: TaskFiltered | TestFiltered
}

export type TasksWithDate = TaskWithDate[]

export interface TaskWithDate {
    id: string
    isDone?: false
    description: string
    date: string
    score?: string
    subjectId: string
}

export type TaskFilteredType = TaskFiltered[]

export interface TaskFiltered {
    id: string
    description: string
    date: string
    score?: string
    subjectId: string
}

export type TestFilteredType = TestFiltered[]

export interface TestFiltered {
    id: string
    description: string
    date: string
    score?: string
    subjectId: string
}
