// function modified from github.com/henryzt
import moment from "moment";

export function parseAllPatientData(patients) {
    const tableData = [];
    patients.forEach(element => {
        if (!element) {
            return null;
        }
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
        // Altersgruppe
        patient.ageGroup = element.extension?.[0]?.extension?.find(e => e.url === "Altersgruppe")?.valueCode;
        // Feststelldatum Altersgruppe
        patient.determinedDateAgeGroup =
            moment(element.extension?.[0]?.extension?.find(e => e.url === "FeststelldatumAltersgruppe")?.valueDate);
        // Zu Ergebnis hinzufügen
        tableData.push(patient);
    });

    return tableData;
}


export function parseAllConditionData(conditions) {
    const tableData = [];
    conditions.forEach(element => {
        if (!element) {
            return null;
        }
        let condition = {};
        condition.id = element.id; // ID
        condition.patientID = element.subject?.reference.split("/")[1]; // Patient ID
        condition.assertedDate = moment(element.extension.find(e => e.url.includes("assertedDate")).valueDateTime); // Datum der Feststellung
        condition.extension = element.extension; // Kann man noch weiter aufschlüsseln wenn nötig
        condition.clinicalStatus = element.clinicalStatus?.coding?.[0]?.code; // nötig ?
        condition.code = element.code?.coding?.[0]?.code; // Condition Code
        condition.display = element.code?.coding?.[0]?.display; // Condition Klartext
        condition.codeExtension = element.code?.coding?.[0]?.extension; // Condition Code Extension
        tableData.push(condition);
    });

    return tableData;
}

export function parseAllEncounterData(encounter) {
    const tableData = [];
    encounter.forEach(element => {
        if (!element) {
            return null;
        }
        let e = {};
        e.id = element.id; // ID
        e.caseNumber = element.identifier?.[0]?.value; // Fallnummer
        e.actCode = element.class?.code; // Typ
        e.actCodeDisplay = element.class?.display; // Typ Ausgeschrieben
        e.levelOfContact = element.type?.[0]?.coding?.[0]?.code; // Kontaktart
        e.typeOfCare = element.type?.[0]?.coding?.[1]?.code; // Pflegeart
        e.patientID = element.subject?.reference.split("/")[1]; // Patient ID
        e.periodStart = moment(element.period?.start); // Startzeit
        e.periodEnd = moment(element.period?.end); // Endzeit
        e.serviceProvider = element.serviceProvider?.reference.split("/")[1]; // Anbieter
        e.station = element.location?.[0]?.location?.display; // Station
        // TODO: complete
        tableData.push(e);
    });

    return tableData;
}

export function parseAllProceduresData(procedures) {
    const tableData = [];
    console.log(procedures);
    procedures.forEach(element => {
        if (!element) {
            return null;
        }
        let p = {};
        p.id = element.id; // ID
        p.patientID = element.subject?.reference.split("/")[1]; // Patient ID
        p.code = element.code?.coding?.[0]?.code; // Code
        p.display = element.code?.coding?.[0]?.display; // Klartext
        p.category = element.category?.coding?.[0]?.display; // Kategorie
        p.categoryCode = element.category?.coding?.[0]?.code; // Kategorie-Code
        p.status = element.status; // Status der Ausführung
        p.performedDateTime = moment(element.performedDateTime); // Datum und Zeit

        tableData.push(p);
    });

    console.log(tableData);
    return tableData;
}