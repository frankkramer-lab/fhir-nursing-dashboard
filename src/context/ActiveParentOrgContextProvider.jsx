import {useReducer} from "react";
import Box from "@mui/material/Box";
import {produce} from "immer";

import ActiveParentOrgContext from "./ActiveParentOrgContext";

function parent_org_state_reducer(state, action)  {
    console.log('parent_org_state_reducer dispatching: ', state, action);
    switch (action.type) {
        case 'set_parent_org':
            let draftState = {};
            const org = action.payload.org;
            draftState.activeParentOrg = org;
            draftState.activeFa = action.payload.org_fa_mapping[org][0];
            draftState.activeStation = action.payload.org_station_mapping[org][0];
            return draftState;
        case 'set_fa':
            return produce(state, (draftState) => {
               draftState.activeFa = action.payload.fa;
            });
        case 'set_station':
            return produce(state, (draftState) => {
               draftState.activeStation = action.payload.station;
            });
        default:
            return state;
    }
}

function ActiveParentOrgContextProvider({children}) {
    const [activeParentOrg, dispatchActiveParentOrg] = useReducer(parent_org_state_reducer, {});

    return (
        <ActiveParentOrgContext.Provider value={[activeParentOrg, dispatchActiveParentOrg]}>
            <Box>
                {children}
            </Box>
        </ActiveParentOrgContext.Provider>
    );
}


export default ActiveParentOrgContextProvider;