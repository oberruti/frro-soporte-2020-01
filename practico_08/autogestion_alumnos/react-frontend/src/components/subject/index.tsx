import React, { useState, useCallback, useEffect } from 'react'
import { StyleMap, Style } from 'utils/tsTypes'
import { Cookies } from 'react-cookie/lib'
import { Layout } from 'components/app/layout'
import { SubjectModel } from './model'
import { SubjectsType, SubjectType } from './common'
import { HorizontalStack, VerticalStack } from '../../common/components/flex'
import { getValueOrDefault, isNil } from '../../utils/checks'
import { noop } from '@babel/types'
import edit from 'common/img/edit-logo.png'
import trash from 'common/img/trash-logo.png'

export const Subject = (props: { cookies: Cookies }): JSX.Element => {
    const accessToken = props.cookies.get('access_token')
    const [errorMessage, setErrorMessage] = useState('')

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

    const saveSubject = useCallback(
        async (
            name: string,
            division: string,
            condition: string,
            theoryDDHHHH: string,
            practiceDDHHHH: string,
            score: string,
            theoryProfessor: string,
            practiceProfessor: string,
            setErrorMessage: (value: string) => void,
            cleanScreen: () => void
        ) => {
            const savedSubject: SubjectsType = await subjectModel.tryToSaveSubject(
                name,
                division,
                condition,
                theoryDDHHHH,
                practiceDDHHHH,
                score,
                theoryProfessor,
                practiceProfessor,
                setErrorMessage
            )
            if (savedSubject.length === 0) {
                return
            }
            setSubjects(subjects.concat(savedSubject))
            cleanScreen()
        },
        [setSubjects, subjects]
    )

    const changeSubject = useCallback(
        async (
            id: string,
            name: string,
            division: string,
            condition: string,
            theoryDDHHHH: string,
            practiceDDHHHH: string,
            score: string,
            theoryProfessor: string,
            practiceProfessor: string,
            cleanScreen: () => void) => {
            const saved = await subjectModel.tryToModifySubject(
                id,
                name,
                division,
                condition,
                theoryDDHHHH,
                practiceDDHHHH,
                score,
                theoryProfessor,
                practiceProfessor,
                )
            if (saved) {
                const newSubject = subjects.map((subjectArray) => {
                    if (subjectArray.id === id) {
                        const subject: SubjectType  = subjectModel.getSubjectById(setErrorMessage, id)
                        subjectArray = subject
                    }
                    return subjectArray
                })
                setSubjects(newSubject)
                void loadSubjects()
                cleanScreen()
                return true
            }
            return false
        },
        [setSubjects, subjects]
    )

    const tryToChangeSubjectWithEffect = async (
        id: string,
        name: string,
        division: string,
        condition: string,
        theoryDDHHHH: string,
        practiceDDHHHH: string,
        score: string,
        theoryProfessor: string,
        practiceProfessor: string,
        cleanScreen: () => void) : Promise<boolean> => {
        return await changeSubject(
            id,
            name,
            division,
            condition,
            theoryDDHHHH,
            practiceDDHHHH,
            score,
            theoryProfessor,
            practiceProfessor,
            cleanScreen)
    }

    const deleteSubject = useCallback(async (id: string) => {
        const deleted = await subjectModel.tryToDeleteSubject(id)
        if (deleted) {
            void loadSubjects()
            return true
        }
        return false
    }, [])

    const tryToDeleteSubjectWithEffect = async (id: string): Promise<boolean> => {
        return await deleteSubject(id)
    }

    /*
     * Load the information
     */
    useEffect(() => {
        void loadSubjects()
    }, [loadSubjects])

    const general: Style = {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gridRow: '1fr',
        placeItems: 'center',
        alignItems: 'center',
        height: '100%',
        background: '#222',
        fontFamily: 'Arial',
    }

    return (
        <Layout cookies={props.cookies}>
            <section style={general}>
                <SubjectList
                    accessToken={accessToken}
                    subjects={subjects}
                    tryToSaveSubject={saveSubject}
                    tryToChangeSubjectWithEffect={tryToChangeSubjectWithEffect}
                    tryToDeleteSubjectWithEffect={tryToDeleteSubjectWithEffect}
                />
            </section>
        </Layout>
    )
}

const SubjectList = (props: {
    subjects: SubjectsType
    accessToken: string
    tryToSaveSubject: (
        name: string,
        division: string,
        condition: string,
        theoryDDHHHH: string,
        practiceDDHHHH: string,
        score: string,
        theoryProfessor: string,
        practiceProfessor: string,
        setErrorMessage: (value: string) => void,
        cleanScreen: () => void
    ) => void
    tryToChangeSubjectWithEffect: (
        id: string,
        name: string,
        division: string,
        condition: string,
        theoryDDHHHH: string,
        practiceDDHHHH: string,
        score: string,
        theoryProfessor: string,
        practiceProfessor: string,
        cleanScreen: () => void)  => void
    tryToDeleteSubjectWithEffect: (id: string) => void
}): JSX.Element => {
    const styles: StyleMap = {
        box: {
            padding: '35px',
            position: 'relative',
            background: '#333',
            borderTop: '50px solid white',
            width: '70%',
            height: 'auto',
            borderRadius: '25px',
            marginTop: '3%',
            marginBottom: '3%',
        },
        title: {
            color: '#fff',
            fontSize: '30px',
            padding: '10px 0',
            borderBottom: '4px solid #fff',
            textAlign: 'center',
        },
        table: {
            color: 'black',
            fontSize: '13px',
            textAlign: 'left',
            width: '100%',
            backgroundColor: 'white',
            borderCollapse: 'collapse',
        },
        cells: {
            padding: '15px',
        },
        tableTitle: {
            color: 'white',
            backgroundColor: '#666',
            borderBottom: '5px solid #222',
        },
        noInput: {
            display: 'none',
        },
        inputOver: {
            height: '25px',
            width: '300px',
            borderWidth: 'small',
            borderColor: '#b3b3b3',
            boxShadow: '0 1px 1px rgba(0, 0, 0, 0.25)',
            fontSize: '14px',
            marginTop: '2%',
            marginBottom: '4%',
            borderRadius: '5px',
            display: 'flex',
        },
        addButton: {
            height: '30px',
            background: '#e91e63',
            borderWidth: 'small',
            borderColor: '#b3b3b3',
            boxShadow: '0 1px 1px rgba(0, 0, 0, 0.25)',
            color: 'white',
            fontSize: '14px',
            marginTop: '4%',
            float: 'right',
            borderRadius: '5px',
            cursor: 'pointer',
        },
        logo: {
            maxWidth: '20px',
            maxHeight: '20px',
            cursor: 'pointer',
            alignSelf: 'center'
        }
    }

    const [isAddSubjectClicked, setIsAddSubjectClicked] = useState(false)
    const [isEditSubjectClicked, setIsEditSubjectClicked] = useState(false)
    const [currentSubject, setCurrentSubject] = useState({
        id: '',
        name: '',
        division: '',
        condition: '',
        theoryDDHHHH: '',
        practiceDDHHHH: '',
        score: '',
        theoryProfessor: '',
        practiceProfessor: '',
    })


    const onClick = useCallback(() => {
        setIsAddSubjectClicked(true)
    }, [setIsAddSubjectClicked])


    const onClickEdit = useCallback(
        (subject) => {
            setIsEditSubjectClicked(true)
            setCurrentSubject({
                id: subject.id,
                name: subject.name,
                division: subject.divison,
                condition: subject.condition,
                theoryDDHHHH: subject.theoryDDHHHH,
                practiceDDHHHH: subject.practiceDDHHHH,
                score: subject.score,
                theoryProfessor: subject.theoryProfessor,
                practiceProfessor: subject.practiceProfessor,
            })
        },
        [setIsEditSubjectClicked]
    )

    const onClickDelete = useCallback((id) => {
        props.tryToDeleteSubjectWithEffect(id)
    }, [])

    const subjectsSelected = props.subjects

    const subjectRow = subjectsSelected.map((subject, key) => {
        return (
            <tr key={key}>
                <th style={styles.cells}>{subject.name}</th>
                <th>{subject.theoryDDHHHH}</th>
                <th>{subject.practiceDDHHHH}</th>
                <th>{subject.theoryProfessor}</th>
                <th>{subject.practiceProfessor}</th>
                <th>{subject.division}</th>
                <th>{subject.condition}</th>
                <th>{subject.score}</th>
                <th><img src={edit} onClick={()=>onClickEdit(subject)} style={styles.logo} />  </th>
                <th><img src={trash} onClick={()=>onClickDelete(subject.id)} style={styles.logo} />  </th>
            </tr>
        )
    })

    return (
        <div style={styles.box}>
            <h2 style={styles.title}>Materias</h2>
            <table style={styles.table}>
                <thead style={styles.tableTitle}>
                    <tr>
                        <th style={styles.cells}>Nombre</th>
                        <th>Hora teoria</th>
                        <th>Hora practica</th>
                        <th>Profesor Teoria</th>
                        <th>Profesor Practica</th>
                        <th>Division</th>
                        <th>Condicion</th>
                        <th>Score</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>{subjectRow}</tbody>
            </table>
            <button onClick={onClick} style={styles.addButton}>
                Agregar Materia
            </button>
            <MaybeSubjectForm
                isAddSubjectClicked={isAddSubjectClicked}
                isEditSubjectClicked={isEditSubjectClicked}
                onCancel={() => {
                                setIsAddSubjectClicked(false)
                                setIsEditSubjectClicked(false)}}
                currentSubject={currentSubject}
                tryToSaveSubject={props.tryToSaveSubject}
                tryToChangeSubjectWithEffect={props.tryToChangeSubjectWithEffect}
            />
        </div>
    )
}
interface MaybeSubjectFormProps {
    isAddSubjectClicked: boolean
    isEditSubjectClicked: boolean
    onCancel: () => void
    currentSubject: {
        id: string,
        name: string,
        division: string,
        condition: string,
        theoryDDHHHH: string,
        practiceDDHHHH: string,
        score: string,
        theoryProfessor: string,
        practiceProfessor: string,
    }
    tryToSaveSubject: (
        name: string,
        division: string,
        condition: string,
        theoryDDHHHH: string,
        practiceDDHHHH: string,
        score: string,
        theoryProfessor: string,
        practiceProfessor: string,
        setErrorMessage: (value: string) => void,
        cleanScreen: () => void
    ) => void
    tryToChangeSubjectWithEffect: (
        id: string,
        name: string,
        division: string,
        condition: string,
        theoryDDHHHH: string,
        practiceDDHHHH: string,
        score: string,
        theoryProfessor: string,
        practiceProfessor: string,
        cleanScreen: () => void)  => void
}
const MaybeSubjectForm = (props: MaybeSubjectFormProps): JSX.Element | null => {
    const [errorMessage, setErrorMessage] = useState('')
    const [name, setName] = useState('')
    const [division, setDivision] = useState('')
    const [condition, setCondition] = useState('')
    const [score, setScore] = useState('')
    const [theoryDDHHHH, setTheoryDDHHHH] = useState('')
    const [practiceDDHHHH, setPracticeDDHHHH] = useState('')
    const [practiceProfessor, setPracticeProfessor] = useState('')
    const [theoryProfessor, setTheoryProfessor] = useState('')

    useEffect(() => {
        if (props.isEditSubjectClicked) {
            setName(props.currentSubject.name)
            setDivision(props.currentSubject.division)
            setCondition(props.currentSubject.condition)
            setScore(props.currentSubject.score)
            setTheoryDDHHHH(props.currentSubject.theoryDDHHHH)
            setPracticeDDHHHH(props.currentSubject.practiceDDHHHH)
            setPracticeProfessor(props.currentSubject.practiceProfessor)
            setTheoryProfessor(props.currentSubject.theoryProfessor)
        }
    }, [
        props.isEditSubjectClicked,
        setName,
        setDivision,
        setCondition,
        setScore,
        setTheoryDDHHHH,
        setPracticeDDHHHH,
        setPracticeProfessor,
        setTheoryProfessor,
        props.currentSubject,
    ])


    const onCancel = (): void => {
        setErrorMessage('')
        setName('')
        setDivision('')
        setCondition('')
        setScore('')
        setTheoryDDHHHH('')
        setPracticeDDHHHH('')
        setPracticeProfessor('')
        setTheoryProfessor('')
        props.onCancel()
    }

    const onConfirm = (): void => {
        if (name === '' || division === '' || condition === '') {
            setErrorMessage('Completar los campos requeridos')
            return
        }
        props.tryToSaveSubject(
            name,
            division,
            condition,
            theoryDDHHHH,
            practiceDDHHHH,
            score,
            theoryProfessor,
            practiceProfessor,
            setErrorMessage,
            onCancel
        )
        return
    }
    

    const onConfirmEdit = (): void => {
        if (name === '') {
            setErrorMessage('Nombre de materia vacio')
            return
        }
        props.tryToChangeSubjectWithEffect(
                props.currentSubject.id,
                name,
                division,
                condition,
                theoryDDHHHH,
                practiceDDHHHH,
                theoryProfessor ,
                practiceProfessor,
                errorMessage,  
                onCancel)
        onCancel()
        return
    }

    const onConfirmSelected = props.isEditSubjectClicked
    ? onConfirmEdit
    : onConfirm
const title = props.isEditSubjectClicked ? 'Editar Materia' : 'Agregar Materia'

    if (!props.isAddSubjectClicked && !props.isEditSubjectClicked) {
        return null
    }
    const styles: StyleMap = {
        input: {
            height: '25px',
            width: '70%',
            borderWidth: 'small',
            borderColor: '#b3b3b3',
            boxShadow: '0 1px 1px rgba(0, 0, 0, 0.25)',
            fontSize: '14px',
            marginTop: '2%',
            marginBottom: '4%',
            borderRadius: '5px',
            display: 'flex',
            alignSelf: 'center',
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
    }

    return (
        <VerticalStack style={{ marginTop: '50px' }}>
            <h1 style={styles.title}>{title}</h1>
            <input
                style={styles.input}
                placeholder="Nombre Materia*"
                name="name"
                value={name}
                onChange={(event) => {
                    setName(event.target.value)
                }}
            />
            <input
                style={styles.input}
                placeholder="Division*"
                name="division"
                value={division}
                onChange={(event) => {
                    setDivision(event.target.value)
                }}
            />
            <input
                style={styles.input}
                placeholder="Condicion*"
                name="condition"
                value={condition}
                onChange={(event) => {
                    setCondition(event.target.value)
                }}
            />
            <input
                style={styles.input}
                placeholder="Hora de practica (ddhhhh)"
                name="practiceDDHHHH"
                value={practiceDDHHHH}
                onChange={(event) => {
                    setPracticeDDHHHH(event.target.value)
                }}
            />
            <input
                style={styles.input}
                placeholder="Hora de teoria  (ddhhhh)"
                name="theoryDDHHHH"
                value={theoryDDHHHH}
                onChange={(event) => {
                    setTheoryDDHHHH(event.target.value)
                }}
            />
            <input
                style={styles.input}
                placeholder="Profesor de practica"
                name="practiceProfessor"
                value={practiceProfessor}
                onChange={(event) => {
                    setPracticeProfessor(event.target.value)
                }}
            />
            <input
                style={styles.input}
                placeholder="Profesor de teoria"
                name="theoryProfessor"
                value={theoryProfessor}
                onChange={(event) => {
                    setTheoryProfessor(event.target.value)
                }}
            />
            <input
                style={styles.input}
                placeholder="Score"
                name="score"
                value={score}
                onChange={(event) => {
                    setScore(event.target.value)
                }}
            />
            {errorMessage}
            <HorizontalStack>
                <button style={styles.confirm} onClick={onConfirmSelected}>
                    Confirmar
                </button>
                <button style={styles.cancel} onClick={onCancel}>
                    Cancelar
                </button>
            </HorizontalStack>
        </VerticalStack>
    )
}
