import {AGE_GROUPS, BAR, FEMALE, LINE, MALE, PIE} from "./constants";
import moment from "moment";
import {getAllDataFromDB, queryDataFromConditionsDB, queryDataFromPatientsDB} from "./db";


let patients;
let conditions;
let encounters;

export async function initCharts() {

    patients = await getAllDataFromDB('patients');
    conditions = await getAllDataFromDB('conditions');
    encounters = await getAllDataFromDB('encounters');


    // patients = data.patients;
    // conditions = data.conditions;

    let genderData = getGenderData(AGE_GROUPS);
    let ageData = getAgeData(AGE_GROUPS);
    let assertedDates = getAssertedDates(AGE_GROUPS);


    return [
        {
            title: "Gender",
            type: PIE,
            data: genderData,
            modifiedData: genderData,
        },
        {
            title: "Age",
            type: BAR,
            data: ageData,
            modifiedData: ageData,
        },
        {
            title: "Asserted Dates",
            type: LINE,
            data: assertedDates,
            modifiedData: assertedDates,
        }
    ];
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

const getAssertedDates = () => {

    const getDataset = () => {

        let sortedConditions = conditions.sort((a, b) => a.assertedDate - b.assertedDate);

        const dates = {};

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


