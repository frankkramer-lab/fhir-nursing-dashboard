import {AGE_GROUPS, BAR, FEMALE, MALE, PIE} from "./constants";


let patients;
let conditions;
export const initCharts = (data) => {
    patients = data.patients;
    conditions = data.conditions;

    let genderData = getGenderData(AGE_GROUPS);
    let ageData = getAgeData(AGE_GROUPS);

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
    ];
}

export const getGenderData = (ageGroups) => {
    return {
        labels: [
            'Männlich',
            'Weiblich',
        ],
        datasets: [{
            data: [
                // TODO: Adjust for divers and unknown
                patients.filter(p => p.gender === MALE && ageGroups.includes(p.ageGroup)).length,
                patients.filter(p => p.gender === FEMALE && ageGroups.includes(p.ageGroup)).length,
            ],
        }]
    }
}

export const getAgeData = (ageGroups) => {

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

