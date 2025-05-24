import './App.css';
import Sidemenu from "./components/Sidemenu/Sidemenu";
import SettingsScreen from "./components/SettingsScreen/SettingsScreen";
import StatsScreen from "./components/StatsScreen/StatsScreen";
import {APIWrapper} from "./components/APIWrapper";
import DownloadScreen from "./components/ExportScreen/DownloadScreen";
import DbMetaContextProvider from "./context/DbMetaContextProvider";
import {SelectActiveParentOrg} from "./components/SelectActiveParentOrg";
import {setDaysToMonths} from "./utils/globalVars";
import {useState} from "react";
import ActiveParentOrgContextProvider from "./context/ActiveParentOrgContextProvider";

function App() {
    const [activeScreen, setActiveScreen] = useState(0);

    // init constant values
    let daysToMonths = Number(localStorage.getItem('daysToMonthThreshold')) || 3.2;
    setDaysToMonths(daysToMonths);

    return (
        <DbMetaContextProvider>
            <APIWrapper>
                <ActiveParentOrgContextProvider>
                    <SelectActiveParentOrg>
                        <div className="App">
                            <Sidemenu activeScreen={activeScreen} setActiveScreen={setActiveScreen}/>
                            {activeScreen === 0 && <StatsScreen/>}
                            {activeScreen === 1 && <DownloadScreen/>}
                            {activeScreen === 2 && <SettingsScreen/>}
                        </div>
                    </SelectActiveParentOrg>
                </ActiveParentOrgContextProvider>
            </APIWrapper>
        </DbMetaContextProvider>);
}

export default App;
