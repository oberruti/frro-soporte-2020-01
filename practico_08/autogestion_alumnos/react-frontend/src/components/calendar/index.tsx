import React from 'react'
import { Cookies } from 'react-cookie/lib'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import {VerticalStack} from "../../common/components/flex";
import {Layout} from "../app/layout";
import {StyleMap} from "../../utils/tsTypes";



export const CalendarPage = (props: { cookies: Cookies }): JSX.Element => {
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
    }

    return (
        <Layout cookies={props.cookies}>
            <VerticalStack style={styles.general}>
                <label style={styles.title}>Calendar</label>
                <Calendar
                    localizer={localizer}
                    events={[]}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 700, width: 1000, margin: '5%', background: 'white' }}
                />
            </VerticalStack>
        </Layout>
    )
}
