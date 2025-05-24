import {
    AdmissionDatesTimeDataProcessor,
    AgeGroupTypeDataProcessor,
    CareProblemConditionTypeDataProcessor,
    CareProblemConditionTypeTimeDataProcessor,
    ConditionTypeDataProcessor,
    ConditionTypeTimeDataProcessor,
    DischargeDatesTimeDataProcessor,
    GenderTypeDataProcessor,
    LengthOfStayNumberDataProcessor,
    NursingProcedureTypeDataProcessor,
    NursingProcedureTypeTimeDataProcessor,
    RespirationSupportTimeDataProcessor,
} from "./data_processors";

// tab values of stats screen
export const GLOBAL_CHARTS_TAB_VALUE = 0;
export const FACHABTEILUNG_CHARTS_TAB_VALUE = 1;
export const STATION_CHARTS_TAB_VALUE = 2;

// default thresholds:
export const MIN_RESOURCE_COUNT_PER_DATASET_THRESHOLD = 1;  // minimal aggregated value (number of individual resources, inclusive) for datasets to be included
export const MAX_DAYS_LENGTH_VALUE_THRESHOLD = 5;  // maximal number (of days) to be included, e.g., in length of stay calculation

// limits datasets displayed by some charts (i.e., encounter codes)
export const ONLY_DISPLAY_TOP_N_DATASETS = 10;

// selection of charts to be shown at a stats screen tab value
export let chart_tab_processors_mapping = {}
chart_tab_processors_mapping[GLOBAL_CHARTS_TAB_VALUE] = [GenderTypeDataProcessor, AgeGroupTypeDataProcessor, AdmissionDatesTimeDataProcessor, DischargeDatesTimeDataProcessor, LengthOfStayNumberDataProcessor, ConditionTypeDataProcessor, ConditionTypeTimeDataProcessor, CareProblemConditionTypeDataProcessor, CareProblemConditionTypeTimeDataProcessor, NursingProcedureTypeTimeDataProcessor, NursingProcedureTypeDataProcessor, RespirationSupportTimeDataProcessor];
chart_tab_processors_mapping[FACHABTEILUNG_CHARTS_TAB_VALUE] = [GenderTypeDataProcessor, AgeGroupTypeDataProcessor, AdmissionDatesTimeDataProcessor, DischargeDatesTimeDataProcessor, LengthOfStayNumberDataProcessor, ConditionTypeDataProcessor, ConditionTypeTimeDataProcessor, CareProblemConditionTypeDataProcessor, CareProblemConditionTypeTimeDataProcessor, NursingProcedureTypeTimeDataProcessor, NursingProcedureTypeDataProcessor, RespirationSupportTimeDataProcessor];
chart_tab_processors_mapping[STATION_CHARTS_TAB_VALUE] = [GenderTypeDataProcessor, AgeGroupTypeDataProcessor, AdmissionDatesTimeDataProcessor, DischargeDatesTimeDataProcessor, LengthOfStayNumberDataProcessor, ConditionTypeDataProcessor, ConditionTypeTimeDataProcessor, CareProblemConditionTypeDataProcessor, CareProblemConditionTypeTimeDataProcessor, NursingProcedureTypeTimeDataProcessor, NursingProcedureTypeDataProcessor, RespirationSupportTimeDataProcessor];

// grouping of charts for stats screen:
export const DEMOGRAPHIC_CHARTS_CHART_GROUP = 1;
export const ENCOUNTER_CHARTS_CHART_GROUP = 2;
export const MEDICAL_NURSING_CHART_GROUP = 3;

export let data_processor_chart_group_mapping = {};
data_processor_chart_group_mapping[DEMOGRAPHIC_CHARTS_CHART_GROUP] = [GenderTypeDataProcessor, AgeGroupTypeDataProcessor]
data_processor_chart_group_mapping[ENCOUNTER_CHARTS_CHART_GROUP] = [AdmissionDatesTimeDataProcessor, DischargeDatesTimeDataProcessor, LengthOfStayNumberDataProcessor];
data_processor_chart_group_mapping[MEDICAL_NURSING_CHART_GROUP] = [ConditionTypeDataProcessor, ConditionTypeTimeDataProcessor, CareProblemConditionTypeDataProcessor, CareProblemConditionTypeTimeDataProcessor, NursingProcedureTypeTimeDataProcessor, NursingProcedureTypeDataProcessor, RespirationSupportTimeDataProcessor];

export const chart_group_headlines = {};
chart_group_headlines[DEMOGRAPHIC_CHARTS_CHART_GROUP] = 'Demographische Daten:';
chart_group_headlines[ENCOUNTER_CHARTS_CHART_GROUP] = 'Bewegungsdaten:';
chart_group_headlines[MEDICAL_NURSING_CHART_GROUP] = 'Ärztliche und pflegerische Daten:';
