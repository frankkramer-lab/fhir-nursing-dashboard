import React, {useState} from "react";
import {getConditions, getPatients} from "../utils/api";
import TestDiagram from "./testDiagram";
import TestChart from "./testChart";

export default function TestApi() {

    const [patients, setPatients] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [illnesses, setIllnesses] = useState([]);

    function listPatients() {
        console.log("listPatients() called");
        getPatients().then((response) => {
            console.log("response: " + response);
            setPatients(response);
        });
    }

    function listConditions() {
        console.log("listConditions() called");
        getConditions().then((response) => {
            console.log("response: " + response);
            setConditions(response);
        });
    }

    function fetchEverything() {
        listPatients();
        listConditions();
    }

    function getIllnesses() {
        const i = new Set();
        conditions.map((condition) => {
            i.add(condition.code.coding[0].display);
        });
        setIllnesses([...i]);
    }

    return (
        <>
            <div style={{display: "inline-block", margin: "0 20px", verticalAlign: "top"}}>
                <h1>Test API</h1>
                <button onClick={fetchEverything}>Fetch Everything</button>
                {patients.map((patient) => (
                    <p>Altersgruppe: {patient.extension[0].extension[0].valueCode}</p>
                ))}
            </div>
            <div style={{display: "inline-block"}}>
                <TestDiagram male={patients.filter(p => p.gender === "male").length}
                             female={patients.filter(p => p.gender === "female").length}/>
            </div>
            <div>
                <button onClick={getIllnesses}>Fetch Labels</button>
                <TestChart
                    labels={illnesses}
                    data={[0,0,0,0,0,0,0,0,0,0]}/>
            </div>
        </>
    );
}