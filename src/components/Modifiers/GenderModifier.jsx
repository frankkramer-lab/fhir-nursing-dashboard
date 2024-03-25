import React from "react";
import "./GenderModifier.css"
import {
    GENDERS,
} from "../../utils/constants";

export default function GenderModifier(props) {

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
                                   defaultChecked={props.initialStates[index]}/>
                            <label>{gender}</label>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}