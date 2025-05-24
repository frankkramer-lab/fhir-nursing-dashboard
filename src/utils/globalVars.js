// days to months (global var)
let daysToMonths = 3.2;

export function getDaysToMonths() {
    return daysToMonths;
}

export function setDaysToMonths(value) {
    daysToMonths = value;
    localStorage.setItem('daysToMonthThreshold', value);
}

// list of artificial respiration codes (global var)
let artificialRespirationCodes = [];

export function getArtificialRespirationCodes() {
    return artificialRespirationCodes;
}

export function setArtificialRespirationCodes(value) {
    artificialRespirationCodes = value;
}