import React, {useEffect, useState} from "react";
import "./Modifiers.css"
import AgeModifier from "./AgeModifier";
import TimeSpanModifier from "./TimeSpanModifier";
import {AGE_GROUPS, ENDDATE, STARTDATE} from "../../utils/constants";
import StatsScreen from "../StatsScreen/StatsScreen";
import ThresholdModifier from "./ThresholdModifier";

export default function Modifiers(props) {

    // Track computing state
    const [computing, setComputing] = useState(false);

    // Current Active Chart Data
    let chartData = props.charts[props.activeIndex];

    // Track modifier states
    // All Age Modifiers
    const [ageModifiers, setAgeModifiers] = useState(Array.from({length: props.charts.length}, () => new Array(12).fill(true)));
    // Age Modifiers temporal storage
    const [ageModifierStates, setAgeModifierStates] = useState(ageModifiers[props.activeIndex]);

    // All Time Span Modifiers
    const [timeSpanModifiers, setTimeSpanModifiers] = useState(Array.from({length: props.charts.length}, () => [STARTDATE, ENDDATE]));
    // Time Span Modifiers temporal storage
    const [timeSpanModifierState, setTimeSpanModifierState] = useState(timeSpanModifiers[props.activeIndex]);

    // All Threshold Modifiers
    const [thresholdModifiers, setThresholdModifiers] = useState(Array.from({length: props.charts.length}, () => 0));
    // Threshold Modifiers temporal storage
    const [thresholdModifierState, setThresholdModifierState] = useState(thresholdModifiers[props.activeIndex]);

    // Track 'getData' function variables
    const [ageGroups, setAgeGroups] = useState(Array.from(AGE_GROUPS));
    const [timeSpan, setTimeSpan] = useState([STARTDATE, ENDDATE]);
    const [threshold, setThreshold] = useState(0);


    useEffect(() => {
    }, [computing]);

    function applyModifiers() {
        setComputing(true);
        // Use setTimeout to simulate a time-consuming operation (replace this with your actual heavy function)
        setTimeout(() => {
            // Update chart data
            chartData.modifiedData = chartData.getData(ageGroups, timeSpan, threshold);
            // Update Modifiers State
            setModifiersData();
            // Rerender Chart
            props.updateComponent();
            // Set computing to false after the heavy operation is completed
            setComputing(false);
        }, 0);
    }

    function setModifiersData() {
        // Age Modifiers
        ageModifiers[props.activeIndex] = ageModifierStates;
        setAgeModifiers(ageModifiers);
        // Time Span Modifiers
        timeSpanModifiers[props.activeIndex] = timeSpanModifierState;
        setTimeSpanModifiers(timeSpanModifiers);
        // Threshold Modifiers
        thresholdModifiers[props.activeIndex] = thresholdModifierState;
        setThresholdModifiers(thresholdModifiers);
    }


    function updateAgeModifiers(data) {
        // Save Checkbox states
        setAgeModifierStates(Array.from(data));
        // Remove the 'All' checkbox from the data array
        data.shift();
        let ag = AGE_GROUPS.filter((ageGroup, index) => data[index] === true);
        setAgeGroups(ag);
    }

    function updateTimeSpan(startDate, endDate) {
        // Save Time Span State
        setTimeSpanModifierState([startDate, endDate]);
        setTimeSpan([startDate, endDate]);
    }

    function updateThreshold(threshold) {
        // Save Threshold State
        setThresholdModifierState(threshold);
        setThreshold(threshold);
    }

    function renderAgeModifier() {
        if (chartData.id === 0 || chartData.id === 1 || chartData.id === 3 || chartData.id === 4 || chartData.id === 5)
            return <AgeModifier key={props.activeIndex + "age"}
                                chartData={chartData}
                                initialStates={ageModifiers[props.activeIndex]}
                                updateAgeModifiers={updateAgeModifiers}/>
    }

    function renderTimeSpanModifier() {
        if (chartData.id === 3 || chartData.id === 2)
            return <TimeSpanModifier key={props.activeIndex + "timeSpan"}
                                     initialStates={timeSpanModifiers[props.activeIndex]}
                                     updateTimeSpan={updateTimeSpan}/>
    }

    function renderThresholdModifier() {
        if (chartData.id === 5)
            return <ThresholdModifier key={props.activeIndex + "threshold"}
                                      threshold={thresholdModifiers[props.activeIndex]}
                                      updateThreshold={updateThreshold}/>
    }

    return (
        <div className={"modifiers-box"}>
            <h2>Modifiers for: {chartData.title}</h2>
            <div className={"scroll-box"}>
                {renderAgeModifier()}
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