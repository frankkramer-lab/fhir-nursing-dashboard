import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import "./AgeModifier.css"
import {AGE_GROUPS} from "../../utils/constants";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {faCaretUp} from "@fortawesome/free-solid-svg-icons/faCaretUp";

export default function AgeModifier(props) {

    let initialStates = AGE_GROUPS.map(g => props.chartData.p.ageGroups.includes(g.label));
    let allBox = !initialStates.includes(false);
    initialStates.unshift(allBox);

    const [isCollapsed, setIsCollapsed] = useState(allBox);


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
        props.updateAgeModifiers(data.map(d => Boolean(d)));
    }


    return (
        <div id={"age-checkboxes"}>
            <h2>Age</h2>
            <button className={"collapse-button"} onClick={() => setIsCollapsed(!isCollapsed)}>
                {isCollapsed ?
                    <FontAwesomeIcon icon={faPlus}/> :
                    <FontAwesomeIcon icon={faCaretUp}/>
                }
            </button>
            {!isCollapsed && (
                <ul>
                    <li><input name={"age-checkbox"} type="checkbox" onClick={toggleAll}
                               defaultChecked={initialStates[0]}/><label>All</label></li>

                    {AGE_GROUPS.map((ageGroup, index) => {
                        return (
                            <li key={index}>
                                <input name={"age-checkbox"} type="checkbox" value={ageGroup.label}
                                       onClick={handleCheckboxChange}
                                       defaultChecked={initialStates[index + 1]}/>
                                <label>{ageGroup.label}</label>
                            </li>
                        );
                    })}
                </ul>)}
        </div>
    );
}