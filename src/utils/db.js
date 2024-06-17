import moment from "moment/moment";

const dbName = 'MedicalDatabase';
const dbVersion = 3;
const patientsStore = 'patients';
const conditionsStore = 'conditions';
const encountersStore = 'encounters';
const stationEncountersStore = 'stationEncounters';
const proceduresStore = 'procedures';
const observationsStore = 'observations';


// Check if object store (key) has {count} entries
export async function checkIndexedDBFilled(key, count) {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, dbVersion);

        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(key)) {
                console.log('Object store does not exist:', key);
                db.close();
                resolve(false);
                return;
            }

            const transaction = db.transaction(key, 'readonly');
            const objectStore = transaction.objectStore(key);
            const countRequest = objectStore.count();


            countRequest.onsuccess = function () {
                const doesMatch = countRequest.result === count;
                console.log(key + ' count (' + countRequest.result + '/' + count + ') matches:', doesMatch);
                db.close();
                resolve(doesMatch);
            };

            countRequest.onerror = function () {
                console.error('Error counting entries:', countRequest.error);
                db.close();
                reject(countRequest.error);
            };
        };

        openRequest.onerror = function (event) {
            console.error('Error opening database:', event.target.error);
            reject(event.target.error);
        };
    });
}


export function initDB() {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, dbVersion);

        openRequest.onupgradeneeded = function (event) {
            const db = event.target.result;

            // Erstellen oder Aktualisieren des Object Stores
            if (!db.objectStoreNames.contains(patientsStore)) {
                db.createObjectStore(patientsStore, {keyPath: 'id'});
            }
            if (!db.objectStoreNames.contains(conditionsStore)) {
                db.createObjectStore(conditionsStore, {keyPath: 'id'});
            }
            if (!db.objectStoreNames.contains(encountersStore)) {
                db.createObjectStore(encountersStore, {keyPath: 'id'});
            }
            if (!db.objectStoreNames.contains(stationEncountersStore)) {
                db.createObjectStore(stationEncountersStore, {keyPath: 'id'});
            }
            if (!db.objectStoreNames.contains(proceduresStore)) {
                db.createObjectStore(proceduresStore, {keyPath: 'id'});
            }
            if (!db.objectStoreNames.contains(observationsStore)) {
                db.createObjectStore(observationsStore, {keyPath: 'id'});
            }

            console.log('Database upgraded');
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

export function insertPatientsIntoDB(patients) {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, dbVersion);

        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(patientsStore, 'readwrite');
            const objectStore = transaction.objectStore(patientsStore);

            patients.forEach(patient => {
                objectStore.add({
                    id: patient.id,
                    name: patient.name,
                    phone: patient.phone,
                    language: patient.language,
                    maritalStatus: patient.maritalStatus,
                    address: patient.address,
                    city: patient.city,
                    state: patient.state,
                    country: patient.country,
                    gender: patient.gender,
                    birthMonth: patient.birthMonth,
                    age: patient.age,
                    ageGroup: patient.ageGroup,
                    determinedDateAgeGroup: patient.determinedDateAgeGroup.toDate(),
                });
            });

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

export function insertConditionsIntoDB(conditions) {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, dbVersion);


        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(conditionsStore, 'readwrite');
            const objectStore = transaction.objectStore(conditionsStore);

            conditions.forEach(condition => {
                objectStore.add({
                    id: condition.id,
                    patientID: condition.patientID,
                    assertedDate: condition.assertedDate.toDate(),
                    extension: condition.extension,
                    clinicalStatus: condition.clinicalStatus,
                    code: condition.code,
                    display: condition.display,
                    codeExtension: condition.codeExtension,
                });
            });

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

export function insertEncountersIntoDB(encounters, station = false) {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, dbVersion);


        openRequest.onsuccess = function (event) {
            const db = event.target.result;

            let transaction;
            let objectStore;
            if (station) {
                transaction = db.transaction(stationEncountersStore, 'readwrite');
                objectStore = transaction.objectStore(stationEncountersStore);
            } else {
                transaction = db.transaction(encountersStore, 'readwrite');
                objectStore = transaction.objectStore(encountersStore);
            }

            encounters.forEach(encounter => {
                objectStore.add({
                    id: encounter.id,
                    caseNumber: encounter.caseNumber,
                    actCode: encounter.actCode,
                    actCodeDisplay: encounter.actCodeDisplay,
                    levelOfContact: encounter.levelOfContact,
                    typeOfCare: encounter.typeOfCare,
                    patientID: encounter.patientID,
                    periodStart: encounter.periodStart.toDate(),
                    periodEnd: encounter.periodEnd.toDate(),
                    serviceProvider: encounter.serviceProvider,
                    station: encounter.station,
                });
            });

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

export function insertProceduresIntoDB(procedures) {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, dbVersion);


        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(proceduresStore, 'readwrite');
            const objectStore = transaction.objectStore(proceduresStore);

            console.log("entering procedures")

            procedures.forEach(procedure => {
                objectStore.add({
                    id: procedure.id,
                    patientID: procedure.patientID,
                    category: procedure.category,
                    categoryCode: procedure.categoryCode,
                    code: procedure.code,
                    display: procedure.display,
                    performedDateTime: procedure.performedDateTime.toDate(),
                    status: procedure.status,
                });
            });

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

export function insertObservationsIntoDB(observations) {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, dbVersion);


        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(observationsStore, 'readwrite');
            const objectStore = transaction.objectStore(observationsStore);

            observations.forEach(observation => {
                objectStore.add({
                    id: observation.id,
                    patientID: observation.patientID,
                    typeCode: observation.typeCode,// Code
                    typeDisplay: observation.typeDisplay, // display
                    code: observation.code,// Code
                    display: observation.display,// Klartext
                    performedDateTime: observation.performedDateTime.toDate(), // Datum und Zeit
                });
            });

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

export function queryDataFromPatientsDB(query) {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, dbVersion);

        openRequest.onerror = function (event) {
            reject(`Error opening database: ${event.target.error}`);
        };

        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(patientsStore, 'readonly');
            const objectStore = transaction.objectStore(patientsStore);
            const request = objectStore.openCursor();

            const result = [];

            request.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    // Hier werden alle Datensätze standardmäßig zurückgegeben,
                    // es sei denn, es gibt Abfragen nach Geschlecht, Alter usw.
                    const isGenderMatch = !query.gender || cursor.value.gender === query.gender;
                    const isAgeMatch = !query.ageGroups || (query.ageGroups.includes(cursor.value.ageGroup));

                    if (isGenderMatch && isAgeMatch) {
                        result.push(cursor.value);
                    }

                    // Zum nächsten Datensatz im Object Store gehen
                    cursor.continue();
                } else {
                    // Keine weiteren Datensätze vorhanden
                    db.close();
                    resolve(result);
                }
            };

            transaction.onerror = function (event) {
                reject(`Error querying data: ${event.target.error}`);
            };
        };
    });
}


export function getAllDataFromDB(storeName) {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, dbVersion);

        openRequest.onerror = function (event) {
            reject(`Error opening database: ${event.target.error}`);
        };

        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readonly');
            const objectStore = transaction.objectStore(storeName);
            const request = objectStore.getAll();

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