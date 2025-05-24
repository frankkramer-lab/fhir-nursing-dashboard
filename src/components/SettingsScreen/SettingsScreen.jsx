import './SettingsScreen.css';
import {getDaysToMonths, setDaysToMonths} from "../../utils/globalVars";
import {SettingsContainer} from "./SettingsContainer";
import {SettingsNumberInput} from "./SettingsNumberInput";


export default function SettingsScreen(props) {

    function setDaysToMonthThreshold(months) {
        setDaysToMonths(months);
    }


    return (
        <div className="settings-screen">
            <h1>Settings</h1>
            <SettingsContainer heading="Charts">
                <SettingsNumberInput id={"daysInput"}
                                     label={"Timespan Threshold (Months)"}
                                     initialValue={getDaysToMonths()}
                                     onChange={setDaysToMonthThreshold}
                                     tooltipText={"The number of months (which can be a decimal number, e.g., 3,2) at which the timespan-related charts will switch from days to months."}
                />
            </SettingsContainer>
        </div>
    );
}