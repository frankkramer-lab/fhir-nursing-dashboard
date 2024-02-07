import React from "react";
import "./AgeModifier.css"
import {
    AGE_GROUPS,
} from "../../utils/constants";
import {getAgeData, getGenderData} from "../../utils/filterData";

export default function AgeModifier(props) {

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
        let data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 1; i < checkboxes.length; i++) {
            if (checkboxes[i].checked) {
                data[i - 1] = 1;
            }
        }

        let filteredAges = AGE_GROUPS.filter((ageGroup, index) => data[index] === 1);
        if (props.chartData.title === "Gender") {
            props.chartData.modifiedData = getGenderData(filteredAges);
            props.updateComponent();
        }
        if (props.chartData.title === "Age") {
            props.chartData.modifiedData = getAgeData(filteredAges);
            props.updateComponent();
        }
    }


    return (
        <div id={"age-checkboxes"}>
            <h2>Age</h2>
            <ul>
                <li><input name={"age-checkbox"} type="checkbox" onClick={toggleAll}
                           defaultChecked={true}/><label>All</label></li>

                {AGE_GROUPS.map((ageGroup, index) => {
                    return (
                        <li key={index}>
                            <input name={"age-checkbox"} type="checkbox" value={ageGroup} onClick={handleCheckboxChange}
                                   defaultChecked={true}/>
                            <label>{ageGroup}</label>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}