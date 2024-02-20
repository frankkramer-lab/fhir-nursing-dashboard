import React, {useState} from "react";
import "./Modifiers.css"
import AgeModifier from "./AgeModifier";

export default function Modifiers(props) {

    // Current Active Chart Data
    let chartData = props.charts[props.activeIndex];

    // Track modifier states
    const [ageModifiers, setAgeModifiers] = useState(Array.from({length: props.charts.length}, () => new Array(12).fill(true)));


    function updateAgeModifiers(data) {
        ageModifiers[props.activeIndex] = data;
        setAgeModifiers(ageModifiers);
    }

    function renderAgeModifiers() {
        if (chartData.title === "Age" || chartData.title === "Gender")
            return <AgeModifier key={props.activeIndex} updateComponent={props.updateComponent} chartData={chartData}
                                initialStates={ageModifiers[props.activeIndex]}
                                updateAgeModifiers={updateAgeModifiers}/>
    }

    return (
        <div className={"modifiers-box"}>
            <h2>Modifiers for: {chartData.title}</h2>
            {renderAgeModifiers()}

        </div>
    );
}