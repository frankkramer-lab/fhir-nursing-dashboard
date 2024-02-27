const dbName = 'MedicalDatabase';
const dbVersion = 1;
const patientsStore = 'patients';
const conditionsStore = 'conditions';


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
                console.log(key + ' count matches:', doesMatch);
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
                const objectStore = db.createObjectStore(patientsStore, {keyPath: 'id'});
            }
            if (!db.objectStoreNames.contains(conditionsStore)) {
                const objectStore = db.createObjectStore(conditionsStore, {keyPath: 'id'});
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
                    determinedDateAgeGroup: patient.determinedDateAgeGroup.calendar(),
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
                    assertedDate: condition.assertedDate.calendar(),
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

export function queryDataFromPatientsDB(query) {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, 1);

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

export function queryDataFromConditionsDB() {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(dbName, 1);

        openRequest.onerror = function (event) {
            reject(`Error opening database: ${event.target.error}`);
        };

        openRequest.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(conditionsStore, 'readonly');
            const objectStore = transaction.objectStore(conditionsStore);
            const request = objectStore.openCursor();

            const result = [];

            request.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    // Hier werden alle Datensätze standardmäßig zurückgegeben
                    result.push(cursor.value);

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