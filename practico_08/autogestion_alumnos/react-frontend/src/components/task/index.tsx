import React, { Fragment, useCallback, useEffect, useState } from 'react'
import DatePicker from 'react-date-picker'
import Select from 'react-select'
import { Style, StyleMap } from 'utils/tsTypes'
import { Cookies } from 'react-cookie/lib'
import { Layout } from 'components/app/layout'
import { TaskModel } from './model'
import { TasksType, TaskType } from './common'
import { SubjectModel } from '../subject/model'
import { SubjectsType, SubjectType } from '../subject/common'
import { HorizontalStack, VerticalStack } from '../../common/components/flex'
import { getValueOrDefault } from '../../utils/checks'
import { noop } from '@babel/types'
import { formatDate } from 'utils/utils'

export const Task = (props: { cookies: Cookies }): JSX.Element => {
    const accessToken = props.cookies.get('access_token')
    const [errorMessage, setErrorMessage] = useState('')

    /*
     * TaskModel
     */
    const model = new TaskModel(accessToken)
    const emptyTasks: TasksType = []
    const [tasks, setTasks] = useState(emptyTasks)

    const loadTasks = useCallback(async () => {
        const backendTasks = await model.getTasks(setErrorMessage)
        setTasks(backendTasks)
    }, [setTasks])

    const saveTask = useCallback(
        async (
            description: string,
            isDone: boolean,
            date: Date,
            score: string,
            setErrorMessage: (value: string) => void,
            valueSelected: string,
            cleanScreen: () => void
        ) => {
            const savedTask = await model.tryToSaveTask(
                description,
                isDone,
                date,
                score,
                setErrorMessage,
                valueSelected
            )
            if (savedTask.length === 0) {
                return
            }
            setTasks(tasks.concat(savedTask))
            cleanScreen()
        },
        [setTasks, tasks]
    )

    const tryToSaveTaskWithEffect = (
        description: string,
        isDone: boolean,
        date: Date,
        score: string,
        setErrorMessage: (value: string) => void,
        valueSelected: string,
        cleanScreen: () => void
    ) => {
        void saveTask(
            description,
            isDone,
            date,
            score,
            setErrorMessage,
            valueSelected,
            cleanScreen
        )
    }

    const changeTask = useCallback(
        async (task: TaskType) => {
            const saved = await model.tryToModifyTask(task)
            if (saved) {
                const newTasks = tasks.map((taskArray) => {
                    if (taskArray.id === task.id) {
                        taskArray.isDone = task.isDone
                    }
                    return taskArray
                })
                setTasks(newTasks)
                return true
            }
            return false
        },
        [setTasks, tasks]
    )

    const tryToChangeTaskWithEffect = async (
        task: TaskType
    ): Promise<boolean> => {
        return await changeTask(task)
    }

    /*
     * SubjectModel
     */
    const subjectModel = new SubjectModel(accessToken)
    const emptySubjects: SubjectsType = []
    const [subjects, setSubjects] = useState(emptySubjects)

    const loadSubjects = useCallback(async () => {
        const backendSubjects = await subjectModel.getSubjects(setErrorMessage)
        setSubjects(backendSubjects)
    }, [setSubjects])

    /*
     * Load the information
     */
    useEffect(() => {
        void loadTasks()
        void loadSubjects()
    }, [loadTasks, loadSubjects])

    /*
     * Rendering
     */
    const general: Style = {
        margin: '0',
        padding: '0',
        display: 'flex',
        gridTemplateColumns: '1fr',
        gridRow: '1fr',
        placeItems: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        background: '#222',
    }

    const dropdown: Style = {
        width: '350px',
        marginTop: '50px',
        marginBottom: '50px',
    }
    const title: Style = {
        marginTop: '5%',
        textAlign: 'center',
        color: 'white',
        fontSize: '20px',
        fontFamily: 'Arial',
    }

    const [isOptionSelected, setIsOptionSelected] = useState(false)
    const [valueSelected, setValueSelected] = useState('')
    const isDropdownDisabled = subjects.length === 0
    const onOptionSelected = useCallback(
        (maybeValue: any) => {
            const value = getValueOrDefault(maybeValue, { value: '' })
            setValueSelected(value.value)
            setIsOptionSelected(value.value !== '')
        },
        [setIsOptionSelected, setValueSelected]
    )

    return (
        <Layout cookies={props.cookies}>
            <VerticalStack style={general}>
                <label style={title}>Seleccione una materia:</label>
                <Dropdown
                    style={dropdown}
                    isDisabled={isDropdownDisabled}
                    subjects={subjects}
                    onChange={onOptionSelected}
                />
                <label style={title}>{errorMessage}</label>
                <MaybeTaskList
                    tasks={tasks}
                    accessToken={accessToken}
                    isOptionSelected={isOptionSelected}
                    valueSelected={valueSelected}
                    tryToSaveTaskWithEffect={tryToSaveTaskWithEffect}
                    tryToChangeTaskWithEffect={tryToChangeTaskWithEffect}
                />
            </VerticalStack>
        </Layout>
    )
}

const MaybeTaskList = (props: {
    tasks: TasksType
    accessToken: string
    isOptionSelected: boolean
    valueSelected: string
    tryToSaveTaskWithEffect: (
        description: string,
        isDone: boolean,
        date: Date,
        score: string,
        setErrorMessage: (value: string) => void,
        valueSelected: string,
        cleanScreen: () => void
    ) => void
    tryToChangeTaskWithEffect: (task: TaskType) => Promise<boolean>
}): JSX.Element | null => {
    if (props.isOptionSelected) {
        return (
            <TaskList
                tasks={props.tasks}
                accessToken={props.accessToken}
                valueSelected={props.valueSelected}
                tryToSaveTaskWithEffect={props.tryToSaveTaskWithEffect}
                tryToChangeTaskWithEffect={props.tryToChangeTaskWithEffect}
            />
        )
    }
    return null
}

const TaskList = (props: {
    tasks: TasksType
    accessToken: string
    valueSelected: string
    tryToSaveTaskWithEffect: (
        description: string,
        isDone: boolean,
        date: Date,
        score: string,
        setErrorMessage: (value: string) => void,
        valueSelected: string,
        cleanScreen: () => void
    ) => void
    tryToChangeTaskWithEffect: (task: TaskType) => Promise<boolean>
}): JSX.Element => {
    const styles: StyleMap = {
        box: {
            padding: '40px 40px 10px 30px',
            position: 'relative',
            background: '#333',
            borderTop: '50px solid white',
            width: '70%',
            height: 'auto',
            borderRadius: '25px',
            marginBottom: '25px',
        },
        subtitle: {
            color: '#fff',
            fontSize: '30px',
            padding: '1px 0',
            marginLeft: '5px',
            borderBottom: '4px solid #fff',
            textAlign: 'center',
            marginTop: '0px',
        },
        addButton: {
            height: '30px',
            background: '#e91e63',
            borderWidth: 'small',
            borderColor: '#b3b3b3',
            boxShadow: '0 1px 1px rgba(0, 0, 0, 0.25)',
            color: 'white',
            fontSize: '14px',
            marginTop: '2%',
            marginBottom: '4%',
            borderRadius: '5px',
            cursor: 'pointer',
            textAlign: 'center',
            width: '100%',
        },
        taskLine: {
            color: '#fff',
            fontSize: '17px',
            fontFamily: 'Arial',
            margin: '40px 0',
            display: 'flex',
            cursor: 'pointer',
        },
        cells: {
            padding: '15px',
            borderBottom: '1px solid #333',
        },
        table: {
            color: 'black',
            fontSize: '19px',
            textAlign: 'left',
            width: '100%',
            backgroundColor: 'white',
            borderCollapse: 'collapse',
        },
        tableTitle: {
            color: 'white',
            backgroundColor: '#666',
            borderBottom: '5px solid #222',
        },
    }
    const [isAddTaskClicked, setIsAddTaskClicked] = useState(false)

    const onClick = useCallback(() => {
        setIsAddTaskClicked(true)
    }, [setIsAddTaskClicked])

    const onCheck = (task: TaskType): Promise<boolean> =>
        props.tryToChangeTaskWithEffect(task)

    const tasksSelected = props.tasks.filter(
        (task) => task.subjectId === props.valueSelected
    )

    const tasksRow = tasksSelected.map((task) => {
        let isChecked = task.isDone
        return (
            <tr key={task.id}>
                <th style={styles.cells}>
                    <input
                        type="checkbox"
                        name=""
                        checked={isChecked}
                        onChange={async (event) => {
                            const newTask = {
                                ...task,
                                isDone: event.target.checked,
                            }
                            const result = await onCheck(newTask)
                            if (!result) {
                                return
                            } else {
                                isChecked = !isChecked
                            }
                        }}
                    />
                </th>
                <th style={styles.cells}>{task.description}</th>
                <th style={styles.cells}>{formatDate(task.date)}</th>
                <th style={styles.cells}>{task.score}</th>
            </tr>
        )
    })

    return (
        <div style={styles.box}>
            <h2 style={styles.subtitle}>Tareas</h2>
            <table style={styles.table}>
                <thead style={styles.tableTitle}>
                    <tr>
                        <th style={styles.cells}>Hecha</th>
                        <th>Descripcion</th>
                        <th>Fecha</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>{tasksRow}</tbody>
            </table>
            <button onClick={onClick} style={styles.addButton}>
                Agregar Tarea
            </button>
            <MaybeTaskForm
                isAddTaskClicked={isAddTaskClicked}
                onCancel={() => setIsAddTaskClicked(false)}
                valueSelected={props.valueSelected}
                tryToSaveTaskWithEffect={props.tryToSaveTaskWithEffect}
            />
        </div>
    )
}

interface MaybeTaskFormProps {
    valueSelected: string
    isAddTaskClicked: boolean
    onCancel: () => void
    tryToSaveTaskWithEffect: (
        description: string,
        isDone: boolean,
        date: Date,
        score: string,
        setErrorMessage: (value: string) => void,
        valueSelected: string,
        cleanScreen: () => void
    ) => void
}

const MaybeTaskForm = (props: MaybeTaskFormProps): JSX.Element | null => {
    const [errorMessage, setErrorMessage] = useState('')
    const [description, setDescription] = useState('')
    const [isDone, setIsDone] = useState(false)
    const [date, setDate] = useState(new Date())
    const [score, setScore] = useState('')

    const onCancel = (): void => {
        setErrorMessage('')
        setDescription('')
        setIsDone(false)
        setDate(new Date())
        setScore('')
        props.onCancel()
    }

    const onConfirm = (): void => {
        if (description === '') {
            setErrorMessage('Titulo de tarea vacio')
            return
        }
        props.tryToSaveTaskWithEffect(
            description,
            isDone,
            date,
            score,
            setErrorMessage,
            props.valueSelected,
            onCancel
        )
        return
    }

    if (!props.isAddTaskClicked) {
        return null
    }
    const styles: StyleMap = {
        input: {
            height: '25px',
            width: '100%',
            borderWidth: 'small',
            borderColor: '#b3b3b3',
            boxShadow: '0 1px 1px rgba(0, 0, 0, 0.25)',
            fontSize: '14px',
            marginTop: '2%',
            marginBottom: '4%',
            borderRadius: '5px',
            display: 'flex',
        },
        confirm: {
            height: '30px',
            background: '#75cb64',
            borderWidth: 'small',
            borderColor: '#b3b3b3',
            boxShadow: '0 1px 1px rgba(0, 0, 0, 0.25)',
            color: 'white',
            fontSize: '14px',
            marginTop: '2%',
            marginBottom: '4%',
            borderRadius: '5px',
            cursor: 'pointer',
            textAlign: 'center',
            width: '100%',
        },
        cancel: {
            height: '30px',
            background: '#cb6464',
            borderWidth: 'small',
            borderColor: '#b3b3b3',
            boxShadow: '0 1px 1px rgba(0, 0, 0, 0.25)',
            color: 'white',
            fontSize: '14px',
            marginTop: '2%',
            marginBottom: '4%',
            borderRadius: '5px',
            cursor: 'pointer',
            textAlign: 'center',
            width: '100%',
        },
        title: {
            marginTop: '3%',
            marginBottom: '3%',
            textAlign: 'center',
            color: 'white',
            fontSize: '20px',
            fontFamily: 'Arial',
        },
        calendar: {
            backgroundColor: 'white',
            width: 'max-content',
        },
    }

    return (
        <VerticalStack style={{ marginTop: '50px' }}>
            <input
                style={styles.input}
                placeholder="Titulo tarea*"
                name="description"
                value={description}
                onChange={(event) => {
                    setDescription(event.target.value)
                }}
            />
            <HorizontalStack style={{ color: 'white', alignSelf: 'start' }}>
                <input
                    type="checkbox"
                    name="isDone"
                    checked={isDone}
                    onChange={(event) => {
                        setIsDone(event.target.checked)
                    }}
                />
                Esta hecha?
            </HorizontalStack>
            <div style={styles.calendar}>
                <DatePicker
                    onChange={(date: Date | Date[]) => {
                        if (Array.isArray(date)) {
                            noop()
                        } else {
                            setDate(date)
                        }
                    }}
                    value={date}
                    format={'dd/MM/y'}
                />
            </div>
            <input
                style={styles.input}
                placeholder="Score"
                name="score"
                value={score}
                onChange={(event) => {
                    setScore(event.target.value)
                }}
            />
            <label style={styles.title}>{errorMessage}</label>
            <HorizontalStack>
                <button style={styles.confirm} onClick={onConfirm}>
                    Confirmar
                </button>
                <button style={styles.cancel} onClick={onCancel}>
                    Cancelar
                </button>
            </HorizontalStack>
        </VerticalStack>
    )
}

interface DropdownProps {
    isDisabled: boolean
    subjects: SubjectType[]
    style: Style
    onChange: (value: any) => void
}

const Dropdown = (props: DropdownProps): JSX.Element => {
    const options = props.subjects.map((subject: SubjectType) => {
        return {
            label: subject.name,
            value: subject.id,
        }
    })
    const errorMessage = props.isDisabled ? 'Usted no posee materias, por favor agregue.' : ''
    const style: Style = {
        color: 'white',
        marginTop: '5%',
        display: 'flex',
        marginLeft: '10%',
    }
    return (
        <div style={props.style}>
            <Fragment>
                <Select
                    className="basic-single"
                    classNamePrefix="select"
                    isDisabled={props.isDisabled}
                    isClearable={true}
                    isSearchable={true}
                    name="Subjects"
                    options={options}
                    onChange={props.onChange}
                />
                <div style={style}> {errorMessage} </div>
            </Fragment>
        </div>
    )
}
