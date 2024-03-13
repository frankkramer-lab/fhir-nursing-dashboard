import {AGE_GROUPS, BAR, ENDDATE, FEMALE, LINE, MALE, PIE, STARTDATE} from "./constants";
import moment from "moment";
import {getAllDataFromDB} from "./db";
import {PI} from "chart.js/helpers";


let patients;
let conditions;
let encounters;

export async function initCharts() {

    patients = await getAllDataFromDB('patients');
    conditions = await getAllDataFromDB('conditions');
    encounters = await getAllDataFromDB('encounters');


    // All functions need to take the arguments: ageGroups, timeSpan

    let genderData = getGenderData(AGE_GROUPS, [STARTDATE, ENDDATE], 0);
    let ageData = getAgeData(AGE_GROUPS, [STARTDATE, ENDDATE], 0);
    let assertedDates = getAssertedDates(AGE_GROUPS, [STARTDATE, ENDDATE], 0);
    let diseasesData = getDiseasesData(AGE_GROUPS, [STARTDATE, ENDDATE], 2300);
    let encountersData = getEncountersData(AGE_GROUPS, [STARTDATE, ENDDATE], 0);
    let encounterTypesData = getEncounterTypesData(AGE_GROUPS, [STARTDATE, ENDDATE], 0);

    return [
        {
            title: "Gender",
            id: 0,
            type: PIE,
            data: genderData,
            modifiedData: genderData,
            getData: getGenderData,
        },
        {
            title: "Age",
            id: 1,
            type: BAR,
            data: ageData,
            modifiedData: ageData,
            getData: getAgeData,
        },
        {
            title: "Asserted Dates",
            id: 2,
            type: LINE,
            data: assertedDates,
            modifiedData: assertedDates,
            getData: getAssertedDates,
        },
        {
            title: "Diseases",
            id: 5,
            type: PIE,
            data: diseasesData,
            modifiedData: diseasesData,
            getData: getDiseasesData,
        },
        {
            title: "Encounters",
            id: 3,
            type: LINE,
            data: encountersData,
            modifiedData: encountersData,
            getData: getEncountersData,
        },
        {
            title: "Encounter Types",
            id: 4,
            type: PIE,
            data: encounterTypesData,
            modifiedData: encounterTypesData,
            getData: getEncounterTypesData,
        }
    ];
}

const getPatientById = (id) => {
    return patients.find(patient => patient.id === id)
}

export function getGenderData(ageGroups, timeSpan, threshold) {

    /*let female = (await queryDataFromPatientsDB({gender: FEMALE, ageGroups: ageGroups})).length;
    let male = (await queryDataFromPatientsDB({gender: MALE, ageGroups: ageGroups})).length;*/

    return {
        labels: [
            'Männlich',
            'Weiblich',
        ],
        datasets: [{
            data: [
                patients.filter(p => p.gender === MALE && ageGroups.includes(p.ageGroup)).length,
                patients.filter(p => p.gender === FEMALE && ageGroups.includes(p.ageGroup)).length,
            ]
        }],
        // TODO: Adjust for divers and unknown

    }
}

export function getAgeData(ageGroups, timeSpan, threshold) {

    const getPatientCount = function (ageGroup, gender) {
        if (gender) return patients.filter(p => p.ageGroup === ageGroup && p.gender === gender).length;
        return patients.filter(p => p.ageGroup === ageGroup).length;
    }

    const getDataset = (gender) =>
        ageGroups.map(ageGroup => getPatientCount(ageGroup, gender));

    return {
        labels: ageGroups,
        datasets: [
            {
                label: 'Gesamt',
                data: getDataset()
                /* Bsp:
                * 0: 3
                * 1: 0
                * 2: 1
                * 3: 4
                * ...
                */
            },
            {
                label: 'Männlich',
                data: getDataset(MALE)
            },
            {
                label: 'Weiblich',
                data: getDataset(FEMALE)
            },
        ]
    }
}

const getAssertedDates = (ageGroups, timeSpan, threshold) => {

    const getDataset = () => {

        // filter
        let filteredConditions = conditions.filter(c => c.assertedDate >= timeSpan[0] && c.assertedDate <= timeSpan[1]);

        // sort by Date
        let sortedConditions = filteredConditions.sort((a, b) => a.assertedDate - b.assertedDate);

        const dates = initDates(timeSpan);

        sortedConditions.forEach(condition => {
            const assertedDate = moment(condition.assertedDate).format('DD.MM.YY');

            if (dates[assertedDate]) {
                dates[assertedDate]++;
            } else {
                dates[assertedDate] = 1;
            }
        });

        return dates;
    }


    return {
        datasets: [
            {
                label: 'Assertions',
                data: getDataset()
                /* Bsp:
                * 0: 3
                * 1: 0
                * 2: 1
                * 3: 4
                * ...
                */
            }
        ]
    }
}

export function getEncountersData(ageGroups, timeSpan, threshold) {

    const getDataset = () => {
        // filter
        let filteredEncounters = encounters.filter(encounter => ageGroups.includes(getPatientById(encounter.patientID).ageGroup));
        filteredEncounters = filteredEncounters.filter(encounter => encounter.periodStart >= timeSpan[0] && encounter.periodStart <= timeSpan[1]);

        // sort by Date
        let sortedEncounters = filteredEncounters.sort((a, b) => a.periodStart - b.periodStart);

        const dates = initDates(timeSpan);

        sortedEncounters.forEach(e => {
            const startDate = moment(e.periodStart).format('DD.MM.YY');

            if (dates[startDate]) {
                dates[startDate]++;
            } else {
                dates[startDate] = 1;
            }
        });

        return dates;

    }

    return {
        datasets: [
            {
                label: 'Encounters',
                data: getDataset()
            }
        ]
    }
}

function getEncounterTypesData(ageGroups, timeSpan, threshold) {

    // filter
    let filteredEncounters = encounters.filter(encounter => ageGroups.includes(getPatientById(encounter.patientID).ageGroup));
    filteredEncounters = filteredEncounters.filter(encounter => encounter.periodStart >= timeSpan[0] && encounter.periodStart <= timeSpan[1]);

    const getDataset = () => {
        let data = {};

        filteredEncounters.forEach(c => {
            if (!data[c.actCodeDisplay]) {
                data[c.actCodeDisplay] = 0;
            }
            data[c.actCodeDisplay]++;
        });

        return data;
    }

    let data = getDataset();


    return {
        labels: Object.keys(data),
        datasets: [{
            data: [
                Object.values(data),
            ]
        }],
    }
}


function getDiseasesData(ageGroups, timeSpan, threshold) {

    let filteredConditions = conditions.filter(c => ageGroups.includes(getPatientById(c.patientID).ageGroup));
    filteredConditions = filteredConditions.filter(c => c.assertedDate >= timeSpan[0] && c.assertedDate <= timeSpan[1]);


    const getDataset = () => {
        let data = {};

        filteredConditions.forEach(c => {
            if (!data[c.code]) {
                data[c.code] = 0;
            }
            data[c.code]++;
        });

        // Filter by threshold
        const filteredKeys = Object.keys(data).filter(key => data[key] > threshold);
        const thresholdData = Object.fromEntries(filteredKeys.map(key => [key, data[key]]));
        // Sort by value
        const entries = Object.entries(thresholdData).sort(([, a], [, b]) => b - a);
        return Object.fromEntries(entries);
    }

    let data = getDataset();

    return {
        labels: Object.keys(data),
        datasets: [{
            data: [
                ...Object.values(data),
            ]
        }],
    }
}


function initDates(timeSpan) {
    const d = {};
    let days = Math.round((timeSpan[1] - timeSpan[0]) / (1000 * 60 * 60 * 24));


    for (let i = 0; i < days; i++) {
        let date = new Date(timeSpan[0]);
        date.setDate(date.getDate() + i);
        let dateString = moment(date).format('DD.MM.YY');
        d[dateString] = 0;
    }
    return d;
}