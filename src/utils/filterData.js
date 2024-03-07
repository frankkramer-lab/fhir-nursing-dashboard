import {AGE_GROUPS, BAR, ENDDATE, FEMALE, LINE, MALE, PIE, STARTDATE} from "./constants";
import moment from "moment";
import {getAllDataFromDB} from "./db";


let patients;
let conditions;
let encounters;

export async function initCharts() {

    patients = await getAllDataFromDB('patients');
    conditions = await getAllDataFromDB('conditions');
    encounters = await getAllDataFromDB('encounters');


    // All functions need to take the arguments: ageGroups,

    let genderData = getGenderData(AGE_GROUPS);
    let ageData = getAgeData(AGE_GROUPS);
    let assertedDates = getAssertedDates(AGE_GROUPS);
    let encountersData = getEncountersData(AGE_GROUPS);



    console.log({
        title: "Encounters",
        type: LINE,
        data: encountersData,
        modifiedData: encountersData,
    })

    return [
        {
            title: "Gender",
            type: PIE,
            data: genderData,
            modifiedData: genderData,
            getData: getGenderData,
        },
        {
            title: "Age",
            type: BAR,
            data: ageData,
            modifiedData: ageData,
            getData: getAgeData,
        },
        {
            title: "Asserted Dates",
            type: LINE,
            data: assertedDates,
            modifiedData: assertedDates,
            getData: getAssertedDates,
        },
        {
            title: "Encounters",
            type: LINE,
            data: encountersData,
            modifiedData: encountersData,
            getData: getEncountersData,
        },
    ];
}

const getPatientById = (id) => {
    return patients.find(patient => patient.id === id)
}

export function getGenderData(ageGroups) {

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

export function getAgeData(ageGroups) {

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

const getAssertedDates = (ageGroups) => {

    const getDataset = () => {

        let sortedConditions = conditions.sort((a, b) => a.assertedDate - b.assertedDate);

        const dates = initDates();

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

export function getEncountersData(ageGroups) {

    const getDataset = () => {
        // filter by Age Groups
        let filteredEncounters = encounters.filter(encounter => ageGroups.includes(getPatientById(encounter.patientID).ageGroup));

        // sort by Date
        let sortedEncounters = filteredEncounters.sort((a, b) => a.periodStart - b.periodStart);

        const dates = initDates();

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


function initDates(){
    const dates = {};
    let days = Math.round((ENDDATE - STARTDATE) / (1000 * 60 * 60 * 24));


    for(let i = 0; i < days; i++) {
        let date = new Date(STARTDATE);
        date.setDate(date.getDate() + i);
        let dateString = moment(date).format('DD.MM.YY');
        dates[dateString] = 0;
    }
    return dates;
}