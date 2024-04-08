// Settings
import {STATIONS} from "./constants";

let daysToMonths = Number(localStorage.getItem('daysToMonthThreshold')) || 3.2;

export function getDaysToMonths() {
    return daysToMonths;
}

export function setDaysToMonths(value) {
    daysToMonths = value;
    localStorage.setItem('daysToMonthThreshold', value);
}



// Active Station
let activeStation = localStorage.getItem('activeStation') || STATIONS[0];

export function getActiveStation() {
    return activeStation;
}

export function setActiveStation(value) {
    activeStation = value;
    localStorage.setItem('activeStation', value);
}