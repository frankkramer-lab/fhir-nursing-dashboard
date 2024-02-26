import './App.css';
import Sidemenu from "./components/Sidemenu/Sidemenu";
import {useState} from "react";
import SettingsScreen from "./components/SettingsScreen/SettingsScreen";
import StatsScreen from "./components/StatsScreen/StatsScreen";
import {APIWraper, DataProvider} from "./utils/api";
import DownloadScreen from "./components/ExportScreen/DownloadScreen";

function App() {

    const [activeScreen, setActiveScreen] = useState(0);

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
