import {AGE_GROUPS, BAR, ENDDATE, FEMALE, GENDERS, LINE, MALE, NUMBER, PIE, STARTDATE} from "./constants";
import {getDaysToMonths} from "./globalVars";
import moment from "moment";
import {getAllDataFromDB} from "./db";


let patients;
let conditions;
let encounters;
let stationEncounters;
let stationPatients;

export async function initCharts(updateProgress, stationID = null) {

    patients = await getAllDataFromDB('patients');
    conditions = await getAllDataFromDB('conditions');
    encounters = await getAllDataFromDB('encounters');
    stationEncounters = await getAllDataFromDB('stationEncounters');
    if (stationID) {
        patients = getStationPatients(stationID);
        console.log(patients)
        encounters = getStationEncounters(stationID)
        console.log(encounters)
        conditions = getStationConditions(stationID);
        console.log(conditions)
    }
    updateProgress(10);

    // All functions need to take the arguments: ageGroups, timeSpan

    let genderDataProcessor = new GenderDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    updateProgress(20);
    let ageDataProcessor = new AgeDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    updateProgress(30);
    let assertedDatesProcessor = new AssertedDatesDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    updateProgress(40);
    let diseasesDataProcessor = new DiseaseDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 2300, stationID);
    updateProgress(50);
    let admissionDataProcessor = new AdmissionDatesDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    updateProgress(60);
    let dismissionDataProcessor = new DismissionDatesDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    updateProgress(70);
    let encounterTypesDataProcessor = new EncounterTypesDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    updateProgress(80);
    let lengthOfStayDataProcessor = new LengthOfStayDataProcessor(AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 14, stationID);
    updateProgress(90);

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
    constructor(ageGroups, timeSpan, genders, threshold, stationID) {
        this.ageGroups = ageGroups;
        this.timeSpan = timeSpan;
        this.genders = genders;
        this.threshold = threshold;
        this.stationID = stationID;
        this.data = this.process();
    }

    process() {
        throw new Error("Method 'process' must be implemented.");
    }
}

class GenderDataProcessor extends DataProcessor {
    process() {
        let filteredPatients = filterPatients(this.ageGroups, this.timeSpan, this.genders, this.stationID);

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
        let filteredPatients = filterPatients(this.ageGroups, this.timeSpan, this.genders, this.stationID);

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
            let filteredConditions = filterConditions(this.ageGroups, this.timeSpan, this.genders, this.stationID);

            // sort by Date
            let sortedConditions = filteredConditions.sort((a, b) => a.assertedDate - b.assertedDate);

            const dates = initDates(this.timeSpan);

            sortedConditions.forEach(condition => {
                let assertedDate;
                if (moment(this.timeSpan[1]).diff(moment(this.timeSpan[0]), 'months', true) > getDaysToMonths()) {
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
            let filteredEncounters = filterEncounters(this.ageGroups, this.timeSpan, false, this.genders, this.stationID);

            // sort by Date
            let sortedEncounters = filteredEncounters.sort((a, b) => a.periodStart - b.periodStart);

            const dates = initDates(this.timeSpan);

            sortedEncounters.forEach(e => {
                let startDate;
                if (moment(this.timeSpan[1]).diff(moment(this.timeSpan[0]), 'months', true) > getDaysToMonths()) {
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
            let filteredEncounters = filterEncounters(this.ageGroups, this.timeSpan, true, this.genders, this.stationID);

            // sort by Date
            let sortedEncounters = filteredEncounters.sort((a, b) => a.periodEnd - b.periodEnd);

            const dates = initDates(this.timeSpan);

            sortedEncounters.forEach(e => {
                let endDate;
                if (moment(this.timeSpan[1]).diff(moment(this.timeSpan[0]), 'months', true) > getDaysToMonths()) {
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
        let filteredEncounters = filterEncounters(this.ageGroups, this.timeSpan, false, this.genders, this.stationID)

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
        let filteredConditions = filterConditions(this.ageGroups, this.timeSpan, this.genders, this.stationID)

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
        let filteredEncounters = filterEncounters(this.ageGroups, this.timeSpan, false, this.genders, this.stationID)

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
        if (moment(timeSpan[1]).diff(moment(timeSpan[0]), 'months', true) > getDaysToMonths()) {
            dateString = moment(date).format('MMM YY');
        } else {
            dateString = moment(date).format('DD.MM.YY');
        }
        d[dateString] = 0;
    }
    return d;
}


const filterPatients = (ageGroups, timespan, genders, stationID) => {


    let filteredPatients = patients.filter(p => ageGroups.includes(p.ageGroup));
    filteredPatients = filteredPatients.filter(p => genders.includes(p.gender));

    return filteredPatients;
}


const filterConditions = (ageGroups, timespan, genders, stationID) => {
    let filteredConditions = conditions.filter(c => c.assertedDate >= timespan[0] && c.assertedDate <= timespan[1])
    filteredConditions = filteredConditions.filter(c => ageGroups.includes(getPatientById(c.patientID).ageGroup));
    filteredConditions = filteredConditions.filter(c => {
        return genders.includes(getPatientById(c.patientID).gender)
    });
    return filteredConditions;
}


const filterEncounters = (ageGroups, timespan, enddate, genders, stationID) => {
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

function getStationPatients(stationId) {
    const patientIdsOnStation = stationEncounters
        .filter(e => e.station === stationId)
        .map(e => e.patientID);


    return patients.filter(p => patientIdsOnStation.includes(p.id));
}

function getStationConditions(stationId) {
    const patientIdsOnStation = stationEncounters
        .filter(e => e.station === stationId)
        .map(e => e.patientID);


    return conditions.filter(c => patientIdsOnStation.includes(c.patientID));
}

function getStationEncounters(StationId) {
    return stationEncounters.filter(e => e.station === StationId);
}
