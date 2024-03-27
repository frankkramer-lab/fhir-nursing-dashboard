import React from "react";
import "./AgeModifier.css"
import {
    AGE_GROUPS,
} from "../../utils/constants";

export default function AgeModifier(props) {

    let initialStates = AGE_GROUPS.map(g => props.chartData.p.ageGroups.includes(g));
    let allBox = !initialStates.includes(false);
    initialStates.unshift(allBox);

    const toggleAll = (event) => {
        let checkboxes = document.getElementsByName('age-checkbox');
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i] !== event.target) {
                checkboxes[i].checked = event.target.checked;
            }
        }
        updateData();
    }

    const handleCheckboxChange = (event) => {
        const checkboxes = document.getElementsByName('age-checkbox');
        if (!event.target.checked) {
            checkboxes[0].checked = false;
        } else {
            checkboxes[0].checked = true;
            for (let i = 1; i < checkboxes.length; i++) {
                if (!checkboxes[i].checked) {
                    checkboxes[0].checked = false;
                    break;
                }
            }
        }
        updateData();
    }

    function updateData() {
        let checkboxes = document.getElementsByName('age-checkbox');
        let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                data[i] = 1;
            }
        }
        console.log(data);
        props.updateAgeModifiers(data.map(d => Boolean(d)));
    }


    return (
        <div id={"age-checkboxes"}>
            <h2>Age</h2>
            <ul>
                <li><input name={"age-checkbox"} type="checkbox" onClick={toggleAll}
                           defaultChecked={initialStates[0]}/><label>All</label></li>

                {AGE_GROUPS.map((ageGroup, index) => {
                    return (
                        <li key={index}>
                            <input name={"age-checkbox"} type="checkbox" value={ageGroup} onClick={handleCheckboxChange}
                                   defaultChecked={initialStates[index + 1]}/>
                            <label>{ageGroup}</label>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}