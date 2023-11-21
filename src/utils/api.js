import * as Constants from "./constants";

function getPatients() {
    return new Promise((resolve, reject) => {
        let localPatients = localStorage.getItem('patients');
        if (localPatients && !Constants.ALWAYS_LOAD) {
            resolve(JSON.parse(localPatients));
        } else {
            fetch(Constants.API_BASE_URL + 'Patient', {
                headers: {
                    "Authorization": "Basic " + btoa(Constants.USER + ":" + Constants.PASSWORD),
                }
            })
                .then(async response => {
                    const data = await response.json();
                    if (!response.ok) {
                        const error = (data && data.message) || response.statusText;
                        return Promise.reject(error);
                    }
                    const patients = [];
                    data.entry.map(e =>
                        patients.push(e.resource)
                    )
                    localStorage.setItem('patients', JSON.stringify(patients));
                    resolve(patients);
                })
        }
    })
}

export {getPatients}