import * as Constants from "./constants";
import {parseAllConditionData, parseAllPatientData} from "./parser";
import {checkIndexedDBExistence, initDB, insertConditionsIntoDB, insertPatientsIntoDB} from "./db";

import React, {createContext, useState, useEffect} from 'react';
import {resolve} from "chart.js/helpers";
import {initCharts} from "./filterData";

export const DataContext = createContext(null);

export const APIWraper = ({children}) => {
    const [loading, setLoading] = useState(true);
    const [charts, setCharts] = useState(null);

    useEffect(() => {
        setLoading(true);
        initDB().then(() => {
            Promise.all([getPatients(), getConditions()]) // Promise.all, um mehrere Promises gleichzeitig auszuführen
                .then(async () => {
                        setCharts(await initCharts());
                    }
                )
                .catch(error => console.error('Fehler:', error))
                .finally(() => setLoading(false)); // loading false, nachdem alle Fetch-Aufrufe abgeschlossen
        });
    }, []);

    if (loading)
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                minHeight: "100vh"
            }}>
                <p>Loading...</p>
            </div>
        );

    return (
        <DataContext.Provider value={{charts}}>
            {children}
        </DataContext.Provider>
    );
};


function fetchAll(url, allResults = [], i = 0) {
    return fetch(url, {
        headers: {
            "Authorization": "Basic " + btoa(Constants.USER + ':' + Constants.PASSWORD),
        }
    })
        .then(async response => {
            const data = await response.json();
            console.log(allResults.length / data.total * 100);

            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
            const resources = data.entry.map(e => e.resource);
            allResults.push(...resources);

            // Reccursion to get all pages
            if (data.link && i <= 99) {
                const next = data.link.find(e => e.relation === 'next');
                if (next) {
                    return fetchAll(next.url, allResults, i+1);
                }
            }

            return (allResults);
        })
}

async function getPatients() {
    // check local DB
    const local = await localDBExists('patients')
    if (local) return;

    // request data from server
    let patients = await fetchAll(Constants.API_BASE_URL + 'Patient' + '?_count=500');

    // save in local DB
    let parsedData = parseAllPatientData(patients)
    await insertPatientsIntoDB(parsedData);
}

async function getConditions() {
    // check local DB
    const local = await localDBExists('conditions')
    if (local) return;

    // request data from server
    let conditions = await fetchAll(Constants.API_BASE_URL + 'Condition' + '?_count=500');
    // save in local DB
    let parsedData = parseAllConditionData(conditions);
    await insertConditionsIntoDB(parsedData);

}

async function localDBExists(key) {
    let localData = await checkIndexedDBExistence(key);
    console.log(localData)
    if (localData && !Constants.ALWAYS_LOAD) {
        return true
    } else {
        return false;
    }
}


export {getPatients, getConditions}