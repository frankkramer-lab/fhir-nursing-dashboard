import * as Constants from "./constants";
import {
    parseConditionData,
    parseEncounterData,
    parsePatientData,
    parseProcedureData,
    parseObservationData
} from "./parser";
import {
    checkIndexedDBFilled,
    initDB,
    insertConditionsIntoDB, insertEncountersIntoDB, insertObservationsIntoDB,
    insertPatientsIntoDB, insertProceduresIntoDB
} from "./db";

import React, {createContext, useState, useEffect} from 'react';
import {initCharts} from "./filterData";
import {getActiveStation, setActiveStation} from "./globalVars";

export const DataContext = createContext(null);

export const APIWraper = ({children}) => {
        const [loading, setLoading] = useState(true);
        const [charts, setCharts] = useState(null);
        const [stationCharts, setStationCharts] = useState(null);
        const [progress, setProgress] = useState(0);

        function updateProgress(p) {
            if (p > progress) {
                setProgress(p);
            }
        }


        useEffect(() => {
            setLoading(true);
            initDB().then(() => {
                Promise.all([
                    getPatients(updateProgress),
                    getConditions(updateProgress),
                    getEncounters(updateProgress, '&type=einrichtungskontakt'),
                    getEncounters(updateProgress, '&type=versorgungsstellenkontakt'),
                    getProcedures(updateProgress),
                    getObservations(updateProgress),
                ]) // Promise.all, um mehrere Promises gleichzeitig auszuführen
                    .then(async () => {
                            console.time("api init charts")
                            setProgress(0);
                            setCharts(await initCharts());
                            setProgress(0);
                            setStationCharts(await initCharts(getActiveStation()));
                            console.timeEnd("api init charts")
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
            <DataContext.Provider value={{charts, stationCharts}}>
                {children}
            </DataContext.Provider>
        );
    }
;

let refetchCounter = 0;

function fetchAll(url, allResults = [], updateProgress) {
    return fetch(url, {
        method: 'GET',
        headers: {
            "Authorization": "Basic " + btoa(Constants.USER + ':' + Constants.PASSWORD),
        },
    })
        .then(async response => {
            const data = await response.json();
            let progress = (allResults.length / data.total * 100);
            console.log(progress);

            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                console.log('error', error);
                // retry
                if (refetchCounter < 10) {
                    refetchCounter++;
                    console.log('retrying ' + refetchCounter);
                    return fetchAll(url, allResults, updateProgress)
                } else {
                    return Promise.reject(error);
                }
            }
            const resources = data.entry.map(e => e.resource);
            allResults.push(...resources);
            updateProgress(progress);

            // Reccursion to get all pages
            if (data.link) {
                refetchCounter = 0;
                const next = data.link.find(e => e.relation === 'next');
                if (next) {
                    return fetchAll(next.url, allResults, updateProgress);
                }
            }

            refetchCounter = 0;
            return (allResults);
        })
}

function fetchDataAmmount(key, query = '') {
    return fetch(Constants.API_BASE_URL + key + '?_count=1' + query, {
        headers: {
            "Authorization": "Basic " + btoa(Constants.USER + ':' + Constants.PASSWORD),
        }
    })
        .then(async response => {
            const data = await response.json();
            return data.total;
        })

}

async function getPatients(updateProgress, query = '') {
    // check local DB
    let dataCount = await fetchDataAmmount('Patient');
    const local = await localDBFilled('patients', dataCount);
    if (local) return;

    // request data from server
    let patients = await fetchAll(Constants.API_BASE_URL + 'Patient?_count=500' + query, [], updateProgress);

    // save in local DB
    let parsedData = parsePatientData(patients)
    await insertPatientsIntoDB(parsedData);
}

async function getConditions(updateProgress, query = '') {
    // check local DB
    // TODO: Adjust
    let dataCount = await fetchDataAmmount('Condition');
    const local = await localDBFilled('conditions', dataCount)
    if (local) return;

    // request data from server
    let conditions = await fetchAll(Constants.API_BASE_URL + 'Condition?_count=1000' + query, [], updateProgress);

    // save in local DB
    let parsedData = parseConditionData(conditions);
    await insertConditionsIntoDB(parsedData);
}

async function getEncounters(updateProgress, query = '') {
    // check local DB
    let dataCount = await fetchDataAmmount('Encounter', query);
    let local;
    if (query.includes('type=einrichtungskontakt')) {
        local = await localDBFilled('encounters', dataCount);
    } else {
        local = await localDBFilled('stationEncounters', dataCount);
    }
    if (local) return;

    // request data from server
    let encounters = await fetchAll(Constants.API_BASE_URL + 'Encounter?_count=500' + query, [], updateProgress);

    // save in local DB
    let parsedData = parseEncounterData(encounters);
    if (query.includes('type=einrichtungskontakt'))
        await insertEncountersIntoDB(parsedData);
    else
        await insertEncountersIntoDB(parsedData, true);


    return parsedData;
}

async function getProcedures(updateProgress, query = '') {
    // check local DB
    // let dataCount = await fetchDataAmmount('Procedure', query);
    // Hardcoded for now - change to dynamic later -> fetched data ammount and local do not match
    const local = await localDBFilled('procedures', 834295);
    if (local) return;

    // request data from server
    let procedures = await fetchAll(Constants.API_BASE_URL + 'Procedure?_count=3000' + query, [], updateProgress);

    // save in local DB
    let parsedData = parseProcedureData(procedures);
    await insertProceduresIntoDB(parsedData);
}

async function getObservations(updateProgress, query = '') {
    // check local DB
    let dataCount = await fetchDataAmmount('Observation', query);
    const local = await localDBFilled('observations', dataCount);
    if (local) return;

    // request data from server
    let observations = await fetchAll(Constants.API_BASE_URL + 'Observation?_count=500' + query, [], updateProgress);

    // save in local DB
    let parsedData = parseObservationData(observations);
    await insertObservationsIntoDB(parsedData);

}

async function localDBFilled(key, count) {
    let localData = await checkIndexedDBFilled(key, count);
    return !!(localData && !Constants.ALWAYS_LOAD);
}


export {getPatients, getConditions}