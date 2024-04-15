import './App.css';
import Sidemenu from "./components/Sidemenu/Sidemenu";
import {useState} from "react";
import SettingsScreen from "./components/SettingsScreen/SettingsScreen";
import StatsScreen from "./components/StatsScreen/StatsScreen";
import {APIWraper, DataProvider} from "./utils/api";
import DownloadScreen from "./components/ExportScreen/DownloadScreen";
import {STATIONS} from "./utils/constants";
import {setActiveStation, setDaysToMonths} from "./utils/globalVars";

function App() {

    const [activeScreen, setActiveScreen] = useState(0);

    // init constant values
    let activeStation = localStorage.getItem('activeStation') || STATIONS[0];
    setActiveStation(activeStation);
    let daysToMonths = Number(localStorage.getItem('daysToMonthThreshold')) || 3.2;
    setDaysToMonths(daysToMonths);

    return (
        <APIWraper>
            <div className="App">
                <Sidemenu activeScreen={activeScreen} setActiveScreen={setActiveScreen}/>
                {activeScreen === 0 && <StatsScreen/>}
                {activeScreen === 1 && <DownloadScreen/>}
                {activeScreen === 2 && <SettingsScreen/>}

            </div>
        </APIWraper>
    );
}

export default App;
