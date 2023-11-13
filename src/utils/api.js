const API_BASE_URL = 'https://localhost:9443/fhir-server/api/v4/';
const USER = 'fhiruser';
const PASSWORD = 'change-password';

let patients = [];

function getPatients() {
    return new Promise((resolve, reject) => {
        fetch(API_BASE_URL + 'Patient', {
            headers: {
                "Authorization": "Basic " + btoa(USER + ":" + PASSWORD),
            }
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }
                patients = [];
                data.entry.map(e =>
                    patients.push(e.resource)
                    // "resource": {
                    //  "resourceType": "Patient",
                    //      "id": "18b9470772b-7cc2327b-7337-4142-86bc-26dfc23fc2f5",
                    //      "meta": {
                    //      "versionId": "1",
                    //          "lastUpdated": "2023-11-03T09:08:00.429931Z"
                    //  },
                    //  "birthDate": "1950-08-15"
                    //  ...
                    // },
                )
                resolve(patients);
            })
    })
}

export {getPatients}