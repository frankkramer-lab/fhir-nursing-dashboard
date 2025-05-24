// API

// Local Docker Container
// export const API_BASE_URL = 'https://localhost:9443/fhir-server/api/v4/';

// SSH Connection
export const API_BASE_URL = 'http://localhost:8080/fhir-server/api/v4/';
export const USER = 'fhiruser';
export const PASSWORD = 'change-password';

// Behavior for loading fhir data. If true clears data of local database on load.
export const CLEAR_FHIR_DATA_ON_LOAD = true;

// System
export const LOGINDIVIDUALPROCESSORTIMES = false;

// Charts
export const PIE = 'pie';
export const BAR = 'bar';
export const LINE = 'line';
export const NUMBER = 'number';

// Time Span
export const START_DATE = new Date(2021, 0, 1, 0, 0, 0, 0);
export const END_DATE = new Date(2022, 11, 31, 23, 59, 59, 0);


// Age Groups
class AgeGroup {
    constructor(min_age, max_age = null) {
        this.min_age = min_age;

        if (max_age !== null) {
            this.max_age = max_age;
            this.label = `${this.min_age}-${this.max_age}`;
        } else {
            this.max_age = Infinity;
            this.label = `${this.min_age}++`;
        }
    }
}

export const AGE_GROUP_0_9 = new AgeGroup(0, 9);
export const AGE_GROUP_10_19 = new AgeGroup(10, 19);
export const AGE_GROUP_20_29 = new AgeGroup(20, 29);
export const AGE_GROUP_30_39 = new AgeGroup(30, 39);
export const AGE_GROUP_40_49 = new AgeGroup(40, 49);
export const AGE_GROUP_50_59 = new AgeGroup(50, 59);
export const AGE_GROUP_60_69 = new AgeGroup(60, 69);
export const AGE_GROUP_70_79 = new AgeGroup(70, 79);
export const AGE_GROUP_80_89 = new AgeGroup(80, 89);
export const AGE_GROUP_90_99 = new AgeGroup(90, 99);
export const AGE_GROUP_100 = new AgeGroup(100);

export const AGE_GROUPS = [AGE_GROUP_0_9, AGE_GROUP_10_19, AGE_GROUP_20_29, AGE_GROUP_30_39, AGE_GROUP_40_49, AGE_GROUP_50_59, AGE_GROUP_60_69, AGE_GROUP_70_79, AGE_GROUP_80_89, AGE_GROUP_90_99, AGE_GROUP_100];

// Gender
class Gender {
    constructor(fhir_code, label) {
        this.fhir_code = fhir_code;
        this.label = label;
    }
}

export const GENDER_MALE = new Gender('male', 'Male');
export const GENDER_FEMALE = new Gender('female', 'Female');
export const GENDER_OTHER = new Gender('other', 'Other');
export const GENDER_UNKNOWN = new Gender('unknown', 'Unknown');

export const GENDERS = [GENDER_MALE, GENDER_FEMALE, GENDER_OTHER, GENDER_UNKNOWN];

// prefix for database(s)
export const ORG_DB_PREFIX = 'orgDB_';

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


