import * as Constants from "./constants";
import {parseAllConditionData, parseAllPatientData} from "./parser";

import React, {createContext, useState, useEffect} from 'react';

export const DataContext = createContext(null);

export const DataProvider = ({children}) => {
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState(null);
    const [conditions, setConditions] = useState(null);

    useEffect(() => {
        setLoading(true);

        Promise.all([getPatients(), getConditions()]) // Promise.all, um mehrere Promises gleichzeitig auszuführen
            .then(([patientsData, conditionsData]) => {
                setPatients(patientsData);
                setConditions(conditionsData);
            })
            .catch(error => console.error('Fehler:', error))
            .finally(() => setLoading(false)); // loading false, nachdem alle Fetch-Aufrufe abgeschlossen
    }, []);

    if (loading) return <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        minHeight: "100vh"
    }}><p>Loading...</p></div>;

    return (
        <DataContext.Provider value={{patients, conditions}}>
            {children}
        </DataContext.Provider>
    );
};


function getPatients() {
    return new Promise((resolve, reject) => {
        let localPatients = localStorage.getItem('patients');
        if (localPatients && !Constants.ALWAYS_LOAD) {
            resolve(JSON.parse(localPatients));
        } else {
            fetch(Constants.API_BASE_URL + 'Patient' + Constants.FIRST100PARAM, {
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
                    const patients = parseAllPatientData(data.entry);
                    /*data.entry.map(e =>
                        patients.push(e.resource)
                    )*/
                    console.log('patients:');
                    console.log(patients);
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
            fetch(Constants.API_BASE_URL + 'Condition' + Constants.FIRST100PARAM, {
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
                    const conditions = parseAllConditionData(data.entry);
                    //data.entry.map(e => conditions.push(e.resource))
                    localStorage.setItem('conditions', JSON.stringify(conditions));
                    console.log('conditions:');
                    console.log(conditions);
                    resolve(conditions);
                })
        }
    })
}


export {getPatients, getConditions}