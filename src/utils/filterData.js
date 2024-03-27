import {AGE_GROUPS, BAR, ENDDATE, FEMALE, GENDERS, LINE, MALE, NUMBER, PIE, STARTDATE} from "./constants";
import moment from "moment";
import {getAllDataFromDB} from "./db";

const daysToMonths = 3.2;

let patients;
let conditions;
let encounters;

export async function initCharts() {

    patients = await getAllDataFromDB('patients');
    conditions = await getAllDataFromDB('conditions');
    encounters = await getAllDataFromDB('encounters');


    // All functions need to take the arguments: ageGroups, timeSpan

    let genderDataProcessor = new GenderDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0);
    let ageDataProcessor = new AgeDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0);
    let assertedDatesProcessor = new AssertedDatesDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0);
    let diseasesDataProcessor = new DiseaseDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 2300);
    let admissionDataProcessor = new AdmissionDatesDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0);
    let dismissionDataProcessor = new DismissionDatesDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0);
    let encounterTypesDataProcessor = new EncounterTypesDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0);
    let lengthOfStayDataProcessor = new LengthOfStayDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 14);

    return [
        {
            title: "Gender",
            id: 0,
            type: PIE,
            p: genderDataProcessor,
        },
        {
            title: "Age",
            id: 1,
            type: BAR,
            p: ageDataProcessor,
        },
        {
            title: "Condition Records",
            id: 2,
            type: LINE,
            p: assertedDatesProcessor
        },
        {
            title: "Diseases",
            id: 5,
            type: PIE,
            p: diseasesDataProcessor,
        },
        {
            title: "Admission Dates",
            id: 3,
            type: LINE,
            p: admissionDataProcessor,
        },
        {
            title: "Encounter Types",
            id: 4,
            type: PIE,
            p: encounterTypesDataProcessor,
        },
        {
            title: "Dismission Dates",
            id: 6,
            type: LINE,
            p: dismissionDataProcessor,
        },
        {
            title: "Average Length of Stay",
            id: 7,
            type: NUMBER,
            p: lengthOfStayDataProcessor,
        }

    ];
}


export class DataProcessor {
    constructor(ageGroups, timeSpan, genders, threshold) {
        this.ageGroups = ageGroups;
        this.timeSpan = timeSpan;
        this.genders = genders;
        this.threshold = threshold;
        this.data = this.process();
    }

    process() {
        throw new Error("Method 'process' must be implemented.");
    }
}

class GenderDataProcessor extends DataProcessor {
    process() {
        let filteredPatients = filterPatients(this.ageGroups, this.timeSpan, this.genders);

        return {
            labels: [
                'Männlich',
                'Weiblich',
            ],
            datasets: [{
                data: [
                    filteredPatients.filter(p => p.gender === MALE).length,
                    filteredPatients.filter(p => p.gender === FEMALE).length,
                ]
            }],
            // TODO: Adjust for divers and unknown

        }
    }
}

class AgeDataProcessor extends DataProcessor {
    process() {
        let filteredPatients = filterPatients(this.ageGroups, this.timeSpan, this.genders);

        const getPatientCount = function (ageGroup, gender) {
            if (gender) return filteredPatients.filter(p => p.ageGroup === ageGroup && p.gender === gender).length;
            return filteredPatients.filter(p => p.ageGroup === ageGroup).length;
        }

        const getDataset = (gender) =>
            this.ageGroups.map(ageGroup => getPatientCount(ageGroup, gender));

        return {
            labels: this.ageGroups,
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
}

class AssertedDatesDataProcessor extends DataProcessor {
    process() {
        const getDataset = () => {

            // filter
            let filteredConditions = filterConditions(this.ageGroups, this.timeSpan, this.genders);

            // sort by Date
            let sortedConditions = filteredConditions.sort((a, b) => a.assertedDate - b.assertedDate);

            const dates = initDates(this.timeSpan);

            sortedConditions.forEach(condition => {
                let assertedDate;
                if (moment(this.timeSpan[1]).diff(moment(this.timeSpan[0]), 'months', true) > daysToMonths) {
                    assertedDate = moment(condition.assertedDate).format('MMM YY');
                } else {
                    assertedDate = moment(condition.assertedDate).format('DD.MM.YY');
                }

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
}

class AdmissionDatesDataProcessor extends DataProcessor {
    process() {
        const getDataset = () => {
            // filter
            let filteredEncounters = filterEncounters(this.ageGroups, this.timeSpan, false, this.genders);

            // sort by Date
            let sortedEncounters = filteredEncounters.sort((a, b) => a.periodStart - b.periodStart);

            const dates = initDates(this.timeSpan);

            sortedEncounters.forEach(e => {
                let startDate;
                if (moment(this.timeSpan[1]).diff(moment(this.timeSpan[0]), 'months', true) > daysToMonths) {
                    startDate = moment(e.periodStart).format('MMM YY');
                } else {
                    startDate = moment(e.periodStart).format('DD.MM.YY');
                }

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
                    label: 'Admissions',
                    data: getDataset()
                }
            ]
        }
    }
}

class DismissionDatesDataProcessor extends DataProcessor {
    process() {
        const getDataset = () => {
            // filter
            let filteredEncounters = filterEncounters(this.ageGroups, this.timeSpan, true, this.genders);

            // sort by Date
            let sortedEncounters = filteredEncounters.sort((a, b) => a.periodEnd - b.periodEnd);

            const dates = initDates(this.timeSpan);

            sortedEncounters.forEach(e => {
                let endDate;
                if (moment(this.timeSpan[1]).diff(moment(this.timeSpan[0]), 'months', true) > daysToMonths) {
                    endDate = moment(e.periodEnd).format('MMM YY');
                } else {
                    endDate = moment(e.periodEnd).format('DD.MM.YY');
                }

                if (dates[endDate]) {
                    dates[endDate]++;
                } else {
                    dates[endDate] = 1;
                }
            });

            return dates;

        }

        return {
            datasets: [
                {
                    label: 'Dismissions',
                    data: getDataset()
                }
            ]
        }
    }
}



class EncounterTypesDataProcessor extends DataProcessor {
    process() {
        let filteredEncounters = filterEncounters(this.ageGroups, this.timeSpan, false, this.genders)

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
}


class DiseaseDataProcessor extends DataProcessor {
    process() {
        let filteredConditions = filterConditions(this.ageGroups, this.timeSpan, this.genders)
        
        const getDataset = () => {
            let data = {};

            filteredConditions.forEach(c => {
                if (!data[c.code]) {
                    data[c.code] = 0;
                }
                data[c.code]++;
            });

            // Filter by threshold
            const filteredKeys = Object.keys(data).filter(key => data[key] > this.threshold);
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
}


class LengthOfStayDataProcessor extends DataProcessor {
    process() {
        let filteredEncounters = filterEncounters(this.ageGroups, this.timeSpan, false, this.genders)

        // Sum up the days of all encounters
        let sum = filteredEncounters.reduce((accumulator, current) => {
            let days = Math.round((current.periodEnd - current.periodStart) / (1000 * 60 * 60 * 24));
            if (days <= this.threshold) {
                return accumulator + days
            } else {
                return accumulator;
            }
        }, 0);

        // Calculate the average to 2 decimal places
        let avg = (sum / filteredEncounters.length)


        return {
            number: avg,
            unit: ' days'
        }
    }
}

const getPatientById = (id) => {
    return patients.find(patient => patient.id === id)
}

function initDates(timeSpan) {
    const d = {};
    let days = Math.round((timeSpan[1] - timeSpan[0]) / (1000 * 60 * 60 * 24));


    for (let i = 0; i < days; i++) {
        let date = new Date(timeSpan[0]);
        date.setDate(date.getDate() + i);
        let dateString;
        if (moment(timeSpan[1]).diff(moment(timeSpan[0]), 'months', true) > daysToMonths) {
            dateString = moment(date).format('MMM YY');
        } else {
            dateString = moment(date).format('DD.MM.YY');
        }
        d[dateString] = 0;
    }
    return d;
}


const filterPatients = (ageGroups, timespan, genders) => {
    let filteredPatients = patients.filter(p => ageGroups.includes(p.ageGroup));
    filteredPatients = filteredPatients.filter(p => genders.includes(p.gender));

    return filteredPatients;
}


const filterConditions = (ageGroups, timespan, genders) => {
    let filteredConditions = conditions.filter(c => c.assertedDate >= timespan[0] && c.assertedDate <= timespan[1])
    filteredConditions = filteredConditions.filter(c => ageGroups.includes(getPatientById(c.patientID).ageGroup));
    filteredConditions = filteredConditions.filter(c => {
        return genders.includes(getPatientById(c.patientID).gender)
    });
    return filteredConditions;
}


const filterEncounters = (ageGroups, timespan, enddate, genders) => {
    let filteredEncounters;
    if (enddate) {
        filteredEncounters = encounters.filter(e => e.periodEnd >= timespan[0] && e.periodEnd <= timespan[1])
    } else {
        filteredEncounters = encounters.filter(e => e.periodStart >= timespan[0] && e.periodStart <= timespan[1])
    }
    filteredEncounters = filteredEncounters.filter(e => ageGroups.includes(getPatientById(e.patientID).ageGroup));
    filteredEncounters = filteredEncounters.filter(e => genders.includes(getPatientById(e.patientID).gender));
    return filteredEncounters;
}
