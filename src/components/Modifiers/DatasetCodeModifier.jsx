import React from 'react';
import Select from 'react-select';
import {charts04} from "../../utils/constants";
import Box from "@mui/material/Box";


export default function DatasetCodeModifier(props) {
    console.log('Dataset code modifier: ', props);

    const [selectedCodes, setSelectedCodes] = React.useState(props.codes);


    function updateCodes(entries) {
        console.log('Updating Codes: ', entries);
        if (entries.length === 0) {
            entries = [];
        }

        setSelectedCodes(entries);

        let codes = entries.map((entry) => {return {code: entry.value, display: entry.label}});

        props.updateDatasetCodes(codes);
    }


    return (
        <Box style={{padding: '5px'}}>
            <h2>Codes</h2>
            <Select
                closeMenuOnSelect={true}
                onSelectResetInput={true}
                isMulti
                value={selectedCodes}
                options={props.all_code_options}
                onChange={(e) => updateCodes(e)}
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
        </Box>
    );
}