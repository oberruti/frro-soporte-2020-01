export type TasksType = TaskType[]

export interface TaskType {
    id: string
    description: string
    isDone: boolean
    date?: string | null
    score?: string
    subjectId: string
}
