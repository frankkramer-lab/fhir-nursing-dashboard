import React from 'react';
import './TimeSpanModifier.css';


export default function TimeSpanModifier(props) {
    console.log("render");
    return (
        <div id={"time-span-modifier"}>
            <h2>Time Span</h2>
            <div className={"date-input-wrapper"}>
                <div className={"date-input-group"}>
                    <label htmlFor="start-date">Start</label>
                    <input className={"date-input"} type="date" id="start" name="start-date" defaultValue="2018-07-22"
                           min="2000-1-1" max="2025-1-1"/>

                </div>
                <div className={"date-input-group"}>
                    <label htmlFor="end-date">End</label>
                    <input className={"date-input"} type="date" id="end" name="end-date" defaultValue="2018-07-22"
                           min="2000-1-1" max="2025-1-1"/>
                </div>
            </div>
        </div>
    );
}