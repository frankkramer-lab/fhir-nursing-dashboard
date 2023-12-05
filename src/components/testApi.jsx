import React, {useState} from "react";
import {getConditions, getPatients} from "../utils/api";
import TestDiagram from "./testDiagram";
import TestChart from "./testChart";

export default function TestApi() {

    const [patients, setPatients] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [illnesses, setIllnesses] = useState({});

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

    function getPatientById(id) {
        return patients.find(patient => patient.id === id)
    }

    function getIllnesses() {
        const i = {};
        conditions.map(condition => {
            if(i[condition.display] !== undefined){
                if(getPatientById(condition.patientID).gender === "male"){
                    i[condition.display].male++;
                }else{
                    i[condition.display].female++;
                }
            }else{
                i[condition.display]={
                    "male": getPatientById(condition.patientID).gender === "male" ? 1 : 0,
                    "female": getPatientById(condition.patientID).gender === "female" ? 1 : 0,
                }
            }
        });
        console.log(i);
        setIllnesses(i);
    }



    return (
        <>
            <div style={{display: "inline-block", margin: "0 20px", verticalAlign: "top"}}>
                <h1>Test API</h1>
                <button onClick={fetchEverything}>Fetch Everything</button>
                {patients.map((patient) => (
                    <p key={patient.id}>Altersgruppe: {patient.ageGroup}</p>
                ))}
            </div>
            <div style={{display: "inline-block"}}>
                <TestDiagram male={patients.filter(p => p.gender === "male").length}
                             female={patients.filter(p => p.gender === "female").length}/>
            </div>
            <div>
                <button onClick={getIllnesses}>Fetch Labels</button>
                <TestChart
                    labels={Object.keys(illnesses)}
                    male={Object.entries(illnesses).map(([k, v], i) => v.male)}
                    female={Object.entries(illnesses).map(([k, v], i) => v.female)}
                />
            </div>
        </>
    );
}