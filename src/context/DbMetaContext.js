import {createContext} from "react";

const dbMetaContext = createContext([null, () => {}]);
export default dbMetaContext;