/**
 * This file contains utility functions and classes for filtering and processing data for charts.
 * It includes functions for initializing charts, filtering data based on various criteria, and classes for processing data for different types of charts.
 */

import {
    AdmissionDatesTimeDataProcessor,
    AgeGroupTypeDataProcessor,
    CareProblemConditionTypeDataProcessor, CareProblemConditionTypeTimeDataProcessor,
    ConditionTypeDataProcessor, ConditionTypeTimeDataProcessor,
    DischargeDatesTimeDataProcessor,
    GenderTypeDataProcessor,
    LengthOfStayNumberDataProcessor,
    NursingProcedureTypeDataProcessor,
    NursingProcedureTypeTimeDataProcessor,
    RespirationSupportTimeDataProcessor,
} from "./data_processors";

import {
    AGE_GROUPS, BAR, END_DATE, GENDERS, LINE, LOGINDIVIDUALPROCESSORTIMES, NUMBER, PIE, START_DATE
} from "./constants";
import {
    MAX_DAYS_LENGTH_VALUE_THRESHOLD,
    MIN_RESOURCE_COUNT_PER_DATASET_THRESHOLD,
    ONLY_DISPLAY_TOP_N_DATASETS
} from "./config";
import {
    careProblemConditionCodesStoreName,
    careProblemConditionsStoreName, conditionsCodesStoreName,
    conditionsStoreName,
    faIndexName,
    firstLevelEncountersStoreName,
    getAllDataFromDB,
    getDataFromDBByIndex,
    nursingProcedureCodesStoreName,
    nursingProceduresStoreName,
    patientsStoreName,
    respiratorySupportObservationsStoreName,
    secondLevelEncountersStoreName,
    stationIndexNamae
} from "./db";

// ids of chart (unique!), will be used for identifying selected charts when using modifiers
export const GenderPieChartID = 0;
export const AgeBarChartID = 1;
export const AdmissionDatesLineChartID = 2;
export const ConditionTypePieChartID = 3;
export const CareProblemTypePieChart = 4;
export const DischargeDatesLineChartID = 5;
export const LengthOfStayNumberDisplayID = 6;
export const NursingProceduresTypePieChartID = 8;
export const NursingProceduresTypeTimeLineChartID = 9;
export const RespirationSupportTimeLineChartID = 10;
export const ConditionTypeTimeLineChartID = 11;
export const CareProblemTypeTimeLineChartID = 12;

/**
 * Initializes the charts by loading data, filtering it based on the provided criteria, and initializing the data processors.
 * @param db_name
 * @param data_processor_list
 * @param filter_by
 * @param filter_value
 * @returns {Promise<unknown>} An array of chart objects.
 */
export function initCharts(db_name, data_processor_list, filter_by = null, filter_value = '') {
    return new Promise(async (resolve, reject) => {
        console.log('Initializing charts: ', db_name, data_processor_list, filter_by, filter_value);

        let [patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations] = [null, null, null, null, null, null];

        const procedure_codes = await getAllDataFromDB(db_name, nursingProcedureCodesStoreName);
        const condition_codes = await getAllDataFromDB(db_name, conditionsCodesStoreName);
        const care_problem_condition_codes = await getAllDataFromDB(db_name, careProblemConditionCodesStoreName);
        console.log(procedure_codes, condition_codes, care_problem_condition_codes);

        if (filter_by === null) {
            // load global charts
            [patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations] = await Promise.all([getAllDataFromDB(db_name, patientsStoreName), getAllDataFromDB(db_name, conditionsStoreName), getAllDataFromDB(db_name, careProblemConditionsStoreName), getAllDataFromDB(db_name, firstLevelEncountersStoreName), getAllDataFromDB(db_name, nursingProceduresStoreName), getAllDataFromDB(db_name, respiratorySupportObservationsStoreName),]);
        } else if (filter_by === 'fa') {
            [patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations] = await Promise.all([getDataFromDBByIndex(db_name, patientsStoreName, faIndexName, filter_value), getDataFromDBByIndex(db_name, conditionsStoreName, faIndexName, filter_value), getDataFromDBByIndex(db_name, careProblemConditionsStoreName, faIndexName, filter_value), getDataFromDBByIndex(db_name, secondLevelEncountersStoreName, faIndexName, filter_value), getDataFromDBByIndex(db_name, nursingProceduresStoreName, faIndexName, filter_value), getDataFromDBByIndex(db_name, respiratorySupportObservationsStoreName, faIndexName, filter_value),]);
        } else if (filter_by === 'station') {
            [patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations] = await Promise.all([getDataFromDBByIndex(db_name, patientsStoreName, stationIndexNamae, filter_value), getDataFromDBByIndex(db_name, conditionsStoreName, stationIndexNamae, filter_value), getDataFromDBByIndex(db_name, careProblemConditionsStoreName, stationIndexNamae, filter_value), getDataFromDBByIndex(db_name, secondLevelEncountersStoreName, stationIndexNamae, filter_value), getDataFromDBByIndex(db_name, nursingProceduresStoreName, stationIndexNamae, filter_value), getDataFromDBByIndex(db_name, respiratorySupportObservationsStoreName, stationIndexNamae, filter_value),]);
        } else {
            reject(`Unknown chart filter method ${filter_by} (not null (for global) / fa / station).`)
        }


        // All functions need to take the arguments: patients, conditions, encounters, secondLevelEncounters, nursing_procedures, observations, AGE_GROUPS.map(g => g.label), [STARTDATE, ENDDATE], GENDERS, 0
        console.time("init processors");

        let processor_render_info = [];  // list of processors render info, each entry corresponding to a processors with its data and meta info

        if (data_processor_list.includes(GenderTypeDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init gender processor")

            let genderDataProcessor = new GenderTypeDataProcessor(patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, 0, ONLY_DISPLAY_TOP_N_DATASETS);
            genderDataProcessor.initialize();

            processor_render_info.push({
                title: "Gender", // Title of the chart
                id: GenderPieChartID, // Unique ID
                type: PIE, // Chart type
                p: genderDataProcessor, // Processor
            });

            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init gender processor");
        }

        if (data_processor_list.includes(AgeGroupTypeDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init age processor");

            let ageDataProcessor = new AgeGroupTypeDataProcessor(patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, 0, ONLY_DISPLAY_TOP_N_DATASETS);
            ageDataProcessor.initialize();

            processor_render_info.push({
                title: "Age", id: AgeBarChartID, type: BAR, p: ageDataProcessor,
            });

            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init age processor");
        }

        if (data_processor_list.includes(AdmissionDatesTimeDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init admission processor");

            let admissionDataProcessor = new AdmissionDatesTimeDataProcessor(patients, care_problem_conditions, conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, 0, ONLY_DISPLAY_TOP_N_DATASETS);
            admissionDataProcessor.initialize();

            processor_render_info.push({
                title: "Admission Dates", id: AdmissionDatesLineChartID, type: LINE, p: admissionDataProcessor,
            });

            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init admission processor");
        }

        if (data_processor_list.includes(ConditionTypeDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init condition types processor");

            let conditionTypeDataProcessor = new ConditionTypeDataProcessor(patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, MIN_RESOURCE_COUNT_PER_DATASET_THRESHOLD, ONLY_DISPLAY_TOP_N_DATASETS, condition_codes);
            conditionTypeDataProcessor.initialize();

            processor_render_info.push({
                title: "Conditions", id: ConditionTypePieChartID, type: PIE, p: conditionTypeDataProcessor,
            });

            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init condition types processor");
        }

        if (data_processor_list.includes(ConditionTypeTimeDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init condition type time processor");

            let conditionTypeTimeDataProcessor = new ConditionTypeTimeDataProcessor(patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, MIN_RESOURCE_COUNT_PER_DATASET_THRESHOLD, ONLY_DISPLAY_TOP_N_DATASETS, condition_codes);
            conditionTypeTimeDataProcessor.initialize();

            processor_render_info.push({
                title: "Conditions", id: ConditionTypeTimeLineChartID, type: LINE, p: conditionTypeTimeDataProcessor,
            });

            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init condition type time processor");
        }

        if (data_processor_list.includes(CareProblemConditionTypeDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init care problem diagnoses processor");

            let careProblemConditionDataProcessor = new CareProblemConditionTypeDataProcessor(patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, MIN_RESOURCE_COUNT_PER_DATASET_THRESHOLD, ONLY_DISPLAY_TOP_N_DATASETS, care_problem_condition_codes);
            careProblemConditionDataProcessor.initialize();

            processor_render_info.push({
                title: "Care Problems",
                id: CareProblemTypePieChart,
                type: PIE,
                p: careProblemConditionDataProcessor,
            });

            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init care problem diagnoses processor");
        }

        if (data_processor_list.includes(CareProblemConditionTypeTimeDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init care problem condition type time processor");

            let careProblemConditionTypeTimeDataProcessor = new CareProblemConditionTypeTimeDataProcessor(patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, MIN_RESOURCE_COUNT_PER_DATASET_THRESHOLD, ONLY_DISPLAY_TOP_N_DATASETS, care_problem_condition_codes);
            careProblemConditionTypeTimeDataProcessor.initialize();

            processor_render_info.push({
                title: "Care Problems", id: CareProblemTypeTimeLineChartID, type: LINE, p: careProblemConditionTypeTimeDataProcessor,
            });

            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init care problem condition type time processor");
        }

        if (data_processor_list.includes(DischargeDatesTimeDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init discharge processor");
            let dischargeDataProcessor = new DischargeDatesTimeDataProcessor(patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, 0, ONLY_DISPLAY_TOP_N_DATASETS);
            dischargeDataProcessor.initialize();

            processor_render_info.push({
                title: "Discharge Dates", id: DischargeDatesLineChartID, type: LINE, p: dischargeDataProcessor,
            });

            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init discharge processor");
        }

        if (data_processor_list.includes(LengthOfStayNumberDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init length of stay processor");
            // The threshold is set to 14 days for the LengthOfStayDataProcessor
            let lengthOfStayDataProcessor = new LengthOfStayNumberDataProcessor(patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, MAX_DAYS_LENGTH_VALUE_THRESHOLD, ONLY_DISPLAY_TOP_N_DATASETS);
            lengthOfStayDataProcessor.initialize();

            processor_render_info.push({
                title: "Average Length of Stay",
                id: LengthOfStayNumberDisplayID,
                type: NUMBER,
                p: lengthOfStayDataProcessor,
            });
            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init length of stay processor");
        }

        if (data_processor_list.includes(NursingProcedureTypeDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init nursing nursing_procedures processor per type");

            let nursingProceduresProcessorPerType = new NursingProcedureTypeDataProcessor(patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, MIN_RESOURCE_COUNT_PER_DATASET_THRESHOLD, ONLY_DISPLAY_TOP_N_DATASETS, procedure_codes);
            nursingProceduresProcessorPerType.initialize();

            processor_render_info.push({
                title: "Nursing Procedures",
                id: NursingProceduresTypePieChartID,
                type: PIE,
                p: nursingProceduresProcessorPerType,
            });

            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init nursing nursing_procedures processor per type");
        }

        if (data_processor_list.includes(NursingProcedureTypeTimeDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init nursing nursing_procedures processor per time and type");

            let nursingProceduresProcessorPerTypeAndTime = new NursingProcedureTypeTimeDataProcessor(patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, MIN_RESOURCE_COUNT_PER_DATASET_THRESHOLD, ONLY_DISPLAY_TOP_N_DATASETS, procedure_codes);
            nursingProceduresProcessorPerTypeAndTime.initialize();

            processor_render_info.push({
                title: "Nursing Procedures",
                id: NursingProceduresTypeTimeLineChartID,
                type: LINE,
                p: nursingProceduresProcessorPerTypeAndTime,
            });

            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init nursing nursing_procedures processor per time and type");
        }

        if (data_processor_list.includes(RespirationSupportTimeDataProcessor)) {
            if (LOGINDIVIDUALPROCESSORTIMES) console.time("init artificial respiration processor");

            let artificialRespirationDataProcessor = new RespirationSupportTimeDataProcessor(patients, conditions, care_problem_conditions, encounters, nursing_procedures, resp_supp_observations, AGE_GROUPS, [START_DATE, END_DATE], GENDERS, 0, ONLY_DISPLAY_TOP_N_DATASETS);
            artificialRespirationDataProcessor.initialize();

            processor_render_info.push({
                title: "Respiration Support",
                id: RespirationSupportTimeLineChartID,
                type: LINE,
                p: artificialRespirationDataProcessor,
            });

            if (LOGINDIVIDUALPROCESSORTIMES) console.timeEnd("init artificial respiration processor");
        }

        console.timeEnd("init processors");

        resolve(processor_render_info);
    });
}