import React, {useState} from 'react';
import './TimeSpanModifier.css';
import {END_DATE, START_DATE} from "../../utils/constants";


export default function TimeSpanModifier(props) {

    const [startDate, setStartDate] = useState(props.chartData.p.timeSpan[0]);
    const [endDate, setEndDate] = useState(props.chartData.p.timeSpan[1]);

    function formatDateToYYYYMMDD(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    const changeStart = (date) => {
        const newDate = new Date(date.target.value);
        newDate.setHours(0, 0, 0, 0);
        if (newDate > endDate) {
            console.log('newDate', newDate);
            const newEndDate = new Date(date.target.value);
            console.log('newEndDate', newEndDate);
            newEndDate.setHours(23, 59, 59, 0);
            props.updateTimeSpan(newDate, newEndDate);
            setEndDate(newEndDate);
        } else {
            props.updateTimeSpan(newDate, endDate);
        }
        setStartDate(newDate);
    }
    const changeEnd = (date) => {
        const newDate = new Date(date.target.value);
        newDate.setHours(23, 59, 59, 0);
        if (newDate < startDate) {
            console.log('newDate', newDate);
            const newStartDate = new Date(date.target.value);
            console.log('newStartDate', newStartDate);
            newStartDate.setHours(0, 0, 0, 0);
            props.updateTimeSpan(newStartDate, newDate);
            setStartDate(newStartDate);
        } else {
            props.updateTimeSpan(startDate, newDate);
        }
        setEndDate(newDate);
    }


    return (
        <div id={"time-span-modifier"}>
            <h2>Time Span</h2>
            <div className={"date-input-wrapper"}>
                <div className={"date-input-group"}>
                    <label htmlFor="start-date">Start</label>
                    <input className={"date-input"} type="date" id="start" name="start-date"
                           value={formatDateToYYYYMMDD(startDate)}
                           min={formatDateToYYYYMMDD(START_DATE)}
                           max={formatDateToYYYYMMDD(END_DATE)}
                           onChange={changeStart}
                    />

                </div>
                <div className={"date-input-group"}>
                    <label htmlFor="end-date">End</label>
                    <input className={"date-input"} type="date" id="end" name="end-date"
                           value={formatDateToYYYYMMDD(endDate)}
                           min={formatDateToYYYYMMDD(START_DATE)}
                           max={formatDateToYYYYMMDD(END_DATE)}
                           onChange={changeEnd}
                    />
                </div>
            </div>
        </div>
    );
}