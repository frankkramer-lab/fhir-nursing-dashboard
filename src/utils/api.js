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

function getConditions() {
    return new Promise((resolve, reject) => {
        let localConditions = localStorage.getItem('conditions');
        if (localConditions && !Constants.ALWAYS_LOAD) {
            resolve(JSON.parse(localConditions));
        } else {
            fetch(Constants.API_BASE_URL + 'Condition', {
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
                    const conditions = [];
                    data.entry.map(e =>
                        conditions.push(e.resource)
                    )
                    localStorage.setItem('conditions', JSON.stringify(conditions));
                    resolve(conditions);
                })
        }
    })
}

export {getPatients, getConditions}