import * as Constants from "./constants";
import {parseAllConditionData, parseAllEncounterData, parseAllPatientData} from "./parser";
import {
    checkIndexedDBFilled,
    initDB,
    insertConditionsIntoDB, insertEncountersIntoDB,
    insertPatientsIntoDB
} from "./db";

import React, {createContext, useState, useEffect} from 'react';
import {initCharts} from "./filterData";

export const DataContext = createContext(null);

export const APIWraper = ({children}) => {
    const [loading, setLoading] = useState(true);
    const [charts, setCharts] = useState(null);
    const [progress, setProgress] = useState(0);

    function updateProgress(p){
        if(p > progress){
            setProgress(p);
        }
    }

    useEffect(() => {
        setLoading(true);
        initDB().then(() => {
            Promise.all([getPatients(updateProgress), getConditions(updateProgress), getEncounters(updateProgress)]) // Promise.all, um mehrere Promises gleichzeitig auszuführen
                .then(async () => {
                        setCharts(await initCharts());
                    }
                )
                .catch(error => console.error('Fehler:', error))
                .finally(() => {
                    setLoading(false);
                    setProgress(0);
                }); // loading false, nachdem alle Fetch-Aufrufe abgeschlossen
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
                <p>Loading... {progress.toFixed(0)}%</p>
            </div>
        );

    return (
        <DataContext.Provider value={{charts}}>
            {children}
        </DataContext.Provider>
    );
};


function fetchAll(url, allResults = [], updateProgress) {
    return fetch(url, {
        headers: {
            "Authorization": "Basic " + btoa(Constants.USER + ':' + Constants.PASSWORD),
        }
    })
        .then(async response => {
            const data = await response.json();
            let progress = (allResults.length / data.total * 100);
            console.log(progress);

            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                return Promise.reject(error);
            }
            const resources = data.entry.map(e => e.resource);
            allResults.push(...resources);
            updateProgress(progress);

            // Reccursion to get all pagesvs yio
            if (data.link) {
                const next = data.link.find(e => e.relation === 'next');
                if (next) {
                    return fetchAll(next.url, allResults, updateProgress);
                }
            }

            return (allResults);
        })
}

function fetchDataAmmount(key) {
    return fetch(Constants.API_BASE_URL + key + '?_count=1', {
        headers: {
            "Authorization": "Basic " + btoa(Constants.USER + ':' + Constants.PASSWORD),
        }
    })
        .then(async response => {
            const data = await response.json();
            return data.total;
        })

}

async function getPatients(updateProgress) {
    // check local DB
    let dataCount = await fetchDataAmmount('Patient');
    const local = await localDBFilled('patients', dataCount);
    if (local) return;

    // request data from server
    let patients = await fetchAll(Constants.API_BASE_URL + 'Patient' + '?_count=500', [], updateProgress);

    // save in local DB
    let parsedData = parseAllPatientData(patients)
    await insertPatientsIntoDB(parsedData);
}

async function getConditions(updateProgress) {
    // check local DB
    // TODO: Adjust
    let dataCount = await fetchDataAmmount('Condition');
    const local = await localDBFilled('conditions', dataCount)
    if (local) return;

    // request data from server
    let conditions = await fetchAll(Constants.API_BASE_URL + 'Condition' + '?_count=2500', [], updateProgress);

    // save in local DB
    let parsedData = parseAllConditionData(conditions);
    await insertConditionsIntoDB(parsedData);
}

async function getEncounters(updateProgress) {
    // check local DB
    let dataCount = await fetchDataAmmount('Encounter');
    const local = await localDBFilled('encounters', dataCount);
    if (local) return;

    // request data from server
    let encounters = await fetchAll(Constants.API_BASE_URL + 'Encounter' + '?_count=500', [], updateProgress);

    // save in local DB
    let parsedData = parseAllEncounterData(encounters);
    await insertEncountersIntoDB(parsedData);
}

async function localDBFilled(key, count) {
    let localData = await checkIndexedDBFilled(key, count);
    if (localData && !Constants.ALWAYS_LOAD) {
        return true
    } else {
        return false;
    }
}


export {getPatients, getConditions}