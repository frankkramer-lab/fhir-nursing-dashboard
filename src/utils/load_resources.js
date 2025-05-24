import {API_BASE_URL, CLEAR_FHIR_DATA_ON_LOAD, PASSWORD, USER} from "./constants";
import {
    careProblemConditionCodesStoreName,
    careProblemConditionsStoreName, conditionsCodesStoreName,
    conditionsStoreName,
    doesResourceCountMatch,
    firstLevelEncountersStoreName,
    getDBNameFromOrgId,
    insertResourcesIntoDB,
    nursingProcedureCodesStoreName,
    nursingProceduresStoreName,
    patientsStoreName, respiratorySupportObservationsStoreName,
    secondLevelEncountersStoreName,
    upgradeObjectStores,
} from './db';
import {
    parseCareProblemConditionData,
    parseConditionData,
    parseFirstLevelEncounters,
    parseLocationData,
    parseRespiratorySupportObservations,
    parseOrganizationData,
    parsePatientData,
    parseProcedureData,
    parseSecondLevelEncounters
} from "./parse_resources";

let refetchCounter = 0;

function fetchAll(url, allResults = [], updateProgress) {
    return fetch(url, {
        method: 'GET', headers: {
            "Authorization": "Basic " + btoa(USER + ':' + PASSWORD),
        },
    }).catch(err => {
        console.error('Error while fetching all resources:', err);
        return Promise.reject(err);
    }).then(async response => {
        const data = await response.json();
        // console.log(data);
        let progress = (allResults.length / data.total * 100);
        // console.log(progress);

        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            console.error('error', error);
            // retry
            if (refetchCounter < 10) {
                refetchCounter++;
                console.error('retrying ' + refetchCounter);
                return fetchAll(url, allResults, updateProgress)
            } else {
                return Promise.reject(error);
            }
        }
        const resources = data.entry.map(e => e.resource);
        allResults.push(...resources);
        updateProgress(progress);

        // Recursion to get all pages
        if (data.link) {
            refetchCounter = 0;
            const next = data.link.find(e => e.relation === 'next');
            if (next) {
                return fetchAll(next.url, allResults, updateProgress);
            }
        }

        refetchCounter = 0;
        return (allResults);
    })
}

/**
 * Fetches one item of a resource type and uses the 'total' key in the fhir bundle to determine the total number
 * of resources of this type.
 * @param key
 * @param query
 * @returns {Promise<*>}
 */
function fetchDataCount(key, query = '') {
    return fetch(API_BASE_URL + key + '?_count=1' + query, {
        headers: {
            "Authorization": "Basic " + btoa(USER + ':' + PASSWORD),
        }
    }).catch(err => {
        console.error('Error while fetching resource count.');
        return 0;
    })
        .then(async response => {
            const data = await response.json();
            return data.total;
        })
}

/**
 * Determines whether additional fhir data should be loaded from fhir server based on resource count and flags.
 * @param db_name
 * @param store_name
 * @param fhir_resource_type FHIR resource type name.
 * @returns {Promise<boolean>}
 */
async function shouldLoadFromFHIRServer(db_name, store_name, fhir_resource_type) {
    if (db_name === undefined) {
        throw new Error('Database name undefined.')
    }

    // Check loading behavior flags.
    if (CLEAR_FHIR_DATA_ON_LOAD) {
        return true;
    }

    // Check if resource count of fhir server and local db match.
    let resource_count = await fetchDataCount(fhir_resource_type);
    return !await doesResourceCountMatch(db_name, store_name, resource_count);
}

/**
 * Ensures that organization data is loaded in database, updates db meta info.
 * @param db_meta
 * @param updateProgress
 * @param fhir_profile
 * @param query
 * @returns {Promise<>}
 */
export async function loadAndInitOrgDatabases(db_meta, updateProgress, fhir_profile, query = '') {
    return new Promise(async (resolve, reject) => {
        // console.log('Initializing org databases.')

        // Fetch org data from FHIR Server
        let fetched_orgs;
        let parsed_orgs;
        try {
            fetched_orgs = await fetchAll(API_BASE_URL + 'Organization' + `?_profile=${fhir_profile}` + query, [], updateProgress);
            parsed_orgs = parseOrganizationData(fetched_orgs);
            // console.log(parsed_orgs);
        } catch (e) {
            return reject(e);
        }

        db_meta.orgs = parsed_orgs.orgs_meta;
        db_meta.org_ids = parsed_orgs.org_ids;
        db_meta.org_db_mapping = {};

        parsed_orgs.org_ids.map((id) => {
            db_meta.org_db_mapping[id] = getDBNameFromOrgId(id)
        });

        // console.log('DB Meta: ', db_meta);

        for (const [org_id, db_name] of Object.entries(db_meta.org_db_mapping)) {
            // console.log('Upgrading db: ', org_id, db_name);

            // first create necessary object store in db
            await upgradeObjectStores(db_name);
        }

        return resolve(db_meta);
    });
}

/**
 * Fetches, parses, and saves a resource type in the corresponding org db.
 * @param db_meta
 * @param fhir_resource_type
 * @param fhir_profile_url
 * @param updateProgress
 * @param query
 * @returns {Promise<void>}
 */
export async function loadResourcesOfType(db_meta, fhir_resource_type, fhir_profile_url, updateProgress, query = '') {
    return new Promise(async (resolve, reject) => {
        const fhir_profile = fhir_profile_url.split('/').pop();  // fhir profile name should be last part of fhir_profile_url

        console.log(`Loading resources of type ${fhir_resource_type} and profile ${fhir_profile}.`);
        // console.log(db_meta);

        // ToDo: Implementation for shouldLoad that checks based on org id.

        // request data from server
        let fetched_resources;
        try {
            fetched_resources = await fetchAll(API_BASE_URL + fhir_resource_type + `?_profile=${fhir_profile_url}` + '&_count=1000' + query, [], updateProgress).catch(e => {
                console.error(e);
                reject(e);
            });
            // console.log(fetched_resources);
        } catch (e) {
            return reject(e);
        }

        switch (fhir_resource_type + '/' + fhir_profile) {
            case 'Organization/ISiKOrganisationFachabteilung':
                const parsed_orgs = parseOrganizationData(fetched_resources);
                db_meta.org_fa_mapping = parsed_orgs.org_part_of_dest_mapping;
                db_meta.fa_org_mapping = parsed_orgs.org_part_of_source_mapping;
                db_meta.fas = parsed_orgs.orgs_meta;

                // console.log('Fas: ', parsed_orgs);
                // console.log('Loading fas finished.');
                break;
            case 'Location/ISiKStandort':
                const parsed_locations = parseLocationData(fetched_resources, db_meta);
                db_meta.org_station_mapping = parsed_locations.org_loc_mapping;
                db_meta.stations = parsed_locations.locs_meta;

                // console.log('Loading locations finished.');
                break;
            case 'Patient/ISiPPflegeempfaenger':
                const org_patient_mapping = {}  // mapping org id -> list of patient ids
                const parsed_patients = parsePatientData(fetched_resources, db_meta);
                // console.log(parsed_patients);

                // insert patients into org db that corresponds to their managing organization
                for (const [org_id, db_name] of Object.entries(db_meta.org_db_mapping)) {
                    await insertResourcesIntoDB(db_name, patientsStoreName, parsed_patients[org_id], db_meta, CLEAR_FHIR_DATA_ON_LOAD);
                    // console.log(`Inserting patients into db ${db_name} finished.`);
                    // save list of patient ids of this org for mapping
                    org_patient_mapping[org_id] = parsed_patients[org_id].map(pat => pat.id);
                }
                db_meta.org_patient_mapping = org_patient_mapping;
                break;
            case 'Encounter/KontaktGesundheitseinrichtung':
                const parsed_first_level_encounters = parseFirstLevelEncounters(fetched_resources);

                // insert into corresponding org db
                for (const [org_id, db_name] of Object.entries(db_meta.org_db_mapping)) {
                    await insertResourcesIntoDB(db_name, firstLevelEncountersStoreName, parsed_first_level_encounters[org_id], CLEAR_FHIR_DATA_ON_LOAD);
                }
                break;
            case 'Encounter/ISiPPflegeepisode':
                const parsed_second_level_encounters = parseSecondLevelEncounters(fetched_resources, db_meta);
                // console.log('Parsed second level encounters: ', parsed_second_level_encounters);

                for (const [org_id, db_name] of Object.entries(db_meta.org_db_mapping)) {
                    // console.log(parsed_second_level_encounters[org_id]);
                    // insert into corresponding org db:
                    await insertResourcesIntoDB(db_name, secondLevelEncountersStoreName, parsed_second_level_encounters[org_id], CLEAR_FHIR_DATA_ON_LOAD);
                }
                break;
            case 'Condition/ISiKDiagnose' :
                const parsed_conditions_and_codes = parseConditionData(fetched_resources, db_meta);

                // insert resources:
                for (const [org_id, db_name] of Object.entries(db_meta.org_db_mapping)) {
                    await insertResourcesIntoDB(db_name, conditionsStoreName, parsed_conditions_and_codes['parsed_conditions'][org_id], CLEAR_FHIR_DATA_ON_LOAD);
                }

                // insert condition codes:
                for (const [org_id, db_name] of Object.entries(db_meta.org_db_mapping)) {
                    await insertResourcesIntoDB(db_name, conditionsCodesStoreName, parsed_conditions_and_codes['condition_codes'][org_id], CLEAR_FHIR_DATA_ON_LOAD);
                }
                break;
            case 'Condition/KBV_PR_MIO_ULB_Condition_Care_Problem':
                const parsed_care_problem_conditions_and_codes = parseCareProblemConditionData(fetched_resources, db_meta);
                // console.log(parsed_care_problem_conditions_and_codes);

                // insert resources:
                for (const [org_id, db_name] of Object.entries(db_meta.org_db_mapping)) {
                    await insertResourcesIntoDB(db_name, careProblemConditionsStoreName, parsed_care_problem_conditions_and_codes['parsed_conditions'][org_id], CLEAR_FHIR_DATA_ON_LOAD);
                }

                // insert condition codes:
                for (const [org_id, db_name] of Object.entries(db_meta.org_db_mapping)) {
                    await insertResourcesIntoDB(db_name, careProblemConditionCodesStoreName, parsed_care_problem_conditions_and_codes['condition_codes'][org_id], CLEAR_FHIR_DATA_ON_LOAD);
                }
                break;
            case 'Procedure/KBV_PR_MIO_ULB_Procedure_Nursing_Measures':
                const parsed_procedures_and_codes = parseProcedureData(fetched_resources, db_meta);
                // console.log('Parsed nursing procedures: ', parsed_procedures_and_codes);

                // insert resources:
                for (const [org_id, db_name] of Object.entries(db_meta.org_db_mapping)) {
                    await insertResourcesIntoDB(db_name, nursingProceduresStoreName, parsed_procedures_and_codes['parsed_procedures'][org_id], CLEAR_FHIR_DATA_ON_LOAD);
                }

                // insert procedure codes:
                for (const [org_id, db_name] of Object.entries(db_meta.org_db_mapping)) {
                    await insertResourcesIntoDB(db_name, nursingProcedureCodesStoreName, parsed_procedures_and_codes['procedure_codes'][org_id], CLEAR_FHIR_DATA_ON_LOAD);
                }
                break;
            case 'Observation/KBV_PR_MIO_ULB_Observation_Respiratory_Support':
                const parsed_observations = parseRespiratorySupportObservations(fetched_resources, db_meta);

                for (const [org_id, db_name] of Object.entries(db_meta.org_db_mapping)) {
                    await insertResourcesIntoDB(db_name, respiratorySupportObservationsStoreName, parsed_observations[org_id], CLEAR_FHIR_DATA_ON_LOAD);
                }
                break;
            default:
                throw new Error(`FHIR type ${fhir_resource_type} and profile ${fhir_profile_url} unknown for method loadResourcesOfType.`);
        }
        return resolve(db_meta);
    });
}
