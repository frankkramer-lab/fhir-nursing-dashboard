import React, {useEffect, useState} from "react";
import "./Modifiers.css"
import AgeModifier from "./AgeModifier";
import TimeSpanModifier from "./TimeSpanModifier";
import {AGE_GROUPS, ENDDATE, FEMALE, GENDERS, STARTDATE} from "../../utils/constants";
import ThresholdModifier from "./ThresholdModifier";
import GenderModifier from "./GenderModifier";
import {DataProcessor} from "../../utils/filterData";

export default function Modifiers(props) {

    // Track computing state
    const [computing, setComputing] = useState(false);

    // Current Active Chart Data
    let chart = props.charts[props.activeIndex];

    // Track 'process' function variables
    const [ageGroups, setAgeGroups] = useState(chart.p.ageGroups);
    const [genders, setGenders] = useState(chart.p.genders);
    const [timeSpan, setTimeSpan] = useState(chart.p.timeSpan);
    const [threshold, setThreshold] = useState(chart.p.threshold);

    useEffect(() => {
    }, [computing]);

    function applyModifiers() {
        setComputing(true);
        // Use setTimeout to simulate a time-consuming operation (replace this with your actual heavy function)
        setTimeout(() => {
            // Update Modifiers State
            setModifiersData();
            console.log(chart);
            // Update chart data
            if(chart.p instanceof DataProcessor) {
                chart.p.data = chart.p.process();
            }

            // Rerender Chart
            props.updateComponent();
            // Set computing to false after the heavy operation is completed
            setComputing(false);
        }, 0);
    }

    function setModifiersData() {
        // Age Modifiers
        chart.p.ageGroups = ageGroups;
        // Gender Modifiers
        chart.p.genders = genders;
        // Time Span Modifiers
        chart.p.timeSpan = timeSpan;
        // Threshold Modifiers
        chart.p.threshold = threshold;
    }


    function updateAgeModifiers(data) {
        // Remove the 'All' checkbox from the data array
        data.shift();
        let ag = AGE_GROUPS.filter((ageGroup, index) => data[index] === true);
        setAgeGroups(ag);
    }

    function updateGenderModifiers(data) {
        let gs = GENDERS.filter((g, index) => data[index] === true);
        setGenders(gs);
    }


    function updateTimeSpan(startDate, endDate) {
        // Save Time Span State
        setTimeSpan([startDate, endDate]);
    }

    function updateThreshold(threshold) {
        // Save Threshold State
        setThreshold(threshold);
    }

    function renderAgeModifier() {
        return <AgeModifier key={props.activeIndex + "age"}
                            chartData={chart}
                            updateAgeModifiers={updateAgeModifiers}/>
    }

    function renderGenderModifier() {

        if (chart.id !== 0 && chart.id !== 1)
        return <GenderModifier key={props.activeIndex + "gender"}
                            chartData={chart}
                            updateAgeModifiers={updateGenderModifiers}/>
    }

    function renderTimeSpanModifier() {
        if (chart.id === 3 || chart.id === 2 || chart.id === 6 || chart.id === 7)
            return <TimeSpanModifier key={props.activeIndex + "timeSpan"}
                                     chartData={chart}
                                     updateTimeSpan={updateTimeSpan}/>
    }

    function renderThresholdModifier() {
        if (chart.id === 5 || chart.id === 7)
            return <ThresholdModifier key={props.activeIndex + "threshold"}
                                      threshold={threshold}
                                      updateThreshold={updateThreshold}/>
    }

    return (
        <div className={"modifiers-box"}>
            <h2>Modifiers for: {chart.title}</h2>
            <div className={"scroll-box"}>
                {renderAgeModifier()}
                {renderGenderModifier()}
                {renderTimeSpanModifier()}
                {renderThresholdModifier()}
            </div>
            <div className={"apply-box"}>
                {computing && <p>Computing...</p>}
                {!computing && <div>
                    <button className={"apply-btn"} id={"apply"} onClick={applyModifiers}>Apply</button>
                </div>}
            </div>
        </div>
    );
}