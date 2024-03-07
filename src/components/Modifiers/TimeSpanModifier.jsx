import React from 'react';
import './TimeSpanModifier.css';
import {ENDDATE, STARTDATE} from "../../utils/constants";


export default function TimeSpanModifier(props) {

    function formatDateToYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    return (
        <div id={"time-span-modifier"}>
            <h2>Time Span</h2>
            <div className={"date-input-wrapper"}>
                <div className={"date-input-group"}>
                    <label htmlFor="start-date">Start</label>
                    <input className={"date-input"} type="date" id="start" name="start-date" defaultValue={formatDateToYYYYMMDD(STARTDATE)}
                           min={formatDateToYYYYMMDD(STARTDATE)}
                           max={formatDateToYYYYMMDD(ENDDATE)}
                    />

                </div>
                <div className={"date-input-group"}>
                    <label htmlFor="end-date">End</label>
                    <input className={"date-input"} type="date" id="end" name="end-date" defaultValue={formatDateToYYYYMMDD(ENDDATE)}
                           min={formatDateToYYYYMMDD(STARTDATE)}
                           max={formatDateToYYYYMMDD(ENDDATE)}/>
                </div>
            </div>
        </div>
    );
}