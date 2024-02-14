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


function fetchAll(url, allResults = []) {
    return fetch(url, {
        headers: {
            "Authorization": "Basic " + btoa(Constants.USER + ':' + Constants.PASSWORD),
        }
    })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
            const resources = data.entry.map(e => e.resource);
            allResults.push(...resources);

            // Reccursion to get all pages
            if (data.link) {
                const next = data.link.find(e => e.relation === 'next');
                if (next) {
                    console.log('next: ' + next.url);
                    return fetchAll(next.url, allResults);
                }
            }

            return (allResults);
        })
}

async function getPatients() {
    let patients = await fetchAll(Constants.API_BASE_URL + 'Patient');
    return parseAllPatientData(patients);
}

async function getConditions() {
    let conditions = await fetchAll(Constants.API_BASE_URL + 'Condition');
    return parseAllConditionData(conditions);
}


export {getPatients, getConditions}