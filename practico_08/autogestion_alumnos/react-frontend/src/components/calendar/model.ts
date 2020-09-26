import { TasksType } from '../task/common'
import axios from 'axios'
import { processTasks } from '../task/model'
import { TestsType } from '../test/common'
import { processTests } from '../test/model'
import {
    EventsType,
    TaskFilteredType,
    TasksWithDate,
    TestFilteredType,
} from './common'
import { isNil } from '../../utils/checks'

export class CalendarModel {
    constructor(private accessToken: string) {}

    getEvents = async (
        setErrorMessage: (error: string) => void
    ): Promise<EventsType> => {
        const tasks = await this.getTasks(setErrorMessage)
        const tests = await this.getTests(setErrorMessage)
        const filteredTasks = this.filterTasks(tasks)
        const filteredTests = this.filterTests(tests)
        const data = [...filteredTests, ...filteredTasks]
        const events = data.map((entry) => {
            return {
                title: entry.description,
                start: new Date(entry.date),
                end: new Date(entry.date),
                allDay: true,
                resource: entry,
            }
        })
        return events
    }

    getTasks = async (
        setErrorMessage: (error: string) => void
    ): Promise<TasksType> => {
        const response = await this.tryToGetTasks()

        if (response.status === 'ok') {
            const tasks = response.msg.tasks
            return processTasks(tasks)
        }
        if (response.msg === '') {
            setErrorMessage('Something went wrong, please try again')
            return []
        }
        return []
    }

    tryToGetTasks = async (): Promise<{ msg: any; status: string }> => {
        const response = axios
            .get('/tasks', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.accessToken}`,
                },
            })
            .then((response) => {
                return {
                    status: response.data.status,
                    msg: response.data.msg || response.data.data,
                }
            })
            .catch(() => {
                return {
                    status: 'error',
                    msg: '',
                }
            })
        return await response
    }

    getTests = async (
        setErrorMessage: (error: string) => void
    ): Promise<TestsType> => {
        const response = await this.tryToGetTests()

        if (response.status === 'ok') {
            const tests = response.msg.exams
            return processTests(tests)
        }
        if (response.msg === '') {
            setErrorMessage('Something went wrong, please try again')
            return []
        }
        return []
    }

    tryToGetTests = async (): Promise<{ msg: any; status: string }> => {
        const response = axios
            .get('/exams', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.accessToken}`,
                },
            })
            .then((response) => {
                return {
                    status: response.data.status,
                    msg: response.data.msg || response.data.data,
                }
            })
            .catch(() => {
                return {
                    status: 'error',
                    msg: '',
                }
            })
        return await response
    }

    filterTasks = (tasks: TasksType): TaskFilteredType => {
        const notDoneTasks = tasks.filter(
            (task) => (isNil(task.isDone) || !task.isDone) && !isNil(task.date)
        ) as TasksWithDate

        return notDoneTasks.map((task) => {
            return {
                id: task.id,
                description: task.description,
                date: task.date,
                score: task.score,
                subjectId: task.subjectId,
            }
        })
    }

    filterTests = (tests: TestsType): TestFilteredType => {
        return tests.filter((test) => !isNil(test.date)) as TestFilteredType
    }
}
