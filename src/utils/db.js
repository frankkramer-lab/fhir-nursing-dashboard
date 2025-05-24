import {ORG_DB_PREFIX} from "./constants";

const dbVersion = 4;

export const patientsStoreName = 'Patient';
export const conditionsStoreName = 'Condition';
export const conditionsCodesStoreName = 'ConditionCode';  // store codes in db so that db contains entire data model
export const careProblemConditionsStoreName = 'CareProblem';
export const careProblemConditionCodesStoreName = 'CareProblemCode';
export const firstLevelEncountersStoreName = 'FirstLevelEncounter';
export const secondLevelEncountersStoreName = 'SecondLevelEncounter';
export const nursingProceduresStoreName = 'NursingProcedure';
export const nursingProcedureCodesStoreName = 'NursingProcedureCode';
export const respiratorySupportObservationsStoreName = 'RespiratorySupportObservation';

export const faIndexName = 'fa_idx';
export const stationIndexNamae = 'station_idx';

export function getDBNameFromOrgId(org_id) {
    return ORG_DB_PREFIX + org_id;
}

function clearDataOfObjectStore(objectStore) {
    return new Promise((resolve, reject) => {
        const objectStoreRequest = objectStore.clear();

        objectStoreRequest.onerror = (event) => {
            // console.log(`Clearing object store ${objectStore.name} failed.`);
            return reject();
        }

        objectStoreRequest.onsuccess = (event) => {
            // console.log(`Clearing object store ${objectStore.name} finished.`);
            return resolve();
        }
    });
}

function countElementsInObjectStore(objectStore) {
    return new Promise((resolve, reject) => {
        const countRequest = objectStore.count();

        countRequest.onsuccess = (event) => {
            return resolve(event.target.result);
        };

        countRequest.onerror = (event) => {
            return reject(event.target);
        };
    });
}

/**
 * Checks whether local database already contains as many within table / store 'store_name' as specified by 'count'.
 * @param db_name
 * @param store_name
 * @param count
 * @returns {Promise<unknown>}
 */
export async function doesResourceCountMatch(db_name, store_name, count) {
    if (db_name === undefined) {
        throw new Error('Database name undefined.')
    }

    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(db_name, dbVersion);

        openRequest.onsuccess = function (event) {
            const opened_db = event.target.result;
            if (!opened_db.objectStoreNames.contains(store_name)) {
                // console.log('Object store does not exist:', store_name);
                opened_db.close();
                resolve(false);
                return;
            }

            const transaction = opened_db.transaction(store_name, 'readonly');
            const objectStore = transaction.objectStore(store_name);
            const countRequest = objectStore.count();


            countRequest.onsuccess = function () {
                const doesMatch = countRequest.result === count;
                // console.log(store_name + ' count (' + countRequest.result + '/' + count + ') matches:', doesMatch);
                opened_db.close();
                resolve(doesMatch);
            };

            countRequest.onerror = function () {
                console.error('Error counting entries:', countRequest.error);
                opened_db.close();
                reject(countRequest.error);
            };
        };

        openRequest.onerror = function (event) {
            console.error('Error opening database:', event.target.error);
            reject(event.target.error);
        };
    });
}


export function upgradeObjectStores(db_name) {
    if (db_name === undefined) {
        throw new Error('Database name undefined.')
    }

    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(db_name, dbVersion);

        openRequest.onupgradeneeded = function (event) {
            // only fired based on specified version number of database (also see https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/upgradeneeded_event)
            // console.log('Database upgrade needed due to version number.')

            const db = event.target.result;

            // Erstellen oder Aktualisieren des Object Stores und Erstellen von Indexen (https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/createIndex,
            // https://javascript.info/indexeddb#searching)
            if (!db.objectStoreNames.contains(patientsStoreName)) {
                let store = db.createObjectStore(patientsStoreName, {keyPath: 'id'});
                store.createIndex(faIndexName, 'fas', {multiEntry: true});
                store.createIndex(stationIndexNamae, 'stations', {multiEntry: true});
            }
            if (!db.objectStoreNames.contains(conditionsStoreName)) {
                let store = db.createObjectStore(conditionsStoreName, {keyPath: 'id'});
                store.createIndex(faIndexName, 'fas', {multiEntry: true});
                store.createIndex(stationIndexNamae, 'stations', {multiEntry: true});
            }
            if (!db.objectStoreNames.contains(conditionsCodesStoreName)) {
                db.createObjectStore(conditionsCodesStoreName, {keyPath: 'code'});
            }
            if (!db.objectStoreNames.contains(careProblemConditionsStoreName)) {
                let store = db.createObjectStore(careProblemConditionsStoreName, {keyPath: 'id'});
                store.createIndex(faIndexName, 'fas', {multiEntry: true});
                store.createIndex(stationIndexNamae, 'stations', {multiEntry: true});
            }
            if (!db.objectStoreNames.contains(careProblemConditionCodesStoreName)) {
                db.createObjectStore(careProblemConditionCodesStoreName, {keyPath: 'code'});
            }
            if (!db.objectStoreNames.contains(firstLevelEncountersStoreName)) {
                db.createObjectStore(firstLevelEncountersStoreName, {keyPath: 'id'});
            }
            if (!db.objectStoreNames.contains(secondLevelEncountersStoreName)) {
                let store = db.createObjectStore(secondLevelEncountersStoreName, {keyPath: 'id'});
                store.createIndex(faIndexName, 'fas', {multiEntry: true});
                store.createIndex(stationIndexNamae, 'stations', {multiEntry: true});
            }
            if (!db.objectStoreNames.contains(nursingProceduresStoreName)) {
                let store = db.createObjectStore(nursingProceduresStoreName, {keyPath: 'id'});
                store.createIndex(faIndexName, 'fas', {multiEntry: true});
                store.createIndex(stationIndexNamae, 'stations', {multiEntry: true});
            }
            if (!db.objectStoreNames.contains(nursingProcedureCodesStoreName)) {
                db.createObjectStore(nursingProcedureCodesStoreName, {keyPath: 'code'});
            }
            if (!db.objectStoreNames.contains(respiratorySupportObservationsStoreName)) {
                let store = db.createObjectStore(respiratorySupportObservationsStoreName, {keyPath: 'id'});
                store.createIndex(faIndexName, 'fas', {multiEntry: true});
                store.createIndex(stationIndexNamae, 'stations', {multiEntry: true});
            }

            // console.log('Database upgraded.');
            db.close();
            return resolve();
        };

        openRequest.onerror = function (event) {
            console.error('Error opening database:', event.target.error);
            return resolve();
        }

        return resolve();
    });
}

export function insertResourcesIntoDB(db_name, store_name, resources, clear_old_data = false) {
    // console.log(`Inserting resources into db: ${db_name}, ${store_name}.`);
    // console.log(resources, clear_old_data);

    if (db_name === undefined) {
        throw new Error('Database name undefined.')
    }

    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(db_name, dbVersion);

        openRequest.onsuccess = async function (event) {
            const db = event.target.result;
            const transaction = db.transaction(store_name, 'readwrite');
            const objectStore = transaction.objectStore(store_name);

            if (clear_old_data) {
                await clearDataOfObjectStore(objectStore);
            }

            resources.forEach(res => {
                objectStore.put(res);
            });

            // console.log(`Resulting db observations count: ${await countElementsInObjectStore(objectStore)}.`);

            transaction.oncomplete = function () {
                db.close();
            };
            return resolve();
        };

        openRequest.onerror = function (event) {
            console.error('Error opening database:', event.target.error);
            return resolve();
        }
    });
}


export function getAllDataFromDB(db_name, store_name) {
    // console.log(`Get all data from db ${db_name} and store ${store_name}.`)

    if (db_name === undefined) {
        throw new Error('Database name undefined.')
    }

    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(db_name, dbVersion);

        openRequest.onerror = function (event) {
            reject(`Error opening database: ${event.target.error}`);
        };

        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(store_name, 'readonly');
            const objectStore = transaction.objectStore(store_name);
            // console.log(objectStore);
            const request = objectStore.getAll();

            request.onsuccess = function (event) {
                db.close();
                // console.log(`Query result for store ${store_name}: ${request.result}`)
                resolve(request.result);
            };

            transaction.onerror = function (event) {
                reject(`Error querying data: ${event.target.error}`);
            };
        };
    });
}

export function getDataFromDBByIndex(db_name, store_name, index_name, index_filter_value) {
    // console.log('Getting resources from db by index: ', db_name, store_name, index_name, index_filter_value, request.result);

    if (db_name === undefined) {
        throw new Error('Database name undefined.')
    }

    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(db_name, dbVersion);

        openRequest.onerror = function (event) {
            reject(`Error opening database: ${event.target.error}`);
        };

        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(store_name, 'readonly');
            const objectStore = transaction.objectStore(store_name);
            const idx = objectStore.index(index_name);

            const request = idx.getAll(index_filter_value);

            request.onsuccess = function (event) {
                db.close();
                resolve(request.result);
            };

            transaction.onerror = function (event) {
                reject(`Error querying data: ${event.target.error}`);
            };
        };
    });
}

