import React, {useContext, useEffect, useState} from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";

import DBMetaContext from "../context/DbMetaContext";
import activeParentOrgContext from "../context/ActiveParentOrgContext";

export function SelectActiveParentOrg({children}) {
    const [dbMeta,] = useContext(DBMetaContext);

    const [loading, setLoading] = useState(true);

    // parent Organization:
    // console.log(dbMeta);
    const [activeParentOrg, dispatchActiveParentOrgName] = useContext(activeParentOrgContext);

    useEffect(() => {
        dispatchActiveParentOrgName({
            type: 'set_parent_org',
            payload: {
                org: dbMeta.org_ids[0],
                org_fa_mapping: dbMeta.org_fa_mapping,
                org_station_mapping: dbMeta.org_station_mapping,
            }
        });
        setLoading(false);
    }, [dbMeta]);

    const handleActiveParentOrgChange = (event) => {
        dispatchActiveParentOrgName({
            type: 'set_parent_org',
            payload: {
                org: event.target.value,
                org_fa_mapping: dbMeta.org_fa_mapping,
                org_station_mapping: dbMeta.org_station_mapping,
            }
        });
    };

    if (loading) {
        return (<Box>
                Loading...
            </Box>)
    }

    // console.log('activeDB: ', activeParentOrg);

    const select_parent_org_values = Object.entries(dbMeta.orgs).map(([id, org], i) => (
        <MenuItem value={org.id} key={i}>{org.name}</MenuItem>));
    // console.log('select_parent_org_values: ', select_parent_org_values);

    return (<Box>
        <Box sx={{padding: '20px'}}>
            <FormControl fullWidth>
                <InputLabel id="select-active-parent-org-label">Parent Organization</InputLabel>
                <Select
                    labelId="select-active-parent-org-label"
                    id="select-active-parent-org"
                    value={activeParentOrg.activeParentOrg}
                    label='select-active-parent-org'
                    onChange={handleActiveParentOrgChange}
                    variant='standard'>
                    {select_parent_org_values}
                </Select>
            </FormControl>
        </Box>
        <Box>
            {children}
        </Box>
    </Box>);
}