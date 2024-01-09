import './App.css';
import Sidemenu from "./components/Sidemenu/Sidemenu";
import {useState} from "react";
import SettingsScreen from "./components/SettingsScreen/SettingsScreen";
import StatsScreen from "./components/StatsScreen/StatsScreen";
import {DataProvider} from "./utils/api";

function App() {

    const [activeScreen, setActiveScreen] = useState(0);

    return (
        <DataProvider>
            <div className="App">
                <Sidemenu activeScreen={activeScreen} setActiveScreen={setActiveScreen}/>
                {activeScreen === 0 && <StatsScreen/>}
                {activeScreen === 1 && <SettingsScreen/>}

            </div>
        </DataProvider>
    );
}

export default App;
