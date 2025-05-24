import {createContext} from "react";

const activeParentOrgContext = createContext([null, () => {}]);
export default activeParentOrgContext;