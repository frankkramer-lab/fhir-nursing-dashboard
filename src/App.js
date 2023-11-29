import './App.css';
import Sidemenu from "./components/Sidemenu/Sidemenu";
import {useState} from "react";
import SettingsScreen from "./components/SettingsScreen/SettingsScreen";
import StatsScreen from "./components/StatsScreen/StatsScreen";

function App() {

    const [activeScreen, setActiveScreen] = useState(0);

    return (
        <div className="App">
            <Sidemenu activeScreen={activeScreen} setActiveScreen={setActiveScreen}/>
            {activeScreen === 0 && <StatsScreen/>}
            {activeScreen === 1 && <SettingsScreen/>}

        </div>
    );
}

export default App;
