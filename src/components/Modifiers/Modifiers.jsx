import React, {useState} from "react";
import "./Modifiers.css"
import AgeModifier from "./AgeModifier";
import TimeSpanModifier from "./TimeSpanModifier";

export default function Modifiers(props) {

    // Current Active Chart Data
    let chartData = props.charts[props.activeIndex];

    // Track modifier states
    const [ageModifiers, setAgeModifiers] = useState(Array.from({length: props.charts.length}, () => new Array(12).fill(true)));


    function applyModifiers() {
        chartData.getData()
    }


    function updateAgeModifiers(data) {
        ageModifiers[props.activeIndex] = data;
        setAgeModifiers(ageModifiers);
    }

    function renderAgeModifier() {
        console.log(props.activeIndex)
        if (chartData.title === "Age" || chartData.title === "Gender" || chartData.title === "Encounters")
            return <AgeModifier key={props.activeIndex + "age"} updateComponent={props.updateComponent}
                                chartData={chartData}
                                initialStates={ageModifiers[props.activeIndex]}
                                updateAgeModifiers={updateAgeModifiers}/>
    }

    function renderTimeSpanModifier() {
        if (chartData.title === "Encounters")
            return <TimeSpanModifier key={props.activeIndex + "timeSpan"}/>
    }

    return (


        <div className={"modifiers-box"}>
            <h2>Modifiers for: {chartData.title}</h2>
            {renderAgeModifier()}
            {renderTimeSpanModifier()}
            <button className={"apply-btn"} id={"apply"} onClick={applyModifiers}>Apply</button>
        </div>


    );
}