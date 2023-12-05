// function modified from github.com/henryzt
import moment from "moment";

export function parseAllPatientData(patients) {
    const tableData = [];
    patients.forEach(elementRaw => {
        if (!elementRaw) {
            return null;
        }
        let element = elementRaw.resource;
        let patient = {};
        patient.name = element.name?.[0]?.family + " " + element.name?.[0]?.given?.[0];
        patient.id = element.id; // ID
        patient.phone = element.telecom?.[0]?.value;
        patient.language = element.communication?.[0]?.language?.text;
        patient.maritalStatus = element.maritalStatus?.text;
        patient.address = element.address?.[0]?.line[0];
        patient.city = element.address?.[0]?.city;
        patient.state = element.address?.[0]?.state;
        patient.country = element.address?.[0]?.country;
        patient.gender = element.gender; // Gender
        patient.birthMonth = moment(element.birthDate).format("MMMM");
        patient.age = moment().diff(element.birthDate, "years");
        patient.raw = elementRaw;
        tableData.push(patient);
        // Altersgruppe
        patient.ageGroup = element.extension?.[0]?.extension?.find(e => e.url === "Altersgruppe")?.valueCode;
        // Feststelldatum Altersgruppe
        patient.determinsDateAgeGroup =
            moment(element.extension?.[0]?.extension?.find(e => e.url === "FeststelldatumAltersgruppe")?.valueDate);
    });

    return tableData;
}


export function parseAllConditionData(conditions) {
    const tableData = [];
    conditions.forEach(elementRaw => {
        if (!elementRaw) {
            return null;
        }
        let element = elementRaw.resource;
        let condition = {};
        condition.id = element.id; // ID
        condition.patientID = element.subject?.reference.split("/")[1]; // Patient ID
        condition.assertedDate = moment(element.extension.find(e => e.url.includes("assertedDate")).valueDateTime); // Datum der Feststellung
        condition.extension = element.extension; // Kann man noch weiter aufschlüsseln wenn nötig
        condition.clinicalStatus = element.clinicalStatus?.coding?.[0]?.code; // nötig ?
        condition.code = element.code?.coding?.[0]?.code; // Condition Code
        condition.display = element.code?.coding?.[0]?.display; // Condition Klartext
        condition.codeExtension = element.code?.coding?.[0]?.extension; // Condition Code Extension
        condition.raw = elementRaw;
        tableData.push(condition);
    });

    return tableData;
}