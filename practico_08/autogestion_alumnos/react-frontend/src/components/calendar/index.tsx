import React, { useCallback, useEffect, useState } from 'react'
import { Cookies } from 'react-cookie/lib'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { VerticalStack } from '../../common/components/flex'
import { Layout } from '../app/layout'
import { StyleMap } from '../../utils/tsTypes'
import { CalendarModel } from './model'
import { EventsType, EventType } from './common'
import { isNil } from '../../utils/checks'
import { formatDate } from '../../utils/utils'

export const CalendarPage = (props: { cookies: Cookies }): JSX.Element => {
    const accessToken = props.cookies.get('access_token')
    const [errorMessage, setErrorMessage] = useState('')

    const model = new CalendarModel(accessToken)

    const emptyEvents: EventsType = []
    const [events, setEvents] = useState(emptyEvents)

    const loadEvents = useCallback(async () => {
        const backendEvents = await model.getEvents(setErrorMessage)
        setEvents(backendEvents)
    }, [setEvents])

    useEffect(() => {
        void loadEvents()
    }, [loadEvents])

    const [eventSelected, setEventSelected] = useState()

    const localizer = momentLocalizer(moment)

    const styles: StyleMap = {
        general: {
            padding: '0',
            display: 'flex',
            gridTemplateColumns: '1fr',
            gridRow: '1fr',
            placeItems: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            background: '#333',
        },
        title: {
            marginTop: '3%',
            textAlign: 'center',
            color: 'white',
            fontSize: '40px',
            fontFamily: 'Arial',
        },
        error: {
            marginTop: '1%',
            textAlign: 'center',
            color: 'white',
            fontSize: '10px',
            fontFamily: 'Arial',
        },
    }

    return (
        <Layout cookies={props.cookies}>
            <VerticalStack style={styles.general}>
                <label style={styles.title}>Calendar</label>
                <label style={styles.error}>{errorMessage}</label>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{
                        height: 700,
                        width: 1000,
                        margin: '5%',
                        background: 'white',
                    }}
                    onSelectEvent={(event) => setEventSelected(event)}
                />
                <MaybeShowEvent
                    event={eventSelected}
                    setEventSelected={setEventSelected}
                />
            </VerticalStack>
        </Layout>
    )
}

interface MaybeShowEventProps {
    event?: EventType
    setEventSelected: React.Dispatch<any>
}

const MaybeShowEvent = (props: MaybeShowEventProps): JSX.Element | null => {
    if (isNil(props.event)) {
        return null
    }
    return (
        <EventComponent
            event={props.event}
            setEventSelected={props.setEventSelected}
        />
    )
}

interface ShowEventProps {
    event: EventType
    setEventSelected: React.Dispatch<any>
}

const EventComponent = (props: ShowEventProps): JSX.Element => {
    const styles: StyleMap = {
        box: {
            padding: '40px 40px 10px 30px',
            position: 'relative',
            background: '#333',
            borderTop: '50px solid white',
            borderRight: '2px solid white',
            borderBottom: '2px solid white',
            borderLeft: '2px solid white',
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
    const eventRow = (
        <tr key={props.event.resource.id}>
            <th style={styles.cells}>{props.event.resource.description}</th>
            <th style={styles.cells}>
                {formatDate(props.event.resource.date)}
            </th>
            <th style={styles.cells}>{props.event.resource.score}</th>
        </tr>
    )

    return (
        <div style={styles.box}>
            <h2 style={styles.subtitle}>Evento</h2>
            <table style={styles.table}>
                <thead style={styles.tableTitle}>
                    <tr>
                        <th style={styles.cells}>Descripcion</th>
                        <th style={styles.cells}>Fecha</th>
                        <th style={styles.cells}>Score</th>
                    </tr>
                </thead>
                <tbody>{eventRow}</tbody>
            </table>
            <button onClick={() => props.setEventSelected(null)} style={styles.addButton}>
                Cerrar evento
            </button>
        </div>
    )
}
