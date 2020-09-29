import React, { Fragment, useCallback, useEffect, useState } from 'react'
import DatePicker from 'react-date-picker'
import Select from 'react-select'
import { Style, StyleMap } from 'utils/tsTypes'
import { Cookies } from 'react-cookie/lib'
import { Layout } from 'components/app/layout'
import { TestModel } from './model'
import { TestsType, TestType } from './common'
import { SubjectModel } from '../subject/model'
import { SubjectsType, SubjectType } from '../subject/common'
import { HorizontalStack, VerticalStack } from '../../common/components/flex'
import { getValueOrDefault } from '../../utils/checks'
import { noop } from '@babel/types'
import { formatDate } from 'utils/utils'
import edit from 'common/img/edit-logo.png'
import trash from 'common/img/trash-logo.png'

export const Test = (props: { cookies: Cookies }): JSX.Element => {
    const accessToken = props.cookies.get('access_token')
    const [errorMessage, setErrorMessage] = useState('')

    /*
     * TestModel
     */
    const model = new TestModel(accessToken)
    const emptyTests: TestsType = []
    const [tests, setTests] = useState(emptyTests)

    const loadTests = useCallback(async () => {
        const backendTests = await model.getTests(setErrorMessage)
        setTests(backendTests)
    }, [setTests])

    const saveTest = useCallback(
        async (
            description: string,
            date: Date,
            score: string,
            setErrorMessage: (value: string) => void,
            valueSelected: string,
            cleanScreen: () => void
        ) => {
            const savedTest = await model.tryToSaveTest(
                description,
                date,
                score,
                setErrorMessage,
                valueSelected
            )
            if (savedTest.length === 0) {
                return
            }
            setTests(tests.concat(savedTest))
            cleanScreen()
        },
        [setTests, tests]
    )

    const tryToSaveTestWithEffect = (
        description: string,
        date: Date,
        score: string,
        setErrorMessage: (value: string) => void,
        valueSelected: string,
        cleanScreen: () => void
    ) => {
        void saveTest(
            description,
            date,
            score,
            setErrorMessage,
            valueSelected,
            cleanScreen
        )
    }

    const changeTest = useCallback(
        async (test: TestType, cleanScreen: () => void) => {
            const saved = await model.tryToModifyTest(test)
            if (saved) {
                const newTests = tests.map((testArray) => {
                    if (testArray.id === test.id) {
                        testArray = test
                    }
                    return testArray
                })
                setTests(newTests)
                void loadTests()
                cleanScreen()
                return true
            }
            return false
        },
        [setTests, tests]
    )

    const tryToChangeTestWithEffect = async (
        test: TestType,
        cleanScreen: () => void
    ): Promise<boolean> => {
        return await changeTest(test, cleanScreen)
    }

    const deleteTest = useCallback(async (id: string) => {
        const deleted = await model.tryToDeleteTest(id)
        if (deleted) {
            void loadTests()
            return true
        }
        return false
    }, [])

    const tryToDeleteTestWithEffect = async (id: string): Promise<boolean> => {
        return await deleteTest(id)
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
        void loadTests()
        void loadSubjects()
    }, [loadTests, loadSubjects])

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
        marginBottom: '0px',
        fontFamily: 'Arial',
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
                <MaybeTestList
                    tests={tests}
                    accessToken={accessToken}
                    isOptionSelected={isOptionSelected}
                    valueSelected={valueSelected}
                    tryToSaveTestWithEffect={tryToSaveTestWithEffect}
                    tryToChangeTestWithEffect={tryToChangeTestWithEffect}
                    tryToDeleteTestWithEffect={tryToDeleteTestWithEffect}
                />
            </VerticalStack>
        </Layout>
    )
}

const MaybeTestList = (props: {
    tests: TestsType
    accessToken: string
    isOptionSelected: boolean
    valueSelected: string
    tryToSaveTestWithEffect: (
        description: string,
        date: Date,
        score: string,
        setErrorMessage: (value: string) => void,
        valueSelected: string,
        cleanScreen: () => void
    ) => void
    tryToChangeTestWithEffect: (
        test: TestType,
        cleanScreen: () => void
    ) => Promise<boolean>
    tryToDeleteTestWithEffect: (id: string) => Promise<boolean>
}): JSX.Element | null => {
    if (props.isOptionSelected) {
        return (
            <TestList
                tests={props.tests}
                accessToken={props.accessToken}
                valueSelected={props.valueSelected}
                tryToSaveTestWithEffect={props.tryToSaveTestWithEffect}
                tryToChangeTestWithEffect={props.tryToChangeTestWithEffect}
                tryToDeleteTestWithEffect={props.tryToDeleteTestWithEffect}
            />
        )
    }
    return null
}

const TestList = (props: {
    tests: TestsType
    accessToken: string
    valueSelected: string
    tryToSaveTestWithEffect: (
        description: string,
        date: Date,
        score: string,
        setErrorMessage: (value: string) => void,
        valueSelected: string,
        cleanScreen: () => void
    ) => void
    tryToChangeTestWithEffect: (test: TestType, cleanScreen: () => void) => void
    tryToDeleteTestWithEffect: (id: string) => void
}): JSX.Element => {
    const styles: StyleMap = {
        box: {
            padding: '40px 40px 10px 30px',
            position: 'relative',
            background: '#333',
            borderTop: '50px solid white',
            width: 'auto',
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
        testLine: {
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
            fontFamily: 'Arial',
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
            fontFamily: 'Arial',
        },
        logo: {
            maxWidth: '20px',
            maxHeight: '20px',
            cursor: 'pointer',
            float: 'right',
        },
    }
    const [isAddTestClicked, setIsAddTestClicked] = useState(false)
    const [isEditTestClicked, setIsEditTestClicked] = useState(false)
    const [currentTest, setCurrentTest] = useState({
        id: '',
        description: '',
        date: new Date(),
        score: '',
        subjectId: '',
    })

    const onClick = useCallback(() => {
        setIsAddTestClicked(true)
    }, [setIsAddTestClicked])

    const onClickEdit = useCallback(
        (test) => {
            setIsEditTestClicked(true)
            setCurrentTest({
                id: test.id,
                description: test.description,
                date: test.date,
                score: test.score,
                subjectId: test.subjectId,
            })
        },
        [setIsEditTestClicked]
    )

    const onClickDelete = useCallback((id) => {
        props.tryToDeleteTestWithEffect(id)
    }, [])

    const testsSelected = props.tests.filter(
        (test) => test.subjectId === props.valueSelected
    )

    const testsRow = testsSelected.map((test) => {
        return (
            <tr key={test.id}>
                <th style={styles.cells}>{test.description}</th>
                <th style={styles.cells}>{formatDate(test.date)}</th>
                <th style={styles.cells}>{test.score}</th>
                <th style={styles.cells}>
                    <img
                        onClick={() => {
                            onClickEdit(test)
                        }}
                        src={edit}
                        style={styles.logo}
                    />{' '}
                </th>
                <th style={styles.cells}>
                    <img
                        onClick={() => onClickDelete(test.id)}
                        src={trash}
                        style={styles.logo}
                    />{' '}
                </th>
            </tr>
        )
    })

    return (
        <div style={styles.box}>
            <h2 style={styles.subtitle}>Examenes</h2>
            <table style={styles.table}>
                <thead style={styles.tableTitle}>
                    <tr>
                        <th style={styles.cells}>Descripcion</th>
                        <th>Fecha</th>
                        <th>Score</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{testsRow}</tbody>
            </table>
            <button onClick={onClick} style={styles.addButton}>
                Agregar Examen
            </button>
            <MaybeTestForm
                isAddTestClicked={isAddTestClicked}
                isEditTestClicked={isEditTestClicked}
                currentTest={currentTest}
                onCancel={() => {
                    setIsAddTestClicked(false)
                    setIsEditTestClicked(false)
                }}
                valueSelected={props.valueSelected}
                tryToSaveTestWithEffect={props.tryToSaveTestWithEffect}
                tryToChangeTestWithEffect={props.tryToChangeTestWithEffect}
            />
        </div>
    )
}

interface MaybeTestFormProps {
    valueSelected: string
    isAddTestClicked: boolean
    isEditTestClicked: boolean
    currentTest: {
        id: string
        description: string
        date: Date
        score: string
        subjectId: string
    }
    onCancel: () => void
    tryToSaveTestWithEffect: (
        description: string,
        date: Date,
        score: string,
        setErrorMessage: (value: string) => void,
        valueSelected: string,
        cleanScreen: () => void
    ) => void
    tryToChangeTestWithEffect: (test: TestType, cleanScreen: () => void) => void
}

const MaybeTestForm = (props: MaybeTestFormProps): JSX.Element | null => {
    const [errorMessage, setErrorMessage] = useState('')
    const [description, setDescription] = useState('')
    const [date, setDate] = useState(new Date())
    const [score, setScore] = useState('')

    useEffect(() => {
        if (props.isEditTestClicked) {
            setDescription(props.currentTest.description)
            setDate(new Date(props.currentTest.date))
            setScore(props.currentTest.score)
        }
    }, [
        props.isEditTestClicked,
        setDescription,
        setDate,
        setScore,
        props.currentTest,
    ])

    const onCancel = (): void => {
        setErrorMessage('')
        setDescription('')
        setDate(new Date())
        setScore('')
        props.onCancel()
    }

    const onConfirm = (): void => {
        if (description === '') {
            setErrorMessage('Titulo de examen vacio')
            return
        }
        props.tryToSaveTestWithEffect(
            description,
            date,
            score,
            setErrorMessage,
            props.valueSelected,
            onCancel
        )
        return
    }

    const onConfirmEdit = (): void => {
        if (description === '') {
            setErrorMessage('Titulo de examen vacio')
            return
        }
        props.tryToChangeTestWithEffect(
            {
                id: props.currentTest.id,
                description: description,
                score: score,
                date: date.toString(),
                subjectId: props.currentTest.subjectId,
            },
            onCancel
        )
        return
    }

    if (!props.isAddTestClicked && !props.isEditTestClicked) {
        return null
    }

    const onConfirmSelected = props.isEditTestClicked
        ? onConfirmEdit
        : onConfirm
    const title = props.isEditTestClicked ? 'Editar examen' : 'Agregar examen'

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
            padding: '5px',
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
            padding: '5px',
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
            <div>
                <h1 style={styles.title}>{title}</h1>
                <input
                    style={styles.input}
                    name="description"
                    placeholder={'Description'}
                    value={description}
                    onChange={(event) => {
                        setDescription(event.target.value)
                    }}
                />
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
                    placeholder={'score'}
                    name="Score"
                    value={score}
                    onChange={(event) => {
                        setScore(event.target.value)
                    }}
                />
                <label style={styles.title}>{errorMessage}</label>
                <HorizontalStack>
                    <button style={styles.confirm} onClick={onConfirmSelected}>
                        Confirmar
                    </button>
                    <button style={styles.cancel} onClick={onCancel}>
                        Cancelar
                    </button>
                </HorizontalStack>
            </div>
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
    const errorMessage = props.isDisabled
        ? 'Usted no posee materias, por favor agregue.'
        : ''
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
