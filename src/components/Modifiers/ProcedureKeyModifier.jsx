import React from 'react';
import Select from 'react-select';
import {charts04} from "../../utils/constants";


export default function ProcedureKeyModifier(props) {

    let keys = props.procedureKeys.map((key) => {
        return {value: key, label: key}
    });

    const [procedureKeys, setProcedureKeys] = React.useState(keys);

    const options = [];

    props.allKeys.map((key) => {
        options.push({value: key, label: key})
    })

    function updateKeys(entries) {
        if (entries.length === 0) {
            entries = [];
        }
        if (entries.length >= 3) {
            entries = entries.slice(entries.length - 3, entries.length);
        }
        setProcedureKeys(entries);
        let keys = entries.map((entry) => entry.value)
        props.updateProcedureKeys(keys);
    }


    return (
        <Select
            closeMenuOnSelect={true}
            onSelectResetInput={true}
            isMulti
            value={procedureKeys}
            options={options}
            onChange={(e) => updateKeys(e)}
            styles={{  // style for the dropdown menu
                clearIndicator: (provided, state) => ({
                  ...provided,
                    color: charts04,
                }),
                menu: (provided, state) => ({
                    ...provided,
                }),
                control: (provided, state) => ({
                    ...provided,
                    borderRadius: "10px",
                    borderColor: charts04,
                    padding: "5px",
                    marginRight: "10px",
                }),
                singleValue: (provided, state) => ({
                    ...provided,
                }),
                multiValue: (provided, state) => ({
                    ...provided,
                    borderRadius: "5px",
                    backgroundColor: charts04,
                    color: 'white',
                }),
                multiValueLabel: (provided, state) => ({
                    ...provided,
                    borderRadius: "5px",
                    backgroundColor: charts04,
                    color: 'white',
                }),
            }}
        />
    );
}