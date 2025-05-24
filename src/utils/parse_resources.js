import moment from "moment";
import {AGE_GROUPS} from "./constants";


export function parseOrganizationData(orgs) {
    // console.log('Parsing organizations.')

    let parsed_orgs = {
        'orgs': [],
        'orgs_meta': {},
        'org_ids': [],
        'org_part_of_dest_mapping': {},
        'org_part_of_source_mapping': {},
    }

    orgs.forEach(resource => {
        if (!resource) {
            return null;
        }

        let org = {};

        org.id = resource.id;
        org.name = resource.name;
        org.partOf = resource.partOf?.reference.split('/')[1];

        // update parent org mapping if possible
        if (org.partOf !== undefined) {
            if (!parsed_orgs.org_part_of_dest_mapping[org.partOf]) {
                parsed_orgs.org_part_of_dest_mapping[org.partOf] = [];
            }
            parsed_orgs.org_part_of_dest_mapping[org.partOf].push(org.id);
            parsed_orgs.org_part_of_source_mapping[org.id] = org.partOf;
        }

        parsed_orgs.orgs.push(org);

        parsed_orgs.org_ids.push(org.id);
        parsed_orgs.orgs_meta[org.id] = {
            'id': org.id,
            'name': org.name,
        };
    });

    return parsed_orgs;
}

export function parseLocationData(locations, db_meta) {
    // console.log('Parsing locations.', locations);

    const parsed_locs = {
        'locs': [],
        'locs_meta': {},
        'org_loc_mapping': {},
    }

    locations.forEach(resource => {
        if (!resource) {
            return null;
        }

        // parse Location resource
        let loc = {};

        loc.id = resource.id;
        loc.name = resource.name;
        loc.managingOrganization = resource.managingOrganization?.reference.split('/')[1];

        // update managing org mapping if possible (field exists and managing org (fa) exists)
        let parent_org;
        if (loc.managingOrganization !== undefined && db_meta.fa_org_mapping[loc.managingOrganization]) {
            parent_org = db_meta.fa_org_mapping[loc.managingOrganization];
            if (!parsed_locs.org_loc_mapping[parent_org]) {
                parsed_locs.org_loc_mapping[parent_org] = [];
            }
            parsed_locs.org_loc_mapping[parent_org].push(loc.id);
        }

        parsed_locs.locs.push(loc);
        parsed_locs.locs_meta[loc.id] = {
            'id': loc.id,
            'name': loc.name,
            'parentOrg': parent_org,
            'fa': loc.managingOrganization,
        };
    });

    return parsed_locs;
}

// function modified from github.com/henryzt
export function parsePatientData(patients, db_meta) {
    // console.log('Parsing patient data.');

    const parsed_patients = {};  // saves a list of parsed patients for each org
    db_meta.org_ids.map(org_id => {
        parsed_patients[org_id] = []
    });

    patients.forEach(element => {
        if (!element) {
            return null;
        }
        let patient = {};
        patient.id = element.id; // ID
        patient.managingOrganization = element.managingOrganization?.reference.split('/')[1];
        patient.gender = element.gender; // Gender
        patient.birthMonth = moment(element.birthDate).format("MMMM");
        patient.age = moment().diff(element.birthDate, "years");

        // Altersgruppe
        let determined_age_group = null;
        for (const age_group of AGE_GROUPS) {
            if (age_group.min_age <= patient.age && age_group.max_age >= patient.age) {
                determined_age_group = age_group.label;
                break;
            }
        }
        patient.ageGroup = determined_age_group;

        // add fa and station tag originating from second level encounters that should have been parsed before
        patient.fas = db_meta.patient_fa_mapping[patient.id];
        patient.stations = db_meta.patient_station_mapping[patient.id];

        // Zu Ergebnis hinzufügen
        parsed_patients[patient.managingOrganization].push(patient);
    });

    // console.log('Patient data: ', parsed_patients);
    return parsed_patients;
}

export function parseFirstLevelEncounters(encounters) {
    const parsed_encounters = {};

    encounters.forEach(resource => {
        if (!resource) {
            return null;
        }

        let enc = {};

        enc.id = resource.id;
        enc.subject = resource.subject?.reference.split('/')[1];
        enc.periodStart = Date.parse(resource.period?.start);
        enc.periodEnd = Date.parse(resource.period?.end);
        enc.serviceProvider = resource.serviceProvider?.reference.split('/')[1];

        // add encounter to the encounters of its serviceProvider org
        if (enc.serviceProvider !== undefined) {
            if (!parsed_encounters[enc.serviceProvider]) {
                parsed_encounters[enc.serviceProvider] = [];
            }
            parsed_encounters[enc.serviceProvider].push(enc);
        }
    });

    return parsed_encounters;
}

export function parseSecondLevelEncounters(encounters, db_meta) {
    // console.log('Parsing second level encouters.');
    // console.log(encounters);
    // console.log(db_meta);

    // saves list of encounters for each parent org
    const parsed_encounters = {};
    db_meta.org_ids.map(org_id => {
        parsed_encounters[org_id] = []
    });
    // console.log(parsed_encounters);

    db_meta.patient_fa_mapping = {};  // saves patient -> fa of encountered station mapping
    db_meta.patient_station_mapping = {};  // saves patient -> list of encountered stations mapping
    db_meta.patient_fa_timespans = {};  // saves patient -> timespan including fa mapping
    db_meta.patient_station_timespans = {};  // saves patient -> timespan including station mapping

    encounters.forEach(resource => {
        if (!resource) {
            return null;
        }

        const id = resource.id;
        const subject = resource.subject?.reference.split('/')[1];
        const serviceProvider = resource.serviceProvider?.reference.split('/')[1];  // Fachabteilung (fa)

        // console.log(id, subject, serviceProvider);

        // outer part of encounter resource corresponds to a Fachabteilung (fa) encounter:
        const fa_parent_org = db_meta.fa_org_mapping[serviceProvider];
        // console.log(fa_parent_org);
        if (fa_parent_org) {
            const fa_period_start = Date.parse(resource.period?.start);
            const fa_period_end = Date.parse(resource.period?.end);

            // add fa timespan entry for this patient
            const fa_timespan = {};
            fa_timespan.start = fa_period_start;
            fa_timespan.end = fa_period_end;
            fa_timespan.fa = serviceProvider;
            if (!db_meta.patient_fa_timespans[subject]) {
                db_meta.patient_fa_timespans[subject] = [];
            }
            db_meta.patient_fa_timespans[subject].push(fa_timespan);

            parsed_encounters[fa_parent_org].push({
                'id': id,
                'subject': subject,
                'periodStart': fa_period_start,
                'periodEnd': fa_period_end,
                'fas': serviceProvider,  // tag with fa (serviceProvider)
                'stations': [], // do not tag station encounters with fa index value (=> will not be used for fa encounter charts),
            });
        }


        // location entries correspond to station encounters:
        let location_count = 0;
        for (const location of resource.location) {
            // console.log(location);

            // only add location entries corresponding to a Fachabteilung (fa)
            const station = location.location.reference?.split('/')[1];
            if (db_meta.stations[station]) {
                const fa = db_meta.stations[station].fa;
                const station_parent_org = db_meta.stations[station].parentOrg;
                const station_period_start = Date.parse(location.period?.start);
                const station_period_end = Date.parse(location.period?.end);

                // construct unique id derived from outer resource and used location element count
                const location_element_id = id + '-' + location_count;

                // update patient to encountered fa mapping:
                if (!db_meta.patient_fa_mapping[subject]) {
                    db_meta.patient_fa_mapping[subject] = [];
                }
                if (!db_meta.patient_fa_mapping[subject].includes(fa)) {
                    db_meta.patient_fa_mapping[subject].push(fa);
                }

                // update patient to encountered station mapping:
                if (!db_meta.patient_station_mapping[subject]) {
                    db_meta.patient_station_mapping[subject] = [];
                }
                if (!db_meta.patient_station_mapping[subject].includes(station)) {
                    db_meta.patient_station_mapping[subject].push(station);
                }

                // add station timespan entry for this patient
                const station_timespan = {};
                station_timespan.start = station_period_start;
                station_timespan.end = station_period_end;
                station_timespan.station = station;
                if (!db_meta.patient_station_timespans[subject]) {
                    db_meta.patient_station_timespans[subject] = [];
                }
                db_meta.patient_station_timespans[subject].push(station_timespan);

                parsed_encounters[station_parent_org].push({
                    'id': location_element_id,
                    'subject': subject,
                    'periodStart': station_period_start,
                    'periodEnd': station_period_end,
                    'fas': [],  // do not tag station encounters with fa index value (=> will not be used for fa encounter charts)
                    'stations': station, // tag with station
                });

                location_count++;
            }
        }
    });

    // console.log(parsed_encounters);
    return parsed_encounters;
}


export function parseConditionData(conditions, db_meta) {
    // console.log('Parsing conditions.');
    // console.log(conditions);

    const parsed_conditions = {};  // saves a list of parsed conditions for each parent org
    db_meta.org_ids.map(org_id => {
        parsed_conditions[org_id] = []
    });

    const condition_codes = {};  // save condition codes (code, display value) for each parent org
    db_meta.org_ids.map(org_id => {
        condition_codes[org_id] = []
    });


    let condition_code_count = 0;
    conditions.forEach(element => {
        if (!element) {
            return null;
        }

        const id = element.id;
        const subject = element.subject?.reference.split("/")[1];
        const recorded_date = Date.parse(element.recordedDate);

        for (const code of element.code?.coding) {
            const condition = {};

            const condition_code = code.code;
            const condition_display = code.display;

            condition.id = id + '-' + condition_code_count;
            condition.subject = subject;
            condition.dateTime = recorded_date;
            condition.code = condition_code;
            condition.display = condition_display;

            // tag with fas and stations that encountered this patient / subject
            condition.fas = db_meta.patient_fa_mapping[subject];
            condition.stations = db_meta.patient_station_mapping[subject];

            // add resource to corresponding parent org (parent org of first fa)
            const parent_org = db_meta.fa_org_mapping[condition.fas[0]];

            if (parent_org) {
                parsed_conditions[parent_org].push(condition);

                // add condition key
                condition_codes[parent_org].push({
                    'code': condition_code,
                    'display': condition_display,
                });

                condition_code_count++;
            }
        }

    });

    // console.log(parsed_conditions);

    return {
        'parsed_conditions': parsed_conditions,
        'condition_codes': condition_codes,
    };
}

export function parseCareProblemConditionData(conditions, db_meta) {
    // console.log('Parsing care problem conditions.');
    // console.log(conditions);

    const parsed_conditions = {};  // saves a list of parsed conditions for each parent org
    db_meta.org_ids.map(org_id => {
        parsed_conditions[org_id] = []
    });

    const condition_codes = {};  // save condition codes (code, display value) for each parent org
    db_meta.org_ids.map(org_id => {
        condition_codes[org_id] = []
    });

    conditions.forEach(element => {
        const subject = element.subject?.reference.split("/")[1];
        const onsetDateTime = Date.parse(element.onsetDateTime);
        const id = element.id;

        let condition_code_count = 0;
        for (const code of element.code?.coding) {
            const condition = {};

            const condition_code = code.code;
            const condition_display = code.display;

            condition.id = id + '-' + condition_code_count;
            condition.subject = subject;
            condition.dateTime = onsetDateTime;
            condition.code = condition_code;
            condition.display = condition_display;

            // tag with fas and stations that encountered this patient / subject
            condition.fas = db_meta.patient_fa_mapping[subject];
            condition.stations = db_meta.patient_station_mapping[subject];

            // add resource to corresponding parent org (parent org of first fa)
            const parent_org = db_meta.fa_org_mapping[condition.fas[0]];

            if (parent_org) {
                parsed_conditions[parent_org].push(condition);

                // add condition key
                condition_codes[parent_org].push({
                    'code': condition_code,
                    'display': condition_display,
                });

                condition_code_count++;
            }

            // console.log(condition);

            condition_code_count++;
        }
    })

    return {
        'parsed_conditions': parsed_conditions,
        'condition_codes': condition_codes,
    };
}

export function parseProcedureData(procedures, db_meta) {
    // console.log('Parsing procedures.');
    // console.log(procedures);

    const parsed_procedures = {}  // saves a list of parsed procedures for each parent org;
    db_meta.org_ids.map(org_id => {
        parsed_procedures[org_id] = []
    });

    const procedure_codes = {};  // saves procedure code objects (code, display value) for each parent org;
    db_meta.org_ids.map(org_id => {
        procedure_codes[org_id] = []
    });
    // console.log(procedure_codes);

    procedures.forEach(element => {
        if (!element) {
            return null;
        }

        const procedure_code = element.code?.coding?.[0]?.code;
        const procedure_display = element.code?.coding?.[0]?.display;

        let procedure = {};
        procedure.id = element.id;
        procedure.subject = element.subject?.reference.split("/")[1];
        procedure.code = procedure_code;
        procedure.display = procedure_display;
        procedure.performedDateTime = Date.parse(element.performedPeriod?.start);

        // tag with fa and station where patient was located when the procedure was performed:
        procedure.stations = db_meta.patient_station_timespans[procedure.subject].filter(
            timespan => (timespan.start <= procedure.performedDateTime) && (procedure.performedDateTime <= timespan.end)
        ).map(timespan => timespan.station);
        procedure.fas = procedure.stations.map(station => db_meta.stations[station].fa);

        const parent_org = db_meta.fa_org_mapping[procedure.fas[0]];
        // console.log('Parent org: ', parent_org);
        if (parent_org) {
            parsed_procedures[parent_org].push(procedure);

            // add procedure code
            procedure_codes[parent_org].push({
                'code': procedure_code,
                'display': procedure_display,
            });
        }

    });

    return {
        'parsed_procedures': parsed_procedures,
        'procedure_codes': procedure_codes,
    }
}

export function parseRespiratorySupportObservations(observations, db_meta) {
    // console.log('Parsing Respiratory_Support Observations.');
    // console.log(observations);

    const parsed_observations = {};
    db_meta.org_ids.map(org_id => {
        parsed_observations[org_id] = []
    });

    observations.forEach(element => {
        if (!element) {
            return null;
        }

        let observation = {};
        observation.id = element.id;
        observation.subject = element.subject?.reference.split("/")[1];
        observation.effectiveDateTime = Date.parse(element.effectiveDateTime);

        // tag with fa and station where patient was located when the observation became observed:
        observation.stations = db_meta.patient_station_timespans[observation.subject].filter(
            timespan => (timespan.start <= observation.effectiveDateTime) && (observation.effectiveDateTime <= timespan.end)
        ).map(timespan => timespan.station);
        observation.fas = observation.stations.map(station => db_meta.stations[station].fa);

        const parent_org = db_meta.fa_org_mapping[observation.fas[0]];
        if (parent_org) {
            parsed_observations[parent_org].push(observation);
        }
    });

    return parsed_observations;
}