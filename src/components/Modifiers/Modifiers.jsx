import React, {useEffect, useState} from "react";
import "./Modifiers.css"
import AgeModifier from "./AgeModifier";
import TimeSpanModifier from "./TimeSpanModifier";
import {AGE_GROUPS, GENDERS} from "../../utils/constants";
import ThresholdModifier from "./ThresholdModifier";
import GenderModifier from "./GenderModifier";
import {DataProcessor} from "../../utils/filterData";
import {getActiveStation} from "../../utils/globalVars";

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
            // Update chart data
            if (chart.p instanceof DataProcessor) {
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
        return <AgeModifier key={props.activeIndex + "age" + props.tabIndex}
                            chartData={chart}
                            updateAgeModifiers={updateAgeModifiers}/>
    }

    function renderGenderModifier() {
        return <GenderModifier key={props.activeIndex + "gender" + props.tabIndex}
                               chartData={chart}
                               updateAgeModifiers={updateGenderModifiers}/>
    }

    function renderTimeSpanModifier() {
        return <TimeSpanModifier key={props.activeIndex + "timeSpan" + props.tabIndex}
                                 chartData={chart}
                                 updateTimeSpan={updateTimeSpan}/>
    }

    function renderThresholdModifier() {
        return <ThresholdModifier key={props.activeIndex + "threshold" + props.tabIndex}
                                  threshold={threshold}
                                  updateThreshold={updateThreshold}/>
    }

    function renderModifiers() {
        switch (chart.id) {
            case 0:
                // Gender Pie Chart
                return [renderAgeModifier()];
            case 1:
                // Age Bar Chart
                return [renderAgeModifier()];
            case 2:
                // Condition Records Line Chart
                return [renderAgeModifier(), renderGenderModifier(), renderTimeSpanModifier()];
            case 3:
                // Admissions Line Chart
                return [renderAgeModifier(), renderGenderModifier(), renderTimeSpanModifier()];
            case 4:
                // Encounter Types Pie Chart
                return [renderAgeModifier(), renderGenderModifier(), renderTimeSpanModifier()];
            case 5:
                // Disease Types Pie Chart
                return [renderAgeModifier(), renderGenderModifier(), renderThresholdModifier()];
            case 6:
                // Dismissions Line Chart
                return [renderAgeModifier(), renderGenderModifier(), renderTimeSpanModifier()];
            case 7:
                // Avg Length of Stay Number
                return [renderAgeModifier(), renderGenderModifier(), renderTimeSpanModifier(), renderThresholdModifier()];
            default:
                return [renderAgeModifier(), renderGenderModifier(), renderTimeSpanModifier(), renderThresholdModifier()];
        }
    }

    return (
        <div className={"modifiers-box"}>
            <h2>Modifiers for: {chart.title}</h2>
            <div className={"scroll-box"}>
                {renderModifiers().map(m => m)}
                <div className={"spacer"} style={{height: '50px'}}></div>
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