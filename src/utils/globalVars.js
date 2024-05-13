// Settings
import {STATIONS} from "./constants";

let daysToMonths = 3.2;


export function getDaysToMonths() {
    return daysToMonths;
}

export function setDaysToMonths(value) {
    daysToMonths = value;
    localStorage.setItem('daysToMonthThreshold', value);
}



// Active Station
let activeStation = STATIONS[0];

export function getActiveStation() {
    return activeStation;
}

export function setActiveStation(value) {
    activeStation = value;
    localStorage.setItem('activeStation', value);
}

let procedureKeys = [];

export function getProcedureKeys() {
    return procedureKeys;
}

export function setProcedureKeys(value) {
    procedureKeys = value;
}