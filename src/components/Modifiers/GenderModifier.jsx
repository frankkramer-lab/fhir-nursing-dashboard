import React from "react";
import "./GenderModifier.css"
import {
    GENDERS,
} from "../../utils/constants";
import {DataProcessor} from "../../utils/filterData";

export default function GenderModifier(props) {

    let activeGenders = props.chartData.p.genders;
    let genderModifierStates = GENDERS.map(g => activeGenders.includes(g));

    function updateData() {
        let checkboxes = document.getElementsByName('gender-checkbox');
        let data = GENDERS.map(() => 0);
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                data[i] = 1;
            }
        }
        console.log(data);
        props.updateAgeModifiers(data.map(d => Boolean(d)));
    }


    return (
        <div id={"gender-checkboxes"}>
            <h2>Gender</h2>
            <ul>
                {GENDERS.map((gender, index) => {
                    return (
                        <li key={index}>
                            <input name={"gender-checkbox"} type="checkbox" value={gender}
                                   onClick={updateData}
                                   defaultChecked={genderModifierStates[index]}/>
                            <label>{gender}</label>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}