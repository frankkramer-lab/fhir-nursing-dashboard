import {useState} from "react";
import {getPatients} from "../utils/api";

export default function TestApi() {

    const [patients, setPatients] = useState([]);

    function listPatients() {
        console.log("listPatients() called");
        getPatients().then((response) => {
            console.log("response: " + response);
            setPatients(response);
        });
    }

    return (
        <>
            <h1>Test API</h1>
            <button onClick={listPatients}>Fetch Patients</button>
            {patients.map((patient) => (
                <p>{patient.birthDate}</p>
            ))}
        </>
    );
}