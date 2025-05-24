import {useState} from "react";
import DbMetaContext from "./DbMetaContext";
import Box from "@mui/material/Box";

function DbMetaContextProvider({children}) {
    const [dbMeta, setDBMeta] = useState([]);

    // console.log('DBMetaContextProvider: ', children);

    return (
        <DbMetaContext.Provider value={[dbMeta, setDBMeta]}>
            <Box>
                {children}
            </Box>
        </DbMetaContext.Provider>
    );
}


export default DbMetaContextProvider;