// props are:
import {useState} from "react";
import React from "react";
import './SettingsNumberInput.css'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleQuestion} from "@fortawesome/free-regular-svg-icons";

// props are: id, label, initialValue, onChange
export function SettingsNumberInput(props) {
    const [value, setValue] = useState(props.initialValue);

    function changeValue(event) {
        setValue(event.target.value);
        props.onChange(event.target.value);
    }

    return (
        <div className={"settings-number-input"}>
            <div className={"number-input-description"}>
                <label style={{marginRight: "10px"}} htmlFor={props.id}>{props.label}</label>
                {props.tooltipText &&
                    (<div className={"question-icon"} title={props.tooltipText}>
                    <FontAwesomeIcon icon={faCircleQuestion}/>
                </div>)
                }
            </div>
            <input
                type="number"
                id={props.id}
                value={Number(value)}
                onChange={changeValue}
                min="0"
            /></div>
    );
}