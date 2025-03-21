import moment from "moment";

// function modified from github.com/henryzt
export function parsePatientData(patients) {
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


export function parseConditionData(conditions) {
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

export function parseEncounterData(encounter) {
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

export function parseProcedureData(procedures) {
    const tableData = [];
    console.log(procedures);
    procedures.forEach(element => {
        if (!element) {
            return null;
        }
        let timeArray = element.extension[0].extension.find(e => e.url.includes("angabeStrukturiert")).extension;
        timeArray.forEach(time => {
            let p = {};
            // p.id = element.id + " " + time.valueDateTime; // ID
            p.id = crypto.randomUUID(); // ID
            p.patientID = element.subject?.reference.split("/")[1]; // Patient ID
            p.code = element.code?.coding?.[0]?.code; // Code
            p.display = element.code?.coding?.[0]?.display; // Klartext
            p.category = element.category?.coding?.[0]?.display; // Kategorie
            p.categoryCode = element.category?.coding?.[0]?.code; // Kategorie-Code
            p.status = element.status; // Status der Ausführung
            p.performedDateTime = moment(time.valueDateTime); // Datum und Zeit

            tableData.push(p);
        });
    });

    console.log(tableData);
    return tableData;
}

export function parseObservationData(observations) {
    const tableData = [];
    observations.forEach(element => {
        if (!element) {
            return null;
        }
        let o = {};
        o.id = element.id; // ID
        o.patientID = element.subject?.reference.split("/")[1]; // Patient ID
        o.typeCode = element.code?.coding?.[0]?.code; // Code
        o.typeDisplay = element.code?.coding?.[0]?.display; // display
        o.code = element.valueCodeableConcept?.coding?.[0]?.code; // Code
        o.display = element.valueCodeableConcept?.coding?.[0]?.display; // Klartext
        o.performedDateTime = moment(element.effectiveDateTime); // Datum und Zeit

        tableData.push(o);
    });

    return tableData;
}