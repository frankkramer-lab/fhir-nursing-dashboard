import react from 'react';
import {
    AGEGROUP0_9, AGEGROUP100,
    AGEGROUP10_19,
    AGEGROUP20_29,
    AGEGROUP30_39,
    AGEGROUP40_49,
    AGEGROUP50_59, AGEGROUP60_69, AGEGROUP70_79, AGEGROUP80_89, AGEGROUP90_99,
    BAR,
    charts05, FEMALE, MALE,
    PIE
} from "./constants";

export const initCharts = (data) => {
    const patients = data.patients;
    const conditions = data.conditions;

    let genderData = getGenderData(patients);
    let ageData = getAgeData(patients);

    const charts = [
        {
            title: "Geschlecht",
            type: PIE,
            data: genderData,
            modifiedData: genderData,
        },
        {
            title: "Alter",
            type: BAR,
            data: ageData,
            modifiedData: ageData,
        },
    ];

    return charts;
}

const getGenderData = (patients) => {
    return {
        labels: [
            'Männlich',
            'Weiblich',
        ],
        datasets: [{
            data: [
                // TODO: Adjust for divers and unknown
                patients.filter(p => p.gender === 'male').length,
                patients.filter(p => p.gender === 'female').length,
            ],
        }]
    }
}

const getAgeData = (patients) => {

    const ageGroups = [AGEGROUP0_9, AGEGROUP10_19, AGEGROUP20_29, AGEGROUP30_39, AGEGROUP40_49, AGEGROUP50_59, AGEGROUP60_69, AGEGROUP70_79, AGEGROUP80_89, AGEGROUP90_99, AGEGROUP100];

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

