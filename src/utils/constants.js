// API

// Local Docker Container
// export const API_BASE_URL = 'https://localhost:9443/fhir-server/api/v4/';

// SSH Connection
export const API_BASE_URL = 'http://localhost:8080/fhir-server/api/v4/';
export const USER = 'fhiruser';
export const PASSWORD = 'change-password';
export const ALWAYS_LOAD = false; // true -> always load from server, false -> load from local DB if available


// System
export const LOGINDIVIDUALPROCESSORTIMES = false;

// Charts
export const PIE = 'pie';
export const BAR = 'bar';
export const LINE = 'line';
export const NUMBER = 'number';

// Time Span
export const STARTDATE = new Date(2021, 0, 1, 0, 0, 0, 0);
export const ENDDATE = new Date(2022, 11, 31, 23, 59, 59, 0);


// Age Groups
export const AGEGROUP0_9 = '0-9';
export const AGEGROUP10_19 = '10-19';
export const AGEGROUP20_29 = '20-29';
export const AGEGROUP30_39 = '30-39';
export const AGEGROUP40_49 = '40-49';
export const AGEGROUP50_59 = '50-59';
export const AGEGROUP60_69 = '60-69';
export const AGEGROUP70_79 = '70-79';
export const AGEGROUP80_89 = '80-89';
export const AGEGROUP90_99 = '90-99';
export const AGEGROUP100 = '100+';

export const AGE_GROUPS = [
    AGEGROUP0_9,
    AGEGROUP10_19,
    AGEGROUP20_29,
    AGEGROUP30_39,
    AGEGROUP40_49,
    AGEGROUP50_59,
    AGEGROUP60_69,
    AGEGROUP70_79,
    AGEGROUP80_89,
    AGEGROUP90_99,
    AGEGROUP100
];

// Gender
export const MALE = 'male';
export const FEMALE = 'female'

export const GENDERS = [
    MALE,
    FEMALE
];

// Infrastructure
export const SUPPLYPOINTS = [
    '1MD',
    '2MD',
    '2MD-IPF',
    '3MD',
    '4MD',
    'AIN',
    'UCH',
    'HTC',
    'AUG',
    'URO',
    'GCH'
];

export const STATIONS = [
    "085 - Station 8.5",
    "088 - Station 8.8",
    "IZ21 - Station 2.1",
    "IZ22 - Station 2.2"
];


// Colors
export const charts01 = '#aee0ee';
export const charts02 = '#71bada';
export const charts03 = '#2194bb';
export const charts04 = '#026789';
export const charts05 = '#DEAA00';


// Different Color Options
/*export const charts01 = '#EBEBFF';
export const charts02 = '#B8BBD9';
export const charts03 = '#858EB4';
export const charts04 = '#506490';
export const charts05 = '#0C3E6E';*/

/*export const charts01 = '#dcdcff';
export const charts02 = '#a6aadc';
export const charts03 = '#6b7fd0';
export const charts04 = '#25559b';
export const charts05 = '#042b52';*/

/*export const charts01 = '#003f5c';
export const charts02 = '#58508d';
export const charts03 = '#bc5090';
export const charts04 = '#ff6361';
export const charts05 = '#ffa600';*/


/*export const charts01 = '#6f6bf8';
export const charts02 = '#199bff';
export const charts03 = '#1cc0ff';
export const charts04 = '#77deff';
export const charts05 = '#c2f8ff';*/


