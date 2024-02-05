import React from "react";
import "./Modifiers.css"
import AgeModifier from "./AgeModifier";

export default function Modifiers(props) {


    return (
        <div className={"modifiers-box"}>
            <h1>Modifiers</h1>
            <p>Modifiers are used to change the way the chart is displayed. They can be used to make the chart mor or
                less specific</p>
            <p>{"Modifier für: " + props.chartData.title}</p>
            <AgeModifier setChartData={props.setChartData} chartData={props.chartData}/>
        </div>
    );
}