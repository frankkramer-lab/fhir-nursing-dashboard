import React, {useEffect, useState} from "react";
import "./Modifiers.css"
import AgeModifier from "./AgeModifier";
import TimeSpanModifier from "./TimeSpanModifier";
import {AGE_GROUPS, GENDERS} from "../../utils/constants";
import ThresholdModifier from "./ThresholdModifier";
import GenderModifier from "./GenderModifier";
import {DataProcessor} from "../../utils/data_processors";
import DatasetCodeModifier from "./DatasetCodeModifier";
import {
    AdmissionDatesLineChartID,
    AgeBarChartID, CareProblemTypePieChart, CareProblemTypeTimeLineChartID,
    ConditionTypePieChartID, ConditionTypeTimeLineChartID,
    DischargeDatesLineChartID,
    GenderPieChartID,
    LengthOfStayNumberDisplayID,
    NursingProceduresTypePieChartID,
    NursingProceduresTypeTimeLineChartID, RespirationSupportTimeLineChartID,
} from "../../utils/init_charts";


export default function Modifiers(props) {
    console.log('Modifiers: ', props);
    // Track computing state
    const [computing, setComputing] = useState(false);

    // Current Active Chart Data
    let chart;
    for(const chart_i of props.charts) {
        if(chart_i.id === props.activeIndex) {
            chart = chart_i;
            break;
        }
    }

    // Track 'process' function variables
    const [ageGroups, setAgeGroups] = useState(chart.p.ageGroups);
    const [genders, setGenders] = useState(chart.p.genders);
    const [timeSpan, setTimeSpan] = useState(chart.p.timeSpan);
    const [threshold, setThreshold] = useState(chart.p.threshold);
    const [datasetCodes, setDatasetCodes] = useState(chart.p.dataset_codes);

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
        // Dataset Codes Modifiers
        chart.p.dataset_codes = datasetCodes;
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

    function updateDatasetCodes(dataset_codes) {
        console.log('Updating dataset codes state: ', dataset_codes);
        // Save Selected Codes State
        setDatasetCodes(dataset_codes);
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

    function renderDatasetCodeModifier(codes, all_code_options) {
        return <DatasetCodeModifier key={props.activeIndex + "datasetCode" + props.tabIndex}
                                    codes={codes}
                                    all_code_options={all_code_options}
                                    updateDatasetCodes={updateDatasetCodes}/>
    }

    function renderModifiers() {
        switch (chart.id) {
            case GenderPieChartID:
                return [renderAgeModifier()];
            case AdmissionDatesLineChartID:
            case DischargeDatesLineChartID:
            case RespirationSupportTimeLineChartID:
                return [renderAgeModifier(), renderGenderModifier(), renderTimeSpanModifier()];
            case LengthOfStayNumberDisplayID:
                return [renderAgeModifier(), renderGenderModifier(), renderTimeSpanModifier(), renderThresholdModifier()];
            case NursingProceduresTypePieChartID:
            case ConditionTypePieChartID:
            case CareProblemTypePieChart:
            case NursingProceduresTypeTimeLineChartID:
            case ConditionTypeTimeLineChartID:
            case CareProblemTypeTimeLineChartID:
                const codes_for_modifier = chart.p.dataset_codes.map(code => {return {value: code.code, label: code.display}});
                const all_codes_for_modifier = chart.p.all_dataset_codes.map(code => {return {value: code.code, label: code.display}});
                return [renderDatasetCodeModifier(codes_for_modifier, all_codes_for_modifier), renderAgeModifier(), renderGenderModifier(), renderTimeSpanModifier(), renderThresholdModifier()];
            case AgeBarChartID:
            default:
                return [];
        }
    }

    return (<div className={"modifiers-box"}>
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
        </div>);
}