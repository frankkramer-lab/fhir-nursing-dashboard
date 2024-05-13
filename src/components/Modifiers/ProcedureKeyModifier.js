import React from 'react';
import Select from 'react-select';
import {getProcedureKeys} from "../../utils/globalVars";


export default function ProcedureKeyModifier(props) {

    let keys = props.procedureKeys.map((key) => {
        return {value: key, label: key}
    });

    const [procedureKeys, setProcedureKeys] = React.useState(keys);

    const options = [];

    getProcedureKeys().map((key) => {
        options.push({value: key, label: key})
    })

    function updateKeys(entries) {
        if(entries.length === 0) {
            entries = [];
        }
        if(entries.length >= 3) {
            entries = entries.slice(entries.length - 3, entries.length);
        }
        setProcedureKeys(entries);
        let keys = entries.map((entry) => entry.value)
        props.updateProcedureKeys(keys);
    }

    console.log(procedureKeys);

    return (
        <Select
            closeMenuOnSelect={true}
            onSelectResetInput={true}
            isMulti
            value={procedureKeys}
            options={options}
            onChange={(e) => updateKeys(e)}
        />
    );
}