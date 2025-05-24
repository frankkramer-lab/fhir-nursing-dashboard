// !!! If the constructor of this class gets changed the constructor of the subclasses overwriting it need to be changed as well (e.g. IndividualProceduresDataProcessor)
import moment from "moment";
import {getDaysToMonths} from "./globalVars";

/**
 * The DataProcessor class is a base class for processing different types of data.
 * It provides a constructor for initializing the data and a method for processing it.
 * The process method must be implemented by subclasses.
 */
export class DataProcessor {
    /**
     * Constructs a new DataProcessor object.
     * @param {Array} patients
     * @param {Array} conditions
     * @param careProblemConditions
     * @param {Array} encounters
     * @param {Array} procedures
     * @param {Array} resp_supp_observations
     * @param {Array} ageGroups - The age groups to consider.
     * @param {Array} timeSpan - The time span to consider.
     * @param {Array} genders - The genders to consider.
     * @param {number} threshold - The threshold for filtering data.
     * @param top_n
     * @param dataset_codes
     */
    constructor(patients, conditions, careProblemConditions, encounters, procedures, resp_supp_observations, ageGroups, timeSpan, genders, threshold, top_n = null, dataset_codes = null) {
        console.log(`Creating Processor ${this.constructor.name}.`);
        console.log(patients, conditions, careProblemConditions, encounters, procedures, resp_supp_observations, ageGroups, timeSpan, genders, threshold, top_n, dataset_codes);

        this.patients = patients;
        this.conditions = conditions;
        this.careProblemConditions = careProblemConditions;
        this.encounters = encounters;
        this.procedures = procedures;
        this.resp_supp_observations = resp_supp_observations;

        this.ageGroups = ageGroups;
        this.genders = genders;
        this.timeSpan = timeSpan;

        this.dataset_codes = dataset_codes;
        // save all dataset codes for modifier options, should not be changed:
        if (dataset_codes) {
            this.all_dataset_codes = dataset_codes;
        }

        this.threshold = threshold;
        this.top_n = top_n;
    }

    /**
     * Initializes the data processor by calling the process method.
     */
    initialize() {
        // console.log(`Initializing processor ${this.constructor.name} and its data.`);

        this.data = this.process();
    }

    /**
     * Processes the data. This method must be implemented by subclasses.
     * @throws {Error} If the method is not implemented by a subclass.
     */
    process() {
        throw new Error("Method 'process' must be implemented.");
    }
}

export class GenderTypeDataProcessor extends DataProcessor {
    process() {
        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_labels = this.genders.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code);

        let filteredPatients = filterPatients(this.patients, age_group_values, this.timeSpan, gender_values);
        // console.log('filtered patients: ', filteredPatients);

        let res_data = [];
        for (const gender of this.genders) {
            res_data.push(filteredPatients.filter(p => p.gender === gender.fhir_code).length);
        }
        // console.log('res data', res_data);

        return {
            labels: gender_labels, datasets: [{
                data: res_data, details: gender_labels,
            }],
        }
    }
}

export class AgeGroupTypeDataProcessor extends DataProcessor {
    process() {
        // console.log('AgeDataProcessor');

        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code);

        let filteredPatients = filterPatients(this.patients, age_group_values, this.timeSpan, gender_values);

        const getPatientCount = function (ageGroup, gender) {
            if (gender) return filteredPatients.filter(p => p.ageGroup === ageGroup && p.gender === gender).length;
            return filteredPatients.filter(p => p.ageGroup === ageGroup).length;
        }

        const getDataset = (gender) => age_group_values.map(ageGroup => getPatientCount(ageGroup, gender));

        // console.log('Creating age gender datasets:');

        let res_datasets = [{
            label: 'Total', data: getDataset()
            /* Bsp:
            * 0: 3
            * 1: 0
            * 2: 1
            * 3: 4
            * ...
            */
        }];
        for (const gender of this.genders) {
            res_datasets.push({
                label: gender.label, data: getDataset(gender.fhir_code),
            })
        }

        return {
            labels: age_group_values, datasets: res_datasets,
        }
    }
}

export class AdmissionDatesTimeDataProcessor extends DataProcessor {
    process() {
        // console.log('AdmissionDatesDataProcessor');

        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code);

        const getDataset = () => {
            let filteredEncounters = filterEncounters(this.encounters, this.patients, age_group_values, this.timeSpan, false, gender_values);
            return calcDatasetPerTime(filteredEncounters, this.timeSpan, 'periodStart');
        }

        const dataset = getDataset();
        // console.log(dataset);

        return {
            datasets: [{
                label: 'Admissions', data: dataset,
            }]
        }
    }
}

export class DischargeDatesTimeDataProcessor extends DataProcessor {
    process() {
        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code);

        const getDataset = () => {
            let filteredEncounters = filterEncounters(this.encounters, this.patients, age_group_values, this.timeSpan, false, gender_values);
            return calcDatasetPerTime(filteredEncounters, this.timeSpan, 'periodEnd');
        }

        return {
            datasets: [{
                label: 'Discharge', data: getDataset()
            }]
        }
    }
}

export class ConditionTypeDataProcessor extends DataProcessor {
    process() {
        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code);
        const dataset_code_values = this.dataset_codes.map(c => c.code);

        const filteredConditions = filterConditions(this.conditions, this.patients, age_group_values, this.timeSpan, gender_values, dataset_code_values);
        // console.log(filteredConditions);

        let data = calcDatasetsForType(filteredConditions, 'display', this.top_n, this.threshold);

        return {
            labels: Object.keys(data), datasets: [{
                data: Object.values(data), details: Object.keys(data)
            }],
        }
    }
}

export class ConditionTypeTimeDataProcessor extends DataProcessor {
    process() {
        console.log('Dataset codes: ', this.dataset_codes);

        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code);
        const condition_code_values = this.dataset_codes.map(c => c.code);

        const filtered_conditions = filterConditions(this.conditions, this.patients, age_group_values, this.timeSpan, gender_values, condition_code_values);

        let datasets = [];

        for (let i = 0; i < this.dataset_codes.length; i++) {
            datasets.push({
                label: this.dataset_codes[i].display,
                data: calcDatasetPerTypeAndTime(filtered_conditions, this.dataset_codes[i].code, this.timeSpan, 'dateTime', this.threshold),
            });
        }

        console.log(datasets);

        return {
            datasets: datasets
        }
    }
}

export class CareProblemConditionTypeDataProcessor extends DataProcessor {
    process() {
        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code);
        const condition_code_values = this.dataset_codes.map(c => c.code)

        const filtered_conditions = filterConditions(this.careProblemConditions, this.patients, age_group_values, this.timeSpan, gender_values, condition_code_values);
        // console.log(filteredConditions);

        let data = calcDatasetsForType(filtered_conditions, 'display', this.top_n, this.threshold);

        return {
            labels: Object.keys(data), datasets: [{
                data: Object.values(data), details: Object.keys(data)
            }],
        }
    }
}

export class CareProblemConditionTypeTimeDataProcessor extends DataProcessor {
    process() {
        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code);
        const condition_code_values = this.dataset_codes.map(c => c.code)

        const filtered_conditions = filterConditions(this.careProblemConditions, this.patients, age_group_values, this.timeSpan, gender_values, condition_code_values);

        let datasets = [];

        for (let i = 0; i < this.dataset_codes.length; i++) {
            datasets.push({
                label: this.dataset_codes[i].display,
                data: calcDatasetPerTypeAndTime(filtered_conditions, this.dataset_codes[i].code, this.timeSpan, 'dateTime', this.threshold),
            });
        }

        // console.log(datasets);

        return {
            datasets: datasets
        }
    }
}

export class LengthOfStayNumberDataProcessor extends DataProcessor {
    process() {
        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code);

        let filteredEncounters = filterEncounters(this.encounters, this.patients, age_group_values, this.timeSpan, false, gender_values);
        // console.log('Filtered encounters: ', filteredEncounters);

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
            unit: ' days',
            details: 'The threshold is ' + this.threshold + ' days. It cuts off all stays longer than ' + this.threshold + ' days.'
        }
    }
}

export class NursingProcedureTypeDataProcessor extends DataProcessor {
    process() {
        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code);
        const code_values = this.dataset_codes.map(c => c.code)

        const filtered_procedures = filterProcedures(this.procedures, this.patients, age_group_values, this.timeSpan, gender_values, code_values);

        let data = calcDatasetsForType(filtered_procedures, 'display', this.top_n, this.threshold);


        return {
            labels: Object.keys(data), datasets: [{
                data: Object.values(data), details: Object.keys(data)
            }],
        }
    }
}

export class NursingProcedureTypeTimeDataProcessor extends DataProcessor {
    process() {
        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code);
        const code_values = this.dataset_codes.map(c => c.code)

        // Standard filter
        const filtered_procedures = filterProcedures(this.procedures, this.patients, age_group_values, this.timeSpan, gender_values, code_values);
        // console.log('filtered procedures: ', filteredProcedures);

        let datasets = [];

        for (let i = 0; i < this.dataset_codes.length; i++) {
            datasets.push({
                label: this.dataset_codes[i].display,
                data: calcDatasetPerTypeAndTime(filtered_procedures, this.dataset_codes[i].code, this.timeSpan, 'performedDateTime', this.threshold),
            });
        }

        // console.log(datasets);

        return {
            datasets: datasets
        }
    }
}

export class RespirationSupportTimeDataProcessor extends DataProcessor {
    process() {
        const age_group_values = this.ageGroups.map(g => g.label);
        const gender_values = this.genders.map(g => g.fhir_code)

        const filtered_observations = filterObservations(this.resp_supp_observations, this.patients, age_group_values, this.timeSpan, gender_values);
        // console.log(filtered_observations);

        const getDataset = () => {
            return calcDatasetPerTime(filtered_observations, this.timeSpan, 'effectiveDateTime');
        }

        const dataset = getDataset();
        // console.log(dataset);

        return {
            datasets: [{
                label: 'Respiratory Support', data: dataset,
            }]
        }
    }
}

// filter functions (used by modifiers):

const filterPatients = (patients, ageGroups, timespan, genders) => {
    console.log('filtering patients');
    console.log(patients, ageGroups, timespan, genders);

    return patients.filter(p => (ageGroups.includes(p.ageGroup) && genders.includes(p.gender)));
}


const filterConditions = (conditions, patients, ageGroups, timespan, genders, condition_code_values) => {
    console.log('Filtering conditions.');
    console.log(conditions, patients, ageGroups, timespan, genders, condition_code_values);

    let filteredConditions = conditions.filter(c => c.dateTime >= timespan[0] && c.dateTime <= timespan[1]);
    let patientsLookup = getPatientsLookup(patients);
    filteredConditions = filteredConditions.filter(c => {
        const patient = patientsLookup[c.subject];
        console.log(c);
        return ageGroups.includes(patient.ageGroup) && genders.includes(patient.gender) && condition_code_values.includes(c.code);
    });
    console.log('Filtered conditions', filteredConditions);

    return filteredConditions;
}


const filterEncounters = (encounters, patients, ageGroups, timespan, endDate, genders) => {
    console.log('Filtering encounters.');
    console.log(encounters, patients, ageGroups, timespan, endDate, genders);

    let filteredEncounters;
    if (endDate) {
        filteredEncounters = encounters.filter(e => e.periodEnd >= timespan[0] && e.periodEnd <= timespan[1])
    } else {
        filteredEncounters = encounters.filter(e => e.periodStart >= timespan[0] && e.periodStart <= timespan[1])

    }
    console.log(filteredEncounters);

    const patientsLookup = getPatientsLookup(patients);
    // console.log('patientsLookup: ', patientsLookup);

    filteredEncounters = filteredEncounters.filter(e => {
        // console.log('enc: ', e);
        const patient = patientsLookup[e.subject];
        if (patient) {
            // console.log(patient);
            return ageGroups.includes(patient.ageGroup) && genders.includes(patient.gender);
        } else {
            // console.error(`Patient ${e.subject} not found.`);
        }
    });
    return filteredEncounters;
}

const filterProcedures = (procedures, patients, ageGroups, timespan, genders, condition_code_values) => {
    console.log('Filtering procedures.');
    console.log(procedures, patients, ageGroups, timespan, genders);

    const patientsLookup = getPatientsLookup(patients);
    console.log(patientsLookup);
    return procedures.filter(p => {
        const patient = patientsLookup[p.subject];
        return p.performedDateTime >= timespan[0] && p.performedDateTime <= timespan[1] && ageGroups.includes(patient.ageGroup) && genders.includes(patient.gender) && condition_code_values.includes(p.code);
    });
}

const filterObservations = (observations, patients, ageGroups, timeSpan, genders) => {
    console.log('Filtering observations.');
    console.log(observations, patients, ageGroups, timeSpan, genders);

    const patientsLookup = getPatientsLookup(patients);
    return observations.filter(o => {
        const patient = patientsLookup[o.subject];
        return o.effectiveDateTime >= timeSpan[0] && o.effectiveDateTime <= timeSpan[1] && ageGroups.includes(patient.ageGroup) && genders.includes(patient.gender);
    });
}

// helper functions:
const getPatientsLookup = (p) => {
    let lookup = {};
    p.forEach(patient => {
        lookup[patient.id] = patient;
    });
    return lookup;
}

function initDatesDataset(timeSpan) {
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

/**
 * Formats a date into a specific string format based on the difference between two dates.
 * If the difference is greater than a certain threshold, the date is formatted as 'MMM YY'. Otherwise, it's formatted as 'DD.MM.YY'.
 * @param {Array} timeSpan - An array containing two dates to calculate the difference from.
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date.
 */
function formatDaysToMonthText(timeSpan, date) {
    if (moment(timeSpan[1]).diff(moment(timeSpan[0]), 'months', true) > getDaysToMonths()) {
        return moment(date).format('MMM YY');
    } else {
        return moment(date).format('DD.MM.YY');
    }
}

function calcDatasetPerTime(resources, time_span, time_att) {
    console.log('Calculating dataset per time / for a time line.');
    console.log(resources, time_span, time_att);
    let sorted_resources = resources.sort((a, b) => a[time_att] - b[time_att]);
    console.log(sorted_resources);

    const dates = initDatesDataset(time_span);

    sorted_resources.forEach(e => {
        let startDate = formatDaysToMonthText(time_span, e[time_att]);
        dates[startDate] = (dates[startDate] || 0) + 1;
    });

    console.log(dates);

    return dates;
}

function calcDatasetPerTypeAndTime(resources, filter_value, time_span, agg_att, threshold = null) {
    // console.log('Calc dataset per time and type:', resources, filter_value, time_span, agg_att, threshold);

    let filteredResources = resources.filter(p => p.code === filter_value);
    let sortedResources = filteredResources.sort((a, b) => a[agg_att] - b[agg_att]);

    let dataset = initDatesDataset(time_span);

    sortedResources.forEach(p => {
        let date = formatDaysToMonthText(time_span, p[agg_att]);
        dataset[date] = (dataset[date] || 0) + 1;
    });

    if (threshold) {
        dataset = filter_datasets_value_threshold(dataset, threshold);
    }

    return dataset;
}

/**
 *
 * @param resources
 * @param agg_attribute
 * @param top_n limits included datasets (inclusive)
 * @param threshold minimal agg value (inclusive) for datasets to be included
 * @returns {{}}
 */
function calcDatasetsForType(resources, agg_attribute, top_n = null, threshold = null) {

    // console.log(`Get dataset per type: ${agg_attribute}.`);

    let datasets = {};

    resources.forEach(resource => {
        const res_agg_att = resource[agg_attribute];

        if (!datasets[res_agg_att]) {
            datasets[res_agg_att] = 0;
        }
        datasets[res_agg_att]++;
    });

    if (threshold) {
        datasets = filter_datasets_value_threshold(datasets, threshold);
    }

    if (top_n) {
        datasets = filter_datasets_top_n(datasets, top_n);
    }

    return datasets;
}

function filter_datasets_value_threshold(datasets, threshold) {
    let ret_datasets = {};

    for (const [dataset_name, dataset_value] of Object.entries(datasets)) {
        if (dataset_value === 0) {
            ret_datasets[dataset_name] = dataset_value;  // keep '0' entries for timeline charts
        } else if (dataset_value >= threshold) {
            ret_datasets[dataset_name] = dataset_value;
        }
    }

    return ret_datasets;
}

function filter_datasets_top_n(datasets, top_n) {
    // console.log(`Filter datasets top n ${top_n}.`);
    // console.log(datasets);
    let filter_values = [];
    for (const dataset_value of Object.values(datasets)) {
        filter_values.push(dataset_value);
    }
    filter_values = filter_values.sort((a, b) => b - a).slice(0, top_n);
    // console.log('filter values: ', filter_values);

    let ret_datasets = {};
    let dataset_count = 0;
    for (const [dataset_name, dataset_value] of Object.entries(datasets)) {
        if (filter_values.includes(dataset_value) && dataset_count < top_n) {
            ret_datasets[dataset_name] = dataset_value;
            dataset_count++;
        }
    }

    return ret_datasets;

}