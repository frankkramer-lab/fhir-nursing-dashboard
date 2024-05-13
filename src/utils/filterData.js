import {
    AGE_GROUPS,
    BAR,
    ENDDATE,
    FEMALE,
    GENDERS,
    LINE,
    MALE,
    NUMBER,
    PIE,
    STARTDATE,
    LOGINDIVIDUALPROCESSORTIMES
} from "./constants";
import {getDaysToMonths, getProcedureKeys, setProcedureKeys} from "./globalVars";
import moment from "moment";
import {getAllDataFromDB} from "./db";


// Global variables to store the data
// This is a workaround to avoid loading the data multiple times
// The data is loaded once and then stored in these variables

// General data
let [patients, conditions, encounters, stationEncounters, procedures] = [null, null, null, null, null];

// Station specific data
let [stationPatients, stationConditions, selectedStationEncounters, stationProcedures] = [null, null, null, null];

const stationProceduresStorage = {};
const stationPatientsStorage = {};
const stationConditionsStorage = {};
const selectedStationEncountersStorage = {};

export async function initCharts(updateProgress, stationID = null) {

    console.time("get from db");
    if (!patients || !conditions || !encounters || !stationEncounters || !procedures) {
        [patients, conditions, encounters, stationEncounters, procedures] = await Promise.all([
            getAllDataFromDB('patients'),
            getAllDataFromDB('conditions'),
            getAllDataFromDB('encounters'),
            getAllDataFromDB('stationEncounters'),
            getAllDataFromDB('procedures')
        ]);
    }
    console.timeEnd("get from db");


    if (stationID) {
        console.time("get station data");
        [stationPatients, selectedStationEncounters, stationConditions, stationProcedures] = await Promise.all([
            getStationPatients(patients, stationEncounters, stationID),
            getStationEncounters(stationEncounters, stationID),
            getStationConditions(conditions, stationEncounters, stationID),
            getStationProcedures(procedures, stationEncounters, stationID)
        ])
        console.timeEnd("get station data")
    }

    if (stationID) {
        console.time("get procedure keys");
        let keys = new Set();
        stationProcedures.filter(p => p.categoryCode === "9632001").forEach(p => keys.add(p.display));
        let keysArray = Array.from(keys);
        keysArray.sort();
        setProcedureKeys(keysArray);
        console.timeEnd("get procedure keys");
    }


    // All functions need to take the arguments: ageGroups, timeSpan

    console.time("init processors");
    if (LOGINDIVIDUALPROCESSORTIMES) console.time("init gender processor")
    let genderDataProcessor = new GenderDataProcessor(patients, conditions, encounters, stationEncounters, procedures, AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    if (genderDataProcessor) genderDataProcessor.initialize();
    if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init gender processor");
    if (LOGINDIVIDUALPROCESSORTIMES) console.time("init age processor")
    let ageDataProcessor = new AgeDataProcessor(patients, conditions, encounters, stationEncounters, procedures, AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    if (ageDataProcessor) ageDataProcessor.initialize();
    if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init age processor");
    /*console.time("init asserted dates processor")
    let assertedDatesProcessor = new AssertedDatesDataProcessor(patients, conditions, encounters, stationEncounters, procedures, AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    assertedDatesProcessor.initialize();
    console.timeEnd("init asserted dates processor")*/
    if (LOGINDIVIDUALPROCESSORTIMES) console.time("init diseases processor")
    // Removed from global Charts (> loading time)
    let diseasesDataProcessor = stationID === null ? null : new DiseaseDataProcessor(patients, conditions, encounters, stationEncounters, procedures, AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, (stationID === null ? 2300 : 500), stationID);
    if (diseasesDataProcessor) diseasesDataProcessor.initialize();
    if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init diseases processor")
    if (LOGINDIVIDUALPROCESSORTIMES) console.time("init admission processor")
    let admissionDataProcessor = new AdmissionDatesDataProcessor(patients, conditions, encounters, stationEncounters, procedures, AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    if (admissionDataProcessor) admissionDataProcessor.initialize();
    if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init admission processor")
    if (LOGINDIVIDUALPROCESSORTIMES) console.time("init dismission processor")
    let dismissionDataProcessor = new DismissionDatesDataProcessor(patients, conditions, encounters, stationEncounters, procedures, AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    if (dismissionDataProcessor) dismissionDataProcessor.initialize();
    if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init dismission processor")
    if (LOGINDIVIDUALPROCESSORTIMES) console.time("init encounter types processor")
    let encounterTypesDataProcessor = new EncounterTypesDataProcessor(patients, conditions, encounters, stationEncounters, procedures, AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID);
    if (encounterTypesDataProcessor) encounterTypesDataProcessor.initialize();
    if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init encounter types processor")
    if (LOGINDIVIDUALPROCESSORTIMES) console.time("init length of stay processor")
    let lengthOfStayDataProcessor = new LengthOfStayDataProcessor(patients, conditions, encounters, stationEncounters, procedures, AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 14, stationID);
    if (lengthOfStayDataProcessor) lengthOfStayDataProcessor.initialize();
    if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init length of stay processor")
    if (LOGINDIVIDUALPROCESSORTIMES) console.time("init procedures processor")
    let proceduresDataProcessor = stationID === null ? null : new ProceduresDataProcessor(patients, conditions, encounters, stationEncounters, procedures, AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 14, stationID);
    if (proceduresDataProcessor) proceduresDataProcessor.initialize();
    if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init procedures processor")
    if (LOGINDIVIDUALPROCESSORTIMES) console.time("init individual procedures processor")
    let individualProceduresProcessor = stationID === null ? null : new IndividualProceduresDataProcessor(patients, conditions, encounters, stationEncounters, procedures, AGE_GROUPS, [STARTDATE, ENDDATE], GENDERS, 0, stationID, getProcedureKeys()[0]);
    if (individualProceduresProcessor) individualProceduresProcessor.initialize();
    if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init individual procedures processor")

    console.timeEnd("init processors");


    return [
        {
            title: "Gender", // Title of the chart
            id: 0, // Unique ID
            type: PIE, // Chart type
            showAt: [0, 1], // Tab index where the chart should be shown (0 = global, 1 = station)
            p: genderDataProcessor, // Processor
        },
        {
            title: "Age",
            id: 1,
            type: BAR,
            showAt: [0, 1],
            p: ageDataProcessor,
        },
        /*{
            title: "Condition Records",
            id: 2,
            type: LINE,
            showAt: [0, 1],
            p: assertedDatesProcessor
        },*/
        {
            title: "Admission Dates",
            id: 3,
            type: LINE,
            showAt: [0, 1],
            p: admissionDataProcessor,
        },
        {
            title: "Diseases",
            id: 5,
            type: PIE,
            showAt: [1],
            p: diseasesDataProcessor,
        },
        {
            title: "Encounter Types",
            id: 4,
            type: PIE,
            showAt: [0, 1],
            p: encounterTypesDataProcessor,
        },
        {
            title: "Dismission Dates",
            id: 6,
            type: LINE,
            showAt: [0, 1],
            p: dismissionDataProcessor,
        },
        {
            title: "Average Length of Stay",
            id: 7,
            type: NUMBER,
            showAt: [0, 1],
            p: lengthOfStayDataProcessor,
        },
        {
            title: "Individual Procedures",
            id: 9,
            type: LINE,
            showAt: [1],
            p: individualProceduresProcessor,
        },
        {
            title: "Procedures per Day",
            id: 8,
            type: NUMBER,
            showAt: [1],
            p: proceduresDataProcessor,
        },

    ];
}


export class DataProcessor {
    constructor(patients, conditions, encounters, stationEncounters, procedures, ageGroups, timeSpan, genders, threshold, stationID) {
        this.patients = patients;
        this.conditions = conditions;
        this.encounters = encounters;
        this.stationEncounters = stationEncounters;
        this.procedures = procedures;
        if (stationID) {
            this.patients = stationPatients;
            this.encounters = selectedStationEncounters;
            this.conditions = stationConditions;
            this.procedures = stationProcedures;
        }
        this.ageGroups = ageGroups;
        this.timeSpan = timeSpan;
        this.genders = genders;
        this.threshold = threshold;
        this.stationID = stationID;
    }

    initialize() {
        this.data = this.process();
    }

    process() {
        throw new Error("Method 'getData' must be implemented.");
    }
}

class GenderDataProcessor extends DataProcessor {
    process() {
        let filteredPatients = filterPatients(this.patients, this.ageGroups, this.timeSpan, this.genders, this.stationID);

        return {
            labels: [
                'Männlich',
                'Weiblich',
            ],
            datasets: [{
                data: [
                    filteredPatients.filter(p => p.gender === MALE).length,
                    filteredPatients.filter(p => p.gender === FEMALE).length,
                ],
                details: ['Male', 'Female']
            }],
            // TODO: Adjust for divers and unknown

        }
    }
}

class AgeDataProcessor extends DataProcessor {
    process() {
        let filteredPatients = filterPatients(this.patients, this.ageGroups, this.timeSpan, this.genders, this.stationID);

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
            let filteredConditions = filterConditions(this.conditions, this.patients, this.ageGroups, this.timeSpan, this.genders, this.stationID);

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
            let filteredEncounters = filterEncounters(this.encounters, this.patients, this.ageGroups, this.timeSpan, false, this.genders, this.stationID);

            // sort by Date
            let sortedEncounters = filteredEncounters.sort((a, b) => a.periodStart - b.periodStart);

            const dates = initDates(this.timeSpan);

            sortedEncounters.forEach(e => {
                let startDate = formatDaysToMonthText(this.timeSpan, e.periodStart);
                dates[startDate] = (dates[startDate] || 0) + 1;
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
            let filteredEncounters = filterEncounters(this.encounters, this.patients, this.ageGroups, this.timeSpan, true, this.genders, this.stationID);

            // sort by Date
            let sortedEncounters = filteredEncounters.sort((a, b) => a.periodEnd - b.periodEnd);

            const dates = initDates(this.timeSpan);

            sortedEncounters.forEach(e => {
                let endDate = formatDaysToMonthText(this.timeSpan, e.periodEnd);
                dates[endDate] = (dates[endDate] || 0) + 1;
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
        let filteredEncounters = filterEncounters(this.encounters, this.patients, this.ageGroups, this.timeSpan, false, this.genders, this.stationID)

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
        let filteredConditions = filterConditions(this.conditions, this.patients, this.ageGroups, this.timeSpan, this.genders, this.stationID)
        let details = {};

        const getDataset = () => {
            let data = {};

            filteredConditions.forEach(c => {
                if (!data[c.code]) {
                    data[c.code] = 0;
                    details[c.code] = c.display;
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
                data: Object.values(data),
                details: Object.keys(data).map(key => key + ": " + details[key])
            }],
        }
    }
}


class LengthOfStayDataProcessor extends DataProcessor {
    process() {
        let filteredEncounters = filterEncounters(this.encounters, this.patients, this.ageGroups, this.timeSpan, false, this.genders, this.stationID)

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

class ProceduresDataProcessor extends DataProcessor {
    process() {
        let filteredProcedures = filterProcedures(this.procedures, this.patients, this.ageGroups, this.timeSpan, this.genders)
        /*const getDataset = () => {
            // sort by Date
            let sortedProcedures = filteredProcedures.sort((a, b) => a.performedDateTime - b.performedDateTime);

            const dates = initDates(this.timeSpan);

            sortedProcedures.forEach(p => {
                let date = formatDaysToMonthText(this.timeSpan, p.performedDateTime);
                dates[date] = (dates[date] || 0) + 1;
            });

            return dates;
        }

        return {
            datasets: [
                {
                    label: 'Procedures',
                    data: getDataset()
                }
            ]
        }*/

        return {
            number: filteredProcedures.length / (moment(this.timeSpan[1]).diff(moment(this.timeSpan[0]), 'days')),
            unit: ''
        }

    }
}

class IndividualProceduresDataProcessor extends DataProcessor {

    constructor(patients, conditions, encounters, stationEncounters, procedures, ageGroups, timeSpan, genders, threshold, stationID, procedureKey) {
        super(patients, conditions, encounters, stationEncounters, procedures, ageGroups, timeSpan, genders, threshold, stationID);
        this.procedureKey = procedureKey;
    }

    process() {
        // Only Nursing Procedures
        let filteredProcedures = this.procedures.filter(p => p.categoryCode === "9632001");
        // Filter by procedureKey
        filteredProcedures = filteredProcedures.filter(p => p.display === this.procedureKey); // Can be changed to a code if database completed
        // Standard filter
        filteredProcedures = filterProcedures(filteredProcedures, this.patients, this.ageGroups, this.timeSpan, this.genders)

        const getDataset = () => {
            // sort by Date
            let sortedProcedures = filteredProcedures.sort((a, b) => a.performedDateTime - b.performedDateTime);

            const dates = initDates(this.timeSpan);

            sortedProcedures.forEach(p => {
                let date = formatDaysToMonthText(this.timeSpan, p.performedDateTime);
                dates[date] = (dates[date] || 0) + 1;
            });

            return dates;
        }

        return {
            datasets: [
                {
                    label: this.procedureKey,
                    data: getDataset()
                }
            ]
        }
    }
}

const getPatientById = (patients, id) => {
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


const filterPatients = (patients, ageGroups, timespan, genders) => {
    let filteredPatients = patients.filter(p => (ageGroups.includes(p.ageGroup) && genders.includes(p.gender)));
    return filteredPatients;
}


const filterConditions = (conditions, patients, ageGroups, timespan, genders) => {
    let filteredConditions = conditions.filter(c => c.assertedDate >= timespan[0] && c.assertedDate <= timespan[1]);
    filteredConditions = filteredConditions.filter(c => {
        const patient = getPatientById(patients, c.patientID);
        return ageGroups.includes(patient.ageGroup) && genders.includes(patient.gender);
    });

    return filteredConditions;
}


const filterEncounters = (encounters, patients, ageGroups, timespan, enddate, genders) => {
    let filteredEncounters;
    if (enddate) {
        filteredEncounters = encounters.filter(e => e.periodEnd >= timespan[0] && e.periodEnd <= timespan[1])
    } else {
        filteredEncounters = encounters.filter(e => e.periodStart >= timespan[0] && e.periodStart <= timespan[1])

    }
    filteredEncounters = filteredEncounters.filter(e => {
        const patient = getPatientById(patients, e.patientID);
        return ageGroups.includes(patient.ageGroup) && genders.includes(patient.gender)
    });
    return filteredEncounters;
}

const filterProcedures = (procedures, patients, ageGroups, timespan, genders) => {
    let filteredProcedures = procedures.filter(p => p.performedDateTime >= timespan[0] && p.performedDateTime <= timespan[1]);
    filteredProcedures = filteredProcedures.filter(p => {
        const patient = getPatientById(patients, p.patientID);
        return ageGroups.includes(patient.ageGroup) && genders.includes(patient.gender);
    });
    return filteredProcedures;
}

async function getStationPatients(patients, stationEncounters, stationId) {
    if (stationPatientsStorage.hasOwnProperty(stationId)) return stationPatientsStorage[stationId];
    const patientIdsOnStation = stationEncounters
        .filter(e => e.station === stationId)
        .map(e => e.patientID);
    stationPatientsStorage[stationId] = patients.filter(p => patientIdsOnStation.includes(p.id));
    return stationPatientsStorage[stationId];
}

async function getStationConditions(conditions, stationEncounters, stationId) {
    if (stationConditionsStorage.hasOwnProperty(stationId)) return stationConditionsStorage[stationId];

    const patientIdsOnStation = stationEncounters
        .filter(e => e.station === stationId)
        .map(e => e.patientID);
    stationConditionsStorage[stationId] = conditions.filter(c => patientIdsOnStation.includes(c.patientID));
    return stationConditionsStorage[stationId];
}

async function getStationEncounters(stationEncounters, StationId) {
    selectedStationEncountersStorage[StationId] = stationEncounters.filter(e => e.station === StationId);
    return selectedStationEncountersStorage[StationId];
}

async function getStationProcedures(procedures, stationEncounters, stationId) {
    // get all encounters on the station
    if (stationProceduresStorage.hasOwnProperty(stationId)) return stationProceduresStorage[stationId];

    const patientEncountersOnStation = stationEncounters.filter(e => e.station === stationId);

    const StationProcedures = procedures.filter(procedure => {
        // get the encounter of the patient
        const patientEncounter = patientEncountersOnStation.find(e => e.patientID === procedure.patientID);
        // check if the procedure was performed during the encounter
        return (patientEncounter !== undefined) && procedure.performedDateTime >= patientEncounter.periodStart && procedure.performedDateTime <= patientEncounter.periodEnd;
    });

    stationProceduresStorage[stationId] = StationProcedures;
    return StationProcedures;
}

function formatDaysToMonthText(timeSpan, date) {
    if (moment(timeSpan[1]).diff(moment(timeSpan[0]), 'months', true) > getDaysToMonths()) {
        return moment(date).format('MMM YY');
    } else {
        return moment(date).format('DD.MM.YY');
    }
}
